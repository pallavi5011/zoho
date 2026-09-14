import type { ChipTone } from '@/components/MonthGrid'
import { formatMinutes, toDateKey, toMinutes } from '@/lib/date'
import type { AttendanceEntry, Shift } from '@/types'

export const entriesPath = (from: Date, to: Date) => `/attendance/entries?from=${toDateKey(from)}&to=${toDateKey(to)}`

/** Calendar chip for a day, or null when there is nothing to show. */
export function entryChip(entry: AttendanceEntry): { tone: ChipTone; label: string; sub: string | null } | null {
  switch (entry.status) {
    case 'present':
      return {
        tone: 'present',
        label: `Present(${entry.work_mode === 'remote' ? 'Work from Home' : 'Office In'})`,
        sub: `${formatMinutes(entry.worked_minutes)} Hrs`,
      }
    case 'on_leave':
      return { tone: 'leave', label: entry.status_label ?? 'On Leave', sub: null }
    case 'holiday':
      return { tone: 'holiday', label: entry.status_label ?? 'Holiday', sub: null }
    case 'absent':
      return { tone: 'absent', label: 'Absent', sub: null }
    default:
      return null
  }
}

/**
 * Maps minutes-of-day to a % position on a timeline where the shift
 * spans 8% → 92% (a little room on both sides for early/late punches).
 */
export function timelinePosition(shift: Shift | null) {
  const start = shift ? toMinutes(shift.start_time) : 9 * 60
  const end = shift ? toMinutes(shift.end_time) : 18 * 60
  return (minutes: number) => Math.min(100, Math.max(0, 8 + (84 * (minutes - start)) / (end - start)))
}
