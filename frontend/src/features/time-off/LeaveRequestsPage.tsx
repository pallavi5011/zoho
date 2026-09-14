import { CalendarX2, ListFilter } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent } from '@/components/AsyncContent'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { paginate, Pagination } from '@/components/Pagination'
import { nextSort, SortButton, type SortState } from '@/components/SortButton'
import { ApplyLeaveModal } from '@/features/time-off/components/ApplyLeaveModal'
import { REQUEST_STATUS, REQUEST_STATUS_FILTERS } from '@/lib/requestStatus'
import { cn } from '@/lib/cn'
import { formatDate, parseDateKey } from '@/lib/date'
import { useLeaveRequests, useLeaveStore } from '@/store/requests'
import type { LeaveRequest, RequestStatus } from '@/types'

type SortKey = 'employee' | 'leave_type_name' | 'from_date'

const SORT_VALUE: Record<SortKey, (r: LeaveRequest) => string> = {
  employee: (r) => r.employee.full_name,
  leave_type_name: (r) => r.leave_type_name,
  from_date: (r) => r.from_date,
}

const fmt = (key: string) => formatDate(parseDateKey(key))

export function LeaveRequestsPage() {
  const requests = useLeaveRequests()
  const cancel = useLeaveStore((s) => s.cancel)
  const [status, setStatus] = useState<RequestStatus | 'all'>('all')
  const [query, setQuery] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState<SortKey>>({ key: 'from_date', dir: -1 })
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [applyOpen, setApplyOpen] = useState(false)

  return (
    <div className="px-5 py-3">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select aria-label="Module" defaultValue="leave" className={cn(toolbarInputClass, 'w-[260px]')}>
          <option value="leave">Leave</option>
        </select>
        {query !== null && (
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search by leave type or reason"
            aria-label="Search requests"
            className={cn(toolbarInputClass, 'w-64')}
          />
        )}
        <div className="ml-auto flex items-center gap-2">
          <select
            aria-label="Request status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as RequestStatus | 'all')
              setPage(0)
            }}
            className={cn(toolbarInputClass, 'w-[200px]')}
          >
            {REQUEST_STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <Button onClick={() => setApplyOpen(true)}>Add Request</Button>
          <IconButton label="Filter" active={query !== null} onClick={() => setQuery((q) => (q === null ? '' : null))}>
            <ListFilter className="size-4" />
          </IconButton>
        </div>
      </div>

      <AsyncContent state={requests}>
        {({ items }) => {
          const q = query?.trim().toLowerCase() ?? ''
          const filtered = items.filter(
            (r) => (status === 'all' || r.status === status) && (!q || `${r.leave_type_name} ${r.reason ?? ''}`.toLowerCase().includes(q)),
          )
          const sorted = [...filtered].sort((a, b) => SORT_VALUE[sort.key](a).localeCompare(SORT_VALUE[sort.key](b)) * sort.dir)
          const { current, rows } = paginate(sorted, page, pageSize)

          return (
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              {rows.length === 0 ? (
                <EmptyState icon={CalendarX2} message="No leave requests found" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] whitespace-nowrap text-left text-[13px]">
                    <thead className="bg-[#eef1f5]">
                      <tr>
                        <th className="px-4 py-3 font-normal">Status</th>
                        <th className="px-3 py-3 font-normal">
                          <SortButton label="Employee Name" active={sort.key === 'employee'} dir={sort.dir} onClick={() => setSort(nextSort(sort, 'employee'))} />
                        </th>
                        <th className="px-3 py-3 font-normal">
                          <SortButton label="Leave type" active={sort.key === 'leave_type_name'} dir={sort.dir} onClick={() => setSort(nextSort(sort, 'leave_type_name'))} />
                        </th>
                        <th className="px-3 py-3 font-normal">Type</th>
                        <th className="px-3 py-3 font-normal">
                          <SortButton label="Leave period" active={sort.key === 'from_date'} dir={sort.dir} onClick={() => setSort(nextSort(sort, 'from_date'))} />
                        </th>
                        <th className="px-3 py-3 font-normal">Days/hours taken</th>
                        <th className="px-3 py-3 font-normal">Date of request</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const meta = REQUEST_STATUS[r.status]
                        const StatusIcon = meta.icon
                        return (
                          <tr key={r.id} className="border-b border-divider last:border-0">
                            <td className="px-4 py-4">
                              <span title={meta.label} className="inline-flex">
                                <StatusIcon className={cn('size-5', meta.className)} aria-label={meta.label} />
                              </span>
                            </td>
                            <td className="px-3">
                              {r.employee.employee_id}-<strong className="font-bold">{r.employee.full_name}</strong>
                            </td>
                            <td className="px-3">{r.leave_type_name}</td>
                            <td className="px-3">{r.pay_type}</td>
                            <td className="px-3">
                              {fmt(r.from_date)} - {fmt(r.to_date)}
                            </td>
                            <td className="px-3">{r.days} Day(s)</td>
                            <td className="px-3">{fmt(r.requested_on)}</td>
                            <td className="px-4 text-right">
                              {r.status === 'pending' && (
                                <button type="button" onClick={() => cancel(r.id)} className="text-xs text-danger hover:underline">
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <Pagination
                total={sorted.length}
                page={current}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setPage(0)
                }}
              >
                Total Record Count : <span className="text-brand">{filtered.length}</span>
              </Pagination>
            </div>
          )
        }}
      </AsyncContent>

      {applyOpen && <ApplyLeaveModal onClose={() => setApplyOpen(false)} />}
    </div>
  )
}
