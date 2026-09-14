import { ListFilter, Maximize2, Minimize2, PackageOpen } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { ApiState } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { nextSort, SortButton, type SortState } from '@/components/SortButton'
import { Tag } from '@/components/Tag'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { REQUEST_STATUS } from '@/lib/requestStatus'
import type { ListResponse, RecordAudit, RequestStatus } from '@/types'

export interface RecordColumn<T> {
  label: string
  /** Makes the column sortable. */
  sortValue?: (row: T) => string
  render: (row: T) => ReactNode
}

/** "13-Sep-2026 10:05 AM" */
export const formatRecordTime = (iso: string) => {
  const d = new Date(iso)
  return `${formatDate(d)} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

/** Added By / Added Time / Modified By / Modified Time columns. */
export function auditColumns<T extends RecordAudit>(): RecordColumn<T>[] {
  return [
    { label: 'Added By', sortValue: (r) => r.added_by, render: (r) => r.added_by },
    { label: 'Added Time', sortValue: (r) => r.added_time, render: (r) => formatRecordTime(r.added_time) },
    { label: 'Modified By', sortValue: (r) => r.modified_by, render: (r) => r.modified_by },
    { label: 'Modified Time', sortValue: (r) => r.modified_time, render: (r) => formatRecordTime(r.modified_time) },
  ]
}

/** Status column for approval-based records (Draft / Pending / Approved …). */
export function requestStatusColumn<T extends { status: RequestStatus; is_draft: boolean }>(label = 'Status'): RecordColumn<T> {
  return {
    label,
    render: (r) => {
      if (r.is_draft) return <Tag>Draft</Tag>
      const meta = REQUEST_STATUS[r.status]
      return <span className={meta.className.includes('fill') ? 'text-success' : meta.className}>{meta.label}</span>
    },
  }
}

/** Row action: "Cancel" link on pending requests. */
export const cancelAction =
  <T extends { id: string; status: RequestStatus }>(onCancel: (id: string) => void) =>
  (row: T) =>
    row.status === 'pending' ? (
      <button type="button" onClick={() => onCancel(row.id)} className="text-xs text-danger hover:underline">
        Cancel
      </button>
    ) : null

interface RecordsViewProps<T extends { id: string }> {
  viewName: string
  state: ApiState<ListResponse<T>>
  columns: RecordColumn<T>[]
  /** Text the search box (Filter) matches against. */
  searchText: (row: T) => string
  /** Restrict rows, e.g. to one letter type. */
  include?: (row: T) => boolean
  onAdd: () => void
  addLabel?: string
  scopeLabel?: string
  /** Extra cell at the end of each row (e.g. Cancel). */
  rowAction?: (row: T) => ReactNode
}

/** Zoho "form records" list: view picker, data scope, Add, full screen, search and a sortable table. */
export function RecordsView<T extends { id: string }>({
  viewName,
  state,
  columns,
  searchText,
  include,
  onAdd,
  addLabel = 'Add Record',
  scopeLabel = 'My Data',
  rowAction,
}: RecordsViewProps<T>) {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState<string>>({ key: '', dir: 1 })

  return (
    <div className={cn('px-5 py-3', expanded && 'fixed inset-0 z-40 overflow-auto bg-page')}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select aria-label="View" defaultValue="default" className={cn(toolbarInputClass, 'w-[260px]')}>
          <option value="default">{viewName}</option>
        </select>
        {query !== null && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records"
            aria-label="Search records"
            className={cn(toolbarInputClass, 'w-64')}
          />
        )}
        <div className="ml-auto flex items-center gap-2">
          <select aria-label="Data scope" defaultValue="default" className={cn(toolbarInputClass, 'w-[200px]')}>
            <option value="default">{scopeLabel}</option>
          </select>
          <Button onClick={onAdd}>{addLabel}</Button>
          <IconButton label={expanded ? 'Exit full screen' : 'Full screen'} onClick={() => setExpanded((v) => !v)}>
            {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </IconButton>
          <IconButton label="Filter" active={query !== null} onClick={() => setQuery((q) => (q === null ? '' : null))}>
            <ListFilter className="size-4" />
          </IconButton>
        </div>
      </div>

      <AsyncContent state={state}>
        {({ items }) => {
          const q = query?.trim().toLowerCase() ?? ''
          const sortValue = columns.find((c) => c.label === sort.key)?.sortValue
          const rows = items.filter((r) => (!include || include(r)) && (!q || searchText(r).toLowerCase().includes(q)))
          if (sortValue) rows.sort((a, b) => sortValue(a).localeCompare(sortValue(b)) * sort.dir)

          return (
            <>
              <div className="overflow-x-auto rounded-lg">
                <table className="w-full min-w-[980px] whitespace-nowrap text-left text-[13px]">
                  <thead className="bg-[#eef1f5]">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.label} className="px-3 py-3 font-normal">
                          {col.sortValue ? (
                            <SortButton label={col.label} active={sort.key === col.label} dir={sort.dir} onClick={() => setSort(nextSort(sort, col.label))} />
                          ) : (
                            col.label
                          )}
                        </th>
                      ))}
                      {rowAction && <th className="px-3 py-3" />}
                    </tr>
                  </thead>
                  {rows.length > 0 && (
                    <tbody className="bg-white">
                      {rows.map((row) => (
                        <tr key={row.id} className="border-b border-divider last:border-0">
                          {columns.map((col) => (
                            <td key={col.label} className="max-w-[320px] truncate px-3 py-3.5">
                              {col.render(row)}
                            </td>
                          ))}
                          {rowAction && <td className="px-3 text-right">{rowAction(row)}</td>}
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>
              {rows.length === 0 && (
                <Card className="mt-2.5">
                  <EmptyState icon={PackageOpen} message="No records found" />
                </Card>
              )}
            </>
          )
        }}
      </AsyncContent>
    </div>
  )
}
