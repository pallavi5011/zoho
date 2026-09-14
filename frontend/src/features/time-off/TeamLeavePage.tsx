import { CalendarDays, CalendarRange, List, ListFilter, Plane } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { DateStepper } from '@/components/DateStepper'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { EmptyState } from '@/components/EmptyState'
import { IconButton } from '@/components/IconButton'
import { CalendarChip, MonthGrid } from '@/components/MonthGrid'
import { isActiveRequest, REQUEST_STATUS } from '@/lib/requestStatus'
import { cn } from '@/lib/cn'
import { addDays, formatDate, monthShort, parseDateKey, startOfWeek, toDateKey, weekdayShort } from '@/lib/date'
import type { LeaveRequest, ListResponse } from '@/types'

type View = 'list' | 'week' | 'month'

const VIEWS: { key: View; label: string; icon: typeof List }[] = [
  { key: 'list', label: 'List view', icon: List },
  { key: 'week', label: 'Week view', icon: CalendarRange },
  { key: 'month', label: 'Month view', icon: CalendarDays },
]

const chip = (r: LeaveRequest) => (
  <CalendarChip key={r.id} tone={r.status === 'pending' ? 'pending' : 'leave'} label={r.employee.full_name} sub={r.leave_type_name} />
)

export function TeamLeavePage() {
  const team = useApi<ListResponse<LeaveRequest>>('/leave/team')
  const [view, setView] = useState<View>('week')
  const [anchor, setAnchor] = useState(() => new Date())

  const from = view === 'month' ? new Date(anchor.getFullYear(), anchor.getMonth(), 1) : startOfWeek(anchor)
  const to = view === 'month' ? new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0) : addDays(from, 6)
  const label = view === 'month' ? `${monthShort(from)} ${from.getFullYear()}` : `${formatDate(from)} - ${formatDate(to)}`
  const step = (dir: 1 | -1) =>
    setAnchor((d) => (view === 'month' ? new Date(d.getFullYear(), d.getMonth() + dir, 1) : addDays(d, 7 * dir)))

  const todayKey = toDateKey(new Date())

  return (
    <div className="px-5 py-3">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span />
        <DateStepper label={label} onPrev={() => step(-1)} onNext={() => step(1)} />
        <div className="flex justify-end gap-2">
          <div className="flex gap-1">
            {VIEWS.map(({ key, label: viewLabel, icon: Icon }) => (
              <IconButton key={key} label={viewLabel} active={view === key} aria-pressed={view === key} onClick={() => setView(key)}>
                <Icon className="size-4" />
              </IconButton>
            ))}
          </div>
          <IconButton label="Filter">
            <ListFilter className="size-4" />
          </IconButton>
        </div>
      </div>

      <AsyncContent state={team}>
        {({ items }) => {
          const fromKey = toDateKey(from)
          const toKey = toDateKey(to)
          const inRange = items.filter((r) => isActiveRequest(r.status) && r.from_date <= toKey && r.to_date >= fromKey)
          const onDay = (date: Date) => {
            const key = toDateKey(date)
            return inRange.filter((r) => r.from_date <= key && r.to_date >= key)
          }

          if (inRange.length === 0) {
            return (
              <Card>
                <EmptyState icon={Plane} message={`No team members on leave this ${view === 'month' ? 'month' : 'week'}`} />
              </Card>
            )
          }

          if (view === 'month') return <MonthGrid month={from} renderDay={(date) => onDay(date).map(chip)} />

          if (view === 'week') {
            const week = Array.from({ length: 7 }, (_, i) => addDays(from, i))
            return (
              <div className="overflow-x-auto">
                <div className="grid min-w-[760px] grid-cols-7 border-l border-t border-divider bg-white">
                  {week.map((date, i) => (
                    <div key={i} className="border-b border-r border-divider px-2.5 py-2 text-[13px]">
                      <span className="text-muted">{weekdayShort(date)}</span>{' '}
                      <span className={cn('font-bold', toDateKey(date) === todayKey && 'rounded bg-brand px-1 text-white')}>{date.getDate()}</span>
                    </div>
                  ))}
                  {week.map((date, i) => (
                    <div key={i} className={cn('min-h-[240px] border-b border-r border-divider p-2.5', (i === 0 || i === 6) && 'bg-[#fdf7e9]')}>
                      {onDay(date).map(chip)}
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          return (
            <Card className="divide-y divide-divider">
              {inRange.map((r) => {
                const meta = REQUEST_STATUS[r.status]
                return (
                  <div key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-3 text-[13px]">
                    <EmployeePhoto employee={r.employee} size={36} radius={6} />
                    <p className="min-w-[200px] flex-1">
                      <span className="text-muted">{r.employee.employee_id} - </span>
                      <strong className="font-bold">{r.employee.full_name}</strong>
                    </p>
                    <span className="w-[140px]">{r.leave_type_name}</span>
                    <span className="w-[220px]">
                      {formatDate(parseDateKey(r.from_date))} - {formatDate(parseDateKey(r.to_date))}
                    </span>
                    <span className="w-[70px]">{r.days} Day(s)</span>
                    <span className={cn('w-[80px]', meta.className.includes('fill') ? 'text-success' : meta.className)}>{meta.label}</span>
                  </div>
                )
              })}
            </Card>
          )
        }}
      </AsyncContent>
    </div>
  )
}
