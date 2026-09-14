import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { entriesPath } from '@/features/attendance/entries'
import { ShiftBox } from '@/features/home/components/ShiftBox'
import { statusClass } from '@/features/home/presence'
import { cn } from '@/lib/cn'
import { addDays, eachDay, formatMinutes, formatTime, startOfWeek, toDateKey, weekdayShort } from '@/lib/date'
import type { AttendanceEntry, ListResponse } from '@/types'

export function AttendanceTab() {
  const from = startOfWeek(new Date())
  const to = addDays(from, 6)
  const entries = useApi<ListResponse<AttendanceEntry>>(entriesPath(from, to))
  const todayKey = toDateKey(new Date())

  return (
    <>
      <p className="px-3 text-[13px]">This Week</p>
      <AsyncContent state={entries}>
        {({ items }) => {
          const byDate = new Map(items.map((e) => [e.date, e]))
          return (
            <Card className="overflow-x-auto">
              <div className="min-w-[640px]">
                {eachDay(from, to).map((date) => {
                  const key = toDateKey(date)
                  const entry = byDate.get(key)
                  const offDay = entry?.status === 'weekend' || entry?.status === 'holiday'

                  return (
                    <div
                      key={key}
                      className={cn(
                        'grid min-h-[92px] grid-cols-[110px_210px_minmax(0,1fr)_minmax(0,1fr)] border-b border-divider text-[13px] last:border-0',
                        offDay && 'bg-[#fdf6e6]',
                      )}
                    >
                      <div className="flex flex-col items-center justify-center gap-1 border-r border-divider">
                        <span className="text-muted">{weekdayShort(date)}</span>
                        <span className={cn('font-bold', key === todayKey && 'rounded bg-brand px-1.5 py-0.5 text-white')}>{date.getDate()}</span>
                      </div>
                      <div className="flex items-center border-r border-divider px-3">{entry?.shift && <ShiftBox shift={entry.shift} className="w-full" />}</div>
                      <div className="flex items-center border-r border-divider px-3">
                        {entry?.check_in ? (
                          <span>
                            {formatTime(entry.check_in)} - {entry.check_out ? formatTime(entry.check_out) : '--'}
                          </span>
                        ) : (
                          entry?.status_label && <span className={statusClass(entry.status)}>{entry.status_label}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-end px-5 text-muted">
                        {entry && entry.worked_minutes > 0 && `${formatMinutes(entry.worked_minutes)} Hrs`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        }}
      </AsyncContent>
    </>
  )
}
