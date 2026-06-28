import { useState, useMemo, type ReactNode, Fragment } from 'react'
import { useTranslation } from '../i18n'
import { SearchInput } from './SearchInput'
import { SectionSpinner } from './Spinner'
import { Select, type SelectOption } from './Select'
import { Switch } from './Switch'
import { Icon } from '../icons'
import { cn } from './cn'
import { GRID_CARD_MIN_WIDTH, GRID_CARD_MAX_WIDTH } from './GridCard'

const FILTER_VISIBILITY_MIN_ITEMS = 6

export interface ToggleFilter {
  key: string
  label: string
  defaultOn?: boolean
}

export interface SortOption {
  key: string
  label?: string
  labelKey?: string
  dir?: 'asc' | 'desc'
}

export interface CardGridProps<T> {
  items: T[]
  renderCard: (item: T) => ReactNode
  getKey: (item: T) => string
  searchFields?: (keyof T)[]
  searchFn?: (item: T, query: string) => boolean
  searchPlaceholder?: string
  filterThreshold?: number
  filters?: ToggleFilter[]
  filterFn?: (item: T, activeFilters: Set<string>) => boolean
  sortOptions?: SortOption[]
  defaultSort?: { key: string; dir: 'asc' | 'desc' }
  sortFn?: (a: T, b: T, key: string, dir: 'asc' | 'desc') => number
  align?: 'start' | 'center'
  loading?: boolean
  emptyState?: ReactNode
  noResultsMessage?: string
  noResultsDescription?: string
  cardSize?: import('./GridCard').GridCardSize
  minColumnWidth?: string
}

function defaultSortCompare<T>(a: T, b: T, key: string, dir: 'asc' | 'desc'): number {
  const aVal = (a as Record<string, unknown>)[key]
  const bVal = (b as Record<string, unknown>)[key]
  let result = 0
  if (typeof aVal === 'string' && typeof bVal === 'string') {
    result = aVal.localeCompare(bVal)
  } else if (typeof aVal === 'number' && typeof bVal === 'number') {
    result = aVal - bVal
  } else {
    result = String(aVal ?? '').localeCompare(String(bVal ?? ''))
  }
  return dir === 'desc' ? -result : result
}

function defaultSearchMatch<T>(item: T, query: string, fields: (keyof T)[]): boolean {
  const lower = query.toLowerCase()
  return fields.some((field) => {
    const val = item[field]
    if (typeof val === 'string') {
      return val.toLowerCase().includes(lower)
    }
    return false
  })
}

export function CardGrid<T>({
  items,
  renderCard,
  getKey,
  searchFields,
  searchFn,
  searchPlaceholder,
  filterThreshold = FILTER_VISIBILITY_MIN_ITEMS,
  filters,
  filterFn,
  sortOptions,
  defaultSort,
  sortFn,
  align = 'start',
  loading,
  emptyState,
  noResultsMessage,
  noResultsDescription,
  cardSize,
  minColumnWidth,
}: CardGridProps<T>) {
  const { t } = useTranslation()

  const showFilterToolbar = filterThreshold === 0 || items.length >= filterThreshold

  const [searchQuery, setSearchQuery] = useState('')
  const hasSearch = !!(searchFields?.length || searchFn)
  const showSearch = hasSearch && showFilterToolbar

  const [filterState, setFilterState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {}
    for (const f of filters ?? []) {
      state[f.key] = f.defaultOn ?? true
    }
    return state
  })

  const toggleFilter = (key: string, checked: boolean) => {
    setFilterState((prev) => ({ ...prev, [key]: checked }))
  }

  const defaultSortKey = defaultSort?.key ?? sortOptions?.[0]?.key ?? ''
  const defaultSortDir = defaultSort?.dir ?? sortOptions?.[0]?.dir ?? 'asc'

  const [sortKey, setSortKey] = useState(defaultSortKey)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir)

  const resolveSortLabel = (opt: SortOption): string => {
    if (opt.label) return opt.label
    const suffix = opt.labelKey ?? opt.key
    const capitalised = suffix.charAt(0).toUpperCase() + suffix.slice(1)
    return t(`mrs.cardGrid.sortBy${capitalised}`)
  }

  const sortSelectOptions = useMemo((): SelectOption[] => {
    return (sortOptions ?? []).map((opt) => ({
      value: opt.key,
      label: resolveSortLabel(opt),
    }))
  }, [sortOptions, t])

  const handleSortChange = (value: string | string[] | null) => {
    if (typeof value !== 'string') return
    const option = sortOptions?.find((o) => o.key === value)
    setSortKey(value)
    if (option?.dir) {
      setSortDir(option.dir)
    }
  }

  const toggleSortDir = () => {
    setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const processedItems = useMemo(() => {
    let result = [...items]

    const query = searchQuery.trim()
    if (query) {
      if (searchFn) {
        result = result.filter((item) => searchFn(item, query))
      } else if (searchFields?.length) {
        result = result.filter((item) => defaultSearchMatch(item, query, searchFields))
      }
    }

    if (filterFn && filters?.length) {
      const active = new Set<string>()
      for (const [key, on] of Object.entries(filterState)) {
        if (on) active.add(key)
      }
      result = result.filter((item) => filterFn(item, active))
    }

    if (sortKey) {
      const comparator = sortFn ?? defaultSortCompare
      result.sort((a, b) => comparator(a, b, sortKey, sortDir))
    }

    return result
  }, [items, searchQuery, searchFn, searchFields, filterFn, filters, filterState, sortKey, sortDir, sortFn])

  const hasItems = items.length > 0
  const hasResults = processedItems.length > 0
  const hasFilters = (filters?.length ?? 0) > 0
  const hasSortOptions = (sortOptions?.length ?? 0) > 0

  const showFilterGroup = showFilterToolbar && hasFilters
  const showSortGroup = showFilterToolbar && hasSortOptions
  const hasToolbar = hasItems && (showSearch || showFilterGroup || showSortGroup)

  return (
    <div className="mrs-card-grid">
      {hasToolbar ? (
        <div className="mrs-card-grid__toolbar-wrap">
          <div className="mrs-card-grid__toolbar">
            {showSearch ? (
              <div className="mrs-card-grid__search">
                <SearchInput
                  inputSize="sm"
                  placeholder={searchPlaceholder ?? t('mrs.cardGrid.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            ) : null}

            {showFilterGroup ? (
              <div className="mrs-card-grid__filter-group">
                <Icon 
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>}
                  emoji="👁️"
                  size={14} 
                  className="mrs-card-grid__filter-icon" 
                />
                {filters?.map((filter) => (
                  <Switch
                    key={filter.key}
                    label={filter.label}
                    checked={filterState[filter.key] ?? true}
                    onCheckedChange={(checked) => toggleFilter(filter.key, checked)}
                  />
                ))}
              </div>
            ) : null}

            {showSortGroup ? (
              <div className="mrs-card-grid__sort-group">
                <Icon 
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>}
                  emoji="↕️"
                  size={14} 
                  className="mrs-card-grid__filter-icon" 
                />
                <div className="mrs-card-grid__sort-select">
                  <Select
                    size="sm"
                    className="mrs-card-grid__sort-select-inner"
                    options={sortSelectOptions}
                    value={sortKey}
                    onValueChange={handleSortChange}
                  />
                </div>
                <button
                  type="button"
                  className="mrs-card-grid__sort-dir"
                  onClick={toggleSortDir}
                  title={sortDir === 'asc' ? t('mrs.cardGrid.sortAsc') : t('mrs.cardGrid.sortDesc')}
                >
                  <Icon 
                    icon={sortDir === 'asc' ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>}
                    emoji={sortDir === 'asc' ? "⬆️" : "⬇️"}
                    size={14} 
                  />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mrs-card-grid__scroll">
        {loading ? (
          <SectionSpinner />
        ) : !hasItems ? (
          <div className="mrs-card-grid__empty">
            {emptyState ?? <p className="mrs-card-grid__empty-text">{t('mrs.cardGrid.empty')}</p>}
          </div>
        ) : !hasResults ? (
          <div className="mrs-card-grid__no-results">
            <div className="mrs-card-grid__no-results-icon">
              <Icon 
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>}
                emoji="🎛️"
                size={32} 
              />
            </div>
            <p className="mrs-card-grid__no-results-msg">
              {noResultsMessage ?? t('mrs.cardGrid.noResults')}
            </p>
            {noResultsDescription ? (
              <p className="mrs-card-grid__no-results-desc">{noResultsDescription}</p>
            ) : null}
          </div>
        ) : (
          <div 
            className={cn('mrs-card-grid__cards', align === 'center' && 'mrs-card-grid__cards--center')}
            style={(() => {
              const vars: Record<string, string> = {}
              if (minColumnWidth) {
                vars['--mrs-card-grid-min'] = minColumnWidth
              } else if (cardSize) {
                vars['--mrs-card-grid-min'] = `${GRID_CARD_MIN_WIDTH[cardSize]}px`
                vars['--mrs-card-grid-item-max'] = `${GRID_CARD_MAX_WIDTH[cardSize]}px`
              }
              return Object.keys(vars).length > 0 ? vars as React.CSSProperties : undefined
            })()}
          >
            {processedItems.map((item) => (
              <Fragment key={getKey(item)}>
                {renderCard(item)}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
