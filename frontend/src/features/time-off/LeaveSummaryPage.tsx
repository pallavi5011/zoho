import { CalendarDays, Ellipsis, Info, List, Plane } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { DateStepper } from '@/components/DateStepper'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { LeaveTypeIcon } from '@/components/LeaveTypeIcon'
import { CalendarChip, MonthGrid } from '@/components/MonthGrid'
import { ApplyLeaveModal } from '@/features/time-off/components/ApplyLeaveModal'
import { isActiveRequest, REQUEST_STATUS } from '@/lib/requestStatus'
import { useLeaveRequests } from '@/store/requests'
import { cn } from '@/lib/cn'
import { formatDate, monthShort, parseDateKey, toDateKey, weekdayLong } from '@/lib/date'
import type { CurrentUser, HolidayDetail, LeaveBalance, LeaveSummary, ListResponse } from '@/types'

interface SummaryEvent {
  key: string
  date: string
  kind: 'leave' | 'holiday'
  title: string
  detail: string | null
}

type EventFilter = 'both' | 'leave' | 'holiday'

function EventsCard({ period, events }: { period: 'Upcoming' | 'Past'; events: SummaryEvent[] }) {
  const [filter, setFilter] = useState<EventFilter>('both')
  const options: { value: EventFilter; label: string }[] = [
    { value: 'both', label: `${period} Leaves & Holidays` },
    { value: 'leave', label: `${period} Leaves` },
    { value: 'holiday', label: `${period} Holidays` },
  ]
  const list = events.filter((e) => filter === 'both' || e.kind === filter)
  const selectedLabel = options.find((o) => o.value === filter)?.label ?? ''

  return (
    <Card className="p-5 text-[13px]">
      <select aria-label={`${period} events`} value={filter} onChange={(e) => setFilter(e.target.value as EventFilter)} className={cn(toolbarInputClass, 'w-[240px]')}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {list.length === 0 ? (
        <p className="py-8 text-center text-muted">No {selectedLabel.toLowerCase()} for this period</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border border-divider">
            <tbody>
              {list.map((event) => {
                const date = parseDateKey(event.date)
                const Icon = event.kind === 'holiday' ? CalendarDays : Plane
                return (
                  <tr key={event.key} className="border-b border-divider">
                    <td className="w-[40%] border-r border-divider px-3 py-3">
                      {formatDate(date)}, {weekdayLong(date)}
                    </td>
                    <td className="border-r border-divider px-3">
                      <span className="flex items-center gap-2">
                        <Icon className={cn('size-4', event.kind === 'holiday' ? 'text-muted' : 'text-danger')} strokeWidth={1.5} />
                        {event.title}
                      </span>
                    </td>
                    <td className="w-[25%] px-3 text-muted">{event.detail}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function BalanceCard({ balance }: { balance: LeaveBalance }) {
  return (
    <Card className="w-[196px] p-4 text-[13px]">
      <p className="text-center font-bold">{balance.name}</p>
      <LeaveTypeIcon code={balance.code} color={balance.color} className="mx-auto mt-3 size-11" />
      <div className="mt-5 flex justify-between">
        <span>Available</span>
        <span className={cn(balance.available > 0 && 'text-success')}>{balance.available}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span>Booked</span>
        <span className="flex items-center gap-1.5 font-bold">
          {balance.booked}
          <Info className="size-3.5 text-muted" aria-label="Booked includes approved and pending leave" />
        </span>
      </div>
    </Card>
  )
}

export function LeaveSummaryPage() {
  const balances = useApi<ListResponse<LeaveBalance>>('/leave/balances')
  const summary = useApi<LeaveSummary>('/leave/summary')
  const holidays = useApi<ListResponse<HolidayDetail>>('/holidays')
  const me = useApi<CurrentUser>('/me')
  const requests = useLeaveRequests()
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [anchor, setAnchor] = useState(() => new Date())
  const [applyOpen, setApplyOpen] = useState(false)

  const year = String(anchor.getFullYear())
  const label = view === 'list' ? `01-Jan-${year} - 31-Dec-${year}` : `${monthShort(anchor)} ${year}`
  const step = (dir: 1 | -1) =>
    setAnchor((d) => (view === 'list' ? new Date(d.getFullYear() + dir, 0, 1) : new Date(d.getFullYear(), d.getMonth() + dir, 1)))

  const leaves = (requests.data?.items ?? []).filter((r) => isActiveRequest(r.status))
  const myHolidays = (holidays.data?.items ?? []).filter((h) => h.location === 'All Locations' || h.location === me.data?.location)
  const booked = leaves.filter((r) => r.from_date.startsWith(year)).reduce((sum, r) => sum + r.days, 0)

  const todayKey = toDateKey(new Date())
  const events: SummaryEvent[] = [
    ...leaves.map((r) => ({
      key: r.id,
      date: r.from_date,
      kind: 'leave' as const,
      title: r.leave_type_name,
      detail: `${r.days} Day(s) · ${REQUEST_STATUS[r.status].label}`,
    })),
    ...myHolidays.map((h) => ({ key: h.id, date: h.date, kind: 'holiday' as const, title: h.name, detail: null })),
  ].filter((e) => e.date.startsWith(year))
  const upcoming = events.filter((e) => e.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date))
  const past = events.filter((e) => e.date < todayKey).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="px-5 py-3">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[13px]">
        <p>
          Leave booked this year : <strong className="font-bold">{booked}</strong> day(s) <span className="mx-1 text-muted">|</span> Absent :{' '}
          <strong className="font-bold">{summary.data?.absent_days ?? 0}</strong>
        </p>
        <DateStepper label={label} onPrev={() => step(-1)} onNext={() => step(1)} />
        <div className="flex justify-end gap-2">
          <div className="flex gap-1">
            <IconButton label="List view" active={view === 'list'} aria-pressed={view === 'list'} onClick={() => setView('list')}>
              <List className="size-4" />
            </IconButton>
            <IconButton label="Calendar view" active={view === 'calendar'} aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>
              <CalendarDays className="size-4" />
            </IconButton>
          </div>
          <Button onClick={() => setApplyOpen(true)}>Apply Leave</Button>
          <IconButton label="More actions">
            <Ellipsis className="size-4" />
          </IconButton>
        </div>
      </div>

      {view === 'calendar' ? (
        <MonthGrid
          month={anchor}
          renderDay={(date) => {
            const key = toDateKey(date)
            return (
              <>
                {myHolidays.filter((h) => h.date === key).map((h) => (
                  <CalendarChip key={h.id} tone="holiday" label={h.name} />
                ))}
                {leaves
                  .filter((r) => r.from_date <= key && r.to_date >= key)
                  .map((r) => (
                    <CalendarChip key={r.id} tone={r.status === 'pending' ? 'pending' : 'leave'} label={r.leave_type_name} />
                  ))}
              </>
            )
          }}
        />
      ) : (
        <div className="space-y-2.5">
          <AsyncContent state={balances}>
            {({ items }) => (
              <div className="flex flex-wrap gap-2.5">
                {items.map((balance) => (
                  <BalanceCard key={balance.id} balance={balance} />
                ))}
              </div>
            )}
          </AsyncContent>
          <EventsCard period="Upcoming" events={upcoming} />
          <EventsCard period="Past" events={past} />
        </div>
      )}

      {applyOpen && <ApplyLeaveModal onClose={() => setApplyOpen(false)} />}
    </div>
  )
}
