import { CalendarClock } from 'lucide-react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { entriesPath } from '@/features/attendance/entries'
import { IconTile } from '@/features/home/components/IconTile'
import { ShiftBox } from '@/features/home/components/ShiftBox'
import { cn } from '@/lib/cn'
import { addDays, eachDay, formatDate, startOfWeek, toDateKey, weekdayShort } from '@/lib/date'
import type { AttendanceEntry, ListResponse } from '@/types'

export function WorkScheduleCard() {
  const from = startOfWeek(new Date())
  const to = addDays(from, 6)
  const entries = useApi<ListResponse<AttendanceEntry>>(entriesPath(from, to))
  const todayKey = toDateKey(new Date())

  return (
    <AsyncContent state={entries}>
      {({ items }) => {
        const byDate = new Map(items.map((e) => [e.date, e]))
        const week = eachDay(from, to)
        const shift = week.map((d) => byDate.get(toDateKey(d))?.shift).find(Boolean)

        return (
          <Card className="flex gap-4 p-5">
            <IconTile icon={CalendarClock} />
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-bold leading-[21px]">Work Schedule</h2>
              <p className="text-muted">
                {formatDate(from)}
                <span className="mx-3 text-ink">-</span>
                {formatDate(to)}
              </p>

              {shift && <ShiftBox shift={shift} className="mt-4" />}

              <ol className="relative grid grid-cols-7">
                <span aria-hidden="true" className="absolute inset-x-0 top-[18px] h-px bg-[#ddd]" />
                {week.map((date) => {
                  const key = toDateKey(date)
                  const entry = byDate.get(key)
                  const isToday = key === todayKey
                  const note = entry && (entry.status === 'weekend' || entry.status === 'holiday') ? entry.status_label : null

                  return (
                    <li key={key} className="relative">
                      <span aria-hidden="true" className="ml-[3.5px] block h-3.5 border-l border-dashed border-[#ccc]" />
                      <span aria-hidden="true" className={cn('block size-2 rounded-full', isToday ? 'bg-brand' : 'bg-[#ddd]')} />
                      <p className="mt-3 text-[13px]">
                        <span className="text-muted">{weekdayShort(date)}</span>
                        <span className={cn('ml-1.5 font-bold', isToday && 'rounded bg-brand px-[3px] py-0.5 text-white')}>{date.getDate()}</span>
                      </p>
                      {note && <p className="mt-1 text-weekend">{note}</p>}
                    </li>
                  )
                })}
              </ol>
            </div>
          </Card>
        )
      }}
    </AsyncContent>
  )
}
