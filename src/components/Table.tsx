import { Fragment, useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { cn } from './cn'

export interface TableColumn<Row> {
  /** Stable column id (and React key). */
  key: string
  header: ReactNode
  /** Cell renderer for a row. */
  render: (row: Row) => ReactNode
  /** Provide a comparable value to make the column sortable. */
  sortValue?: (row: Row) => string | number
  align?: 'left' | 'right' | 'center'
}

/** Per-row semantic emphasis, themed via the `--color-*` tokens. */
export type TableRowVariant = 'default' | 'muted' | 'selected'

export interface TableProps<Row> {
  columns: TableColumn<Row>[]
  data: Row[]
  /** Stable key per row. */
  rowKey: (row: Row, index: number) => string | number
  /** Zebra striping. Defaults to `true`. */
  striped?: boolean
  /** Shown in place of rows when `data` is empty. Defaults to `"No data"`. */
  empty?: ReactNode
  /**
   * Whole-row click. The row shows a pointer affordance + hover state. Clicks that
   * originate from interactive cell content (buttons, links, form controls, the
   * disclosure toggle) do **not** fire this handler, so in-cell controls keep working.
   */
  onRowClick?: (row: Row, index: number) => void
  /**
   * Render an expandable detail region beneath a row. When provided, a leading
   * disclosure column appears; the table owns the per-row open/closed state and the
   * toggle, and renders the returned node in a full-width row directly below.
   */
  renderExpanded?: (row: Row) => ReactNode
  /** Per-row semantic emphasis (`muted` / `selected`), themed via tokens. */
  rowVariant?: (row: Row, index: number) => TableRowVariant
  className?: string
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null

/** Click targets that should suppress a whole-row `onRowClick`. */
const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, label, [role="button"]'

/**
 * Opinionated data table: a column-config API with optional per-column sorting,
 * zebra striping, a sticky header, and an empty state — styled on the theme tokens.
 *
 * Supports whole-row clicks (`onRowClick`, guarded against in-cell controls), an
 * expandable per-row detail region (`renderExpanded`, with a kit-owned disclosure
 * toggle), and per-row emphasis (`rowVariant`). Columns are an ordinary array, so a
 * dynamic column set can be built at render time.
 */
export function Table<Row>({
  columns,
  data,
  rowKey,
  striped = true,
  empty = 'No data',
  onRowClick,
  renderExpanded,
  rowVariant,
  className,
}: TableProps<Row>) {
  const [sort, setSort] = useState<SortState>(null)
  const [openRows, setOpenRows] = useState<Set<string | number>>(() => new Set())

  const sorted = useMemo(() => {
    if (sort === null) return data
    const col = columns.find((c) => c.key === sort.key)
    if (col?.sortValue == null) return data
    const sortValue = col.sortValue
    return [...data].sort((a, b) => {
      const av = sortValue(a)
      const bv = sortValue(b)
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, columns, sort])

  function toggleSort(col: TableColumn<Row>) {
    if (col.sortValue == null) return
    setSort((prev) =>
      prev !== null && prev.key === col.key
        ? { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key: col.key, dir: 'asc' },
    )
  }

  function toggleRow(key: string | number) {
    setOpenRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleRowClick(row: Row, index: number, e: MouseEvent<HTMLTableRowElement>) {
    if (onRowClick == null) return
    if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR) != null) return
    onRowClick(row, index)
  }

  const expandable = renderExpanded != null
  const totalCols = columns.length + (expandable ? 1 : 0)

  return (
    <div className={cn('mrs-table-wrap', className)}>
      <table className="mrs-table">
        <thead>
          <tr>
            {expandable ? <th className="mrs-table__expand-cell" aria-hidden="true" /> : null}
            {columns.map((col) => {
              const sortable = col.sortValue != null
              const activeDir = sort !== null && sort.key === col.key ? sort.dir : null
              return (
                <th
                  key={col.key}
                  className={cn(col.align != null && `mrs-table__cell--${col.align}`)}
                  aria-sort={
                    activeDir === null
                      ? undefined
                      : activeDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                  }
                >
                  {sortable ? (
                    <button
                      type="button"
                      className="mrs-table__sort"
                      onClick={() => toggleSort(col)}
                    >
                      {col.header}
                      <span className="mrs-table__sort-icon" aria-hidden="true">
                        {activeDir === null ? '↕' : activeDir === 'asc' ? '▲' : '▼'}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className={cn(striped && 'mrs-table__body--striped')}>
          {sorted.length === 0 ? (
            <tr>
              <td className="mrs-table__empty" colSpan={totalCols}>
                {empty}
              </td>
            </tr>
          ) : (
            sorted.map((row, index) => {
              const key = rowKey(row, index)
              const variant = rowVariant?.(row, index) ?? 'default'
              const isOpen = expandable && openRows.has(key)
              return (
                <Fragment key={key}>
                  <tr
                    className={cn(
                      variant !== 'default' && `mrs-table__row--${variant}`,
                      onRowClick != null && 'mrs-table__row--clickable',
                    )}
                    onClick={
                      onRowClick != null ? (e) => handleRowClick(row, index, e) : undefined
                    }
                  >
                    {expandable ? (
                      <td className="mrs-table__expand-cell">
                        <button
                          type="button"
                          className="mrs-table__expand-toggle"
                          aria-expanded={isOpen}
                          aria-label={isOpen ? 'Collapse row' : 'Expand row'}
                          onClick={() => toggleRow(key)}
                        >
                          <span
                            className={cn(
                              'mrs-table__expand-chevron',
                              isOpen && 'mrs-table__expand-chevron--open',
                            )}
                            aria-hidden="true"
                          >
                            ›
                          </span>
                        </button>
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(col.align != null && `mrs-table__cell--${col.align}`)}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                  {isOpen ? (
                    <tr className="mrs-table__expanded-row">
                      <td className="mrs-table__expanded-cell" colSpan={totalCols}>
                        {renderExpanded(row)}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
