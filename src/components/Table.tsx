import { useMemo, useState, type ReactNode } from 'react'
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

export interface TableProps<Row> {
  columns: TableColumn<Row>[]
  data: Row[]
  /** Stable key per row. */
  rowKey: (row: Row, index: number) => string | number
  /** Zebra striping. Defaults to `true`. */
  striped?: boolean
  /** Shown in place of rows when `data` is empty. Defaults to `"No data"`. */
  empty?: ReactNode
  className?: string
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null

/**
 * Opinionated data table: a column-config API with optional per-column sorting,
 * zebra striping, a sticky header, and an empty state — styled on the theme tokens.
 */
export function Table<Row>({
  columns,
  data,
  rowKey,
  striped = true,
  empty = 'No data',
  className,
}: TableProps<Row>) {
  const [sort, setSort] = useState<SortState>(null)

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

  return (
    <div className={cn('mrs-table-wrap', className)}>
      <table className="mrs-table">
        <thead>
          <tr>
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
              <td className="mrs-table__empty" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          ) : (
            sorted.map((row, index) => (
              <tr key={rowKey(row, index)}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(col.align != null && `mrs-table__cell--${col.align}`)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
