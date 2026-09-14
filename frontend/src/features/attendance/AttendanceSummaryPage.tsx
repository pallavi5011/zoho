import { CalendarDays, Ellipsis, LayoutList, ListFilter, Rows3 } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { DateStepper } from '@/components/DateStepper'
import { IconButton } from '@/components/IconButton'
import { CalendarChip, MonthGrid } from '@/components/MonthGrid'
import { CheckInCard } from '@/features/attendance/components/CheckInCard'
import { DayRow, TimelineFooter } from '@/features/attendance/components/DayTimeline'
import { RegularizationModal } from '@/features/attendance/components/RegularizationModal'
import { entriesPath, entryChip } from '@/features/attendance/entries'
import { statusClass } from '@/features/home/presence'
import { cn } from '@/lib/cn'
import { addDays, eachDay, formatDate, formatMinutes, formatTime, monthShort, startOfWeek, toDateKey, weekdayShort } from '@/lib/date'
import { useTodayAttendance } from '@/store/attendance'
import type { AttendanceEntry, ListResponse } from '@/types'

type View = 'list' | 'tabular' | 'calendar'

const VIEWS: { key: View; label: string; icon: typeof LayoutList }[] = [
  { key: 'list', label: 'List View', icon: LayoutList },
  { key: 'tabular', label: 'Tabular View', icon: Rows3 },
  { key: 'calendar', label: 'Calendar View', icon: CalendarDays },
]

export function AttendanceSummaryPage() {
  const [view, setView] = useState<View>('list')
  const [anchor, setAnchor] = useState(() => new Date())
  const [regularizeOpen, setRegularizeOpen] = useState(false)
  const { workedMs } = useTodayAttendance()

  const monthly = view === 'calendar'
  const from = monthly ? new Date(anchor.getFullYear(), anchor.getMonth(), 1) : startOfWeek(anchor)
  const to = monthly ? new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0) : addDays(from, 6)
  const label = monthly ? `${monthShort(from)} ${from.getFullYear()}` : `${formatDate(from)} - ${formatDate(to)}`
  const step = (dir: 1 | -1) => setAnchor((d) => (monthly ? new Date(d.getFullYear(), d.getMonth() + dir, 1) : addDays(d, 7 * dir)))

  const entries = useApi<ListResponse<AttendanceEntry>>(entriesPath(from, to))
  const todayKey = toDateKey(new Date())
  const todayMinutes = Math.floor(workedMs / 60000)

  return (
    <div className="px-5 pt-3">
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
          <Button onClick={() => setRegularizeOpen(true)}>Regularization</Button>
          <IconButton label="Filter">
            <ListFilter className="size-4" />
          </IconButton>
          <IconButton label="More actions">
            <Ellipsis className="size-4" />
          </IconButton>
        </div>
      </div>

      <AsyncContent state={entries}>
        {({ items }) => {
          const byDate = new Map(items.map((e) => [e.date, e]))
          const days = eachDay(from, to)
          const inRange = days.map((d) => byDate.get(toDateKey(d))).filter((e): e is AttendanceEntry => Boolean(e))
          const shift = byDate.get(todayKey)?.shift ?? inRange.find((e) => e.shift)?.shift ?? null

          if (view === 'calendar') {
            return (
              <div className="pb-6">
                <MonthGrid
                  month={from}
                  renderDay={(date) => {
                    const entry = byDate.get(toDateKey(date))
                    const chip = entry && entryChip(entry)
                    return chip && <CalendarChip {...chip} />
                  }}
                />
              </div>
            )
          }

          if (view === 'tabular') {
            return (
              <Card className="mb-6 overflow-x-auto">
                <table className="w-full min-w-[820px] whitespace-nowrap text-left text-[13px]">
                  <thead className="bg-[#eef1f5]">
                    <tr>
                      {['Date', 'Shift', 'First In', 'Last Out', 'Hours Worked', 'Status'].map((col) => (
                        <th key={col} className="px-4 py-3 font-normal">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((date) => {
                      const key = toDateKey(date)
                      const entry = byDate.get(key)
                      const minutes = key === todayKey ? Math.max(todayMinutes, entry?.worked_minutes ?? 0) : (entry?.worked_minutes ?? 0)
                      return (
                        <tr key={key} className={cn('border-b border-divider last:border-0', key === todayKey && 'bg-[#f5f9fe]')}>
                          <td className="px-4 py-3">
                            {formatDate(date)}, {weekdayShort(date)}
                          </td>
                          <td className="px-4">
                            {entry?.shift ? `${entry.shift.name} (${formatTime(entry.shift.start_time)} - ${formatTime(entry.shift.end_time)})` : '-'}
                          </td>
                          <td className="px-4">{entry?.check_in ? formatTime(entry.check_in) : '-'}</td>
                          <td className="px-4">{entry?.check_out ? formatTime(entry.check_out) : '-'}</td>
                          <td className="px-4">{formatMinutes(minutes)} Hrs</td>
                          <td className={cn('px-4', statusClass(entry?.status ?? null))}>{entry?.status_label ?? '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            )
          }

          return (
            <>
              <CheckInCard shift={shift} />
              <ul className="mt-3 space-y-1.5">
                {days.map((date) => (
                  <DayRow key={toDateKey(date)} date={date} entry={byDate.get(toDateKey(date))} todayMinutes={todayMinutes} />
                ))}
              </ul>
              <TimelineFooter shift={shift} entries={inRange} />
            </>
          )
        }}
      </AsyncContent>

      {regularizeOpen && <RegularizationModal onClose={() => setRegularizeOpen(false)} />}
    </div>
  )
}
