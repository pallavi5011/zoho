import { Ellipsis, ListFilter, Send } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent } from '@/components/AsyncContent'
import { Button } from '@/components/Button'
import { DateStepper } from '@/components/DateStepper'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { RegularizationModal } from '@/features/attendance/components/RegularizationModal'
import { cn } from '@/lib/cn'
import { formatDate, formatMinutes, formatTime, monthShort, pad, parseDateKey, toMinutes } from '@/lib/date'
import { REQUEST_STATUS, REQUEST_STATUS_FILTERS } from '@/lib/requestStatus'
import { useRegularizationStore, useRegularizations } from '@/store/requests'
import type { RequestStatus } from '@/types'

export function RegularizationPage() {
  const regularizations = useRegularizations()
  const cancel = useRegularizationStore((s) => s.cancel)
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [status, setStatus] = useState<RequestStatus | 'all'>('pending')
  const [formOpen, setFormOpen] = useState(false)

  const monthKey = `${month.getFullYear()}-${pad(month.getMonth() + 1)}`
  const shiftMonth = (dir: 1 | -1) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + dir, 1))

  return (
    <div className="px-5 py-3">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span />
        <DateStepper label={`${monthShort(month)} ${month.getFullYear()}`} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />
        <div className="flex justify-end gap-2">
          <select
            aria-label="Request status"
            value={status}
            onChange={(e) => setStatus(e.target.value as RequestStatus | 'all')}
            className={cn(toolbarInputClass, 'w-[200px]')}
          >
            {REQUEST_STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <Button onClick={() => setFormOpen(true)}>Add Request</Button>
          <IconButton label="Filter">
            <ListFilter className="size-4" />
          </IconButton>
          <IconButton label="More actions">
            <Ellipsis className="size-4" />
          </IconButton>
        </div>
      </div>

      <AsyncContent state={regularizations}>
        {({ items }) => {
          const list = items.filter((r) => r.date.startsWith(monthKey) && (status === 'all' || r.status === status))

          return (
            <>
              <div className="overflow-hidden rounded-lg border border-line bg-white">
                {list.length === 0 ? (
                  <EmptyState icon={Send} message="No regularization requests have been raised currently" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] whitespace-nowrap text-left text-[13px]">
                      <thead className="bg-[#eef1f5]">
                        <tr>
                          {['Status', 'Date', 'Check-in', 'Check-out', 'Total Hours', 'Reason', 'Requested on', ''].map((col, i) => (
                            <th key={i} className="px-4 py-3 font-normal">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((r) => {
                          const meta = REQUEST_STATUS[r.status]
                          const StatusIcon = meta.icon
                          return (
                            <tr key={r.id} className="border-b border-divider last:border-0">
                              <td className="px-4 py-3.5">
                                <span title={meta.label} className="inline-flex">
                                  <StatusIcon className={cn('size-5', meta.className)} aria-label={meta.label} />
                                </span>
                              </td>
                              <td className="px-4">{formatDate(parseDateKey(r.date))}</td>
                              <td className="px-4">{formatTime(r.check_in)}</td>
                              <td className="px-4">{formatTime(r.check_out)}</td>
                              <td className="px-4">{formatMinutes(toMinutes(r.check_out) - toMinutes(r.check_in))} Hrs</td>
                              <td className="max-w-[240px] truncate px-4">{r.reason ?? '-'}</td>
                              <td className="px-4">{formatDate(parseDateKey(r.requested_on))}</td>
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
              </div>
              <p className="mt-3 text-[13px]">
                Total Record Count : <span className="text-brand">{list.length}</span>
              </p>
            </>
          )
        }}
      </AsyncContent>

      {formOpen && <RegularizationModal onClose={() => setFormOpen(false)} />}
    </div>
  )
}
