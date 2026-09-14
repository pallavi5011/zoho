import { useState } from 'react'
import { timelinePosition } from '@/features/attendance/entries'
import { cn } from '@/lib/cn'
import { formatMinutes, formatTime, pad, toDateKey, toMinutes, weekdayShort } from '@/lib/date'
import type { AttendanceEntry, AttendanceStatus, Shift } from '@/types'

/* Horizontal layout shared by rows and the axis so the hours line up. */
const DAY_LABEL = 'w-[60px]'
const HOURS_BOX = 'w-[90px]'

interface DayRowProps {
  date: Date
  entry: AttendanceEntry | undefined
  /** Live minutes worked, used for today's row. */
  todayMinutes: number
}

export function DayRow({ date, entry, todayMinutes }: DayRowProps) {
  const isToday = toDateKey(date) === toDateKey(new Date())
  const shift = entry?.shift ?? null
  const pos = timelinePosition(shift)
  const start = shift ? toMinutes(shift.start_time) : 9 * 60
  const end = shift ? toMinutes(shift.end_time) : 18 * 60
  const worked = isToday ? Math.max(todayMinutes, entry?.worked_minutes ?? 0) : (entry?.worked_minutes ?? 0)

  const offDay = entry?.status === 'weekend' || entry?.status === 'holiday'
  const pill = offDay || entry?.status === 'on_leave' || entry?.status === 'absent' ? entry?.status_label : null
  const inAt = entry?.check_in ? toMinutes(entry.check_in) : null
  const outAt = entry?.check_out ? toMinutes(entry.check_out) : null

  return (
    <li className="flex items-stretch">
      <div className={cn(DAY_LABEL, 'flex shrink-0 flex-col items-center justify-center text-[13px]', isToday && 'rounded-l-lg bg-white')}>
        <span className="font-bold">{isToday ? 'Today' : weekdayShort(date)}</span>
        <span className={isToday ? 'rounded bg-brand px-1.5 font-bold text-white' : 'text-muted'}>{date.getDate()}</span>
      </div>

      <div className="flex h-[70px] min-w-0 flex-1 items-center rounded-lg bg-white pr-5">
        <div className="relative mx-5 h-full flex-1">
          <span
            aria-hidden="true"
            className={cn('absolute top-1/2 h-0.5 -translate-y-1/2', offDay ? 'bg-[#f3dca0]' : 'bg-[#e3e3e3]')}
            style={{ left: `${pos(start)}%`, width: `${pos(end) - pos(start)}%` }}
          />
          {[start, end].map((m) => (
            <span key={m} aria-hidden="true" className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6d6d6]" style={{ left: `${pos(m)}%` }} />
          ))}

          {inAt !== null && (
            <>
              <span
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-success"
                style={{ left: `${pos(inAt)}%`, width: `${pos(outAt ?? inAt) - pos(inAt)}%` }}
              />
              <span
                className={cn('absolute top-1.5 whitespace-nowrap text-[11px] text-muted', pos(inAt) < 6 ? 'translate-x-0' : '-translate-x-1/2')}
                style={{ left: `${pos(inAt)}%` }}
              >
                {formatTime(entry!.check_in!)}
              </span>
              {outAt !== null && (
                <span
                  className={cn('absolute top-1.5 whitespace-nowrap text-[11px] text-muted', pos(outAt) > 94 ? '-translate-x-full' : '-translate-x-1/2')}
                  style={{ left: `${pos(outAt)}%` }}
                >
                  {formatTime(entry!.check_out!)}
                </span>
              )}
            </>
          )}

          {pill && (
            <span
              className={cn(
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border bg-white px-1.5 text-xs',
                offDay ? 'border-[#f3dca0]' : 'border-[#f2b8b8] text-danger',
              )}
            >
              {pill}
            </span>
          )}
        </div>

        <div className={cn(HOURS_BOX, 'shrink-0 text-[13px]')}>
          <p className="font-bold tabular-nums">{formatMinutes(worked)}</p>
          <p className="text-muted">Hrs worked</p>
        </div>
      </div>
    </li>
  )
}

const DAY_STATS: { status: AttendanceStatus; label: string; color: string }[] = [
  { status: 'present', label: 'Present', color: '#4caf50' },
  { status: 'on_duty', label: 'On Duty', color: '#9c5de0' },
  { status: 'on_leave', label: 'Paid leave', color: '#d4b106' },
  { status: 'holiday', label: 'Holidays', color: '#6ec6f0' },
  { status: 'weekend', label: 'Weekend', color: '#f1a82f' },
]

const hourLabel = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  return `${pad(h % 12 || 12)}${h >= 12 ? 'PM' : 'AM'}`
}

/** Sticky hour axis plus the Days / Hours totals for the visible period. */
export function TimelineFooter({ shift, entries }: { shift: Shift | null; entries: AttendanceEntry[] }) {
  const [tab, setTab] = useState<'days' | 'hours'>('days')
  const pos = timelinePosition(shift)
  const start = shift ? toMinutes(shift.start_time) : 9 * 60
  const end = shift ? toMinutes(shift.end_time) : 18 * 60
  const hours = Array.from({ length: Math.floor((end - start) / 60) + 1 }, (_, i) => start + i * 60)

  const worked = entries.reduce((sum, e) => sum + e.worked_minutes, 0)
  const workingDays = entries.filter((e) => e.shift && e.status !== 'weekend' && e.status !== 'holiday').length
  const stats =
    tab === 'days'
      ? DAY_STATS.map((s) => {
          const count = entries.filter((e) => e.status === s.status).length
          return { ...s, value: String(count), unit: count > 1 ? 'Days' : 'Day' }
        })
      : [
          { label: 'Hours worked', color: '#4caf50', value: formatMinutes(worked), unit: 'Hrs' },
          { label: 'Shift hours', color: '#3a9fd6', value: formatMinutes((end - start) * workingDays), unit: 'Hrs' },
        ]

  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-3 bg-white">
      <div className="flex border-b border-divider">
        <span className={cn(DAY_LABEL, 'ml-5 shrink-0')} />
        <div className="relative mx-5 h-6 flex-1">
          {hours.map((m) => (
            <span key={m} className="absolute top-1 -translate-x-1/2 text-[11px]" style={{ left: `${pos(m)}%` }}>
              {hourLabel(m)}
            </span>
          ))}
        </div>
        <span className={cn(HOURS_BOX, 'mr-10 shrink-0')} />
      </div>

      <div className="flex flex-wrap items-center gap-6 px-5 py-2 text-[13px]">
        <div role="tablist" className="flex w-[120px] flex-col">
          {(['days', 'hours'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn('border-l-2 py-1 capitalize', tab === key ? 'border-brand font-bold' : 'border-transparent bg-page')}
            >
              {key}
            </button>
          ))}
        </div>
        {stats.map((s) => (
          <div key={s.label} className="border-l-2 pl-2" style={{ borderColor: s.color }}>
            <p>{s.label}</p>
            <p>
              <strong className="font-bold">{s.value}</strong> {s.unit}
            </p>
          </div>
        ))}
        {shift && (
          <p className="ml-auto font-bold">
            {shift.name} [ {formatTime(shift.start_time)} - {formatTime(shift.end_time)} ]
          </p>
        )}
      </div>
    </div>
  )
}
