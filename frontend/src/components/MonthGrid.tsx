import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { toDateKey } from '@/lib/date'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export type ChipTone = 'present' | 'absent' | 'leave' | 'holiday' | 'pending'

const CHIP_CLASS: Record<ChipTone, string> = {
  present: 'border-[#6cc07f] bg-[#e1f3e4]',
  leave: 'border-[#e57373] bg-[#fbe2e2]',
  absent: 'border-[#e57373] bg-[#fbe2e2]',
  holiday: 'border-[#f1a82f] bg-[#fdf0d8]',
  pending: 'border-[#9fb4d6] bg-[#eef3fb]',
}

/** Coloured entry inside a calendar day (attendance, leave, holiday …). */
export function CalendarChip({ tone, label, sub }: { tone: ChipTone; label: string; sub?: string | null }) {
  return (
    <div title={label} className={cn('mt-2 rounded-sm border px-2 py-1 text-xs', CHIP_CLASS[tone])}>
      <p className="truncate">{label}</p>
      {sub && <p className="truncate text-[10px]">{sub}</p>}
    </div>
  )
}

/** Leading blanks, then every day of the month, padded to full weeks. */
function monthCells(month: Date) {
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = Array(month.getDay()).fill(null)
  for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d))
  while (cells.length % 7) cells.push(null)
  return cells
}

interface MonthGridProps {
  /** Any date inside the month to show. */
  month: Date
  renderDay?: (date: Date) => ReactNode
}

/** Zoho month calendar: weekends shaded, today highlighted. */
export function MonthGrid({ month, renderDay }: MonthGridProps) {
  const todayKey = toDateKey(new Date())
  const first = new Date(month.getFullYear(), month.getMonth(), 1)

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[760px] grid-cols-7 border-l border-t border-divider bg-white">
        {WEEKDAYS.map((day) => (
          <div key={day} className="border-b border-r border-divider px-2.5 py-2 text-[13px]">
            {day}
          </div>
        ))}
        {monthCells(first).map((date, i) => {
          const weekend = i % 7 === 0 || i % 7 === 6
          return (
            <div key={i} className={cn('min-h-[140px] border-b border-r border-divider p-2.5', date && weekend && 'bg-[#fdf7e9]')}>
              {date && (
                <>
                  <span className={cn('inline-block text-[13px]', toDateKey(date) === todayKey && 'rounded bg-brand px-1.5 font-bold text-white')}>
                    {date.getDate()}
                  </span>
                  {renderDay?.(date)}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
