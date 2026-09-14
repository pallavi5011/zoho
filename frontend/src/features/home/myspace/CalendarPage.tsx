import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { DateStepper } from '@/components/DateStepper'
import { CalendarChip, MonthGrid } from '@/components/MonthGrid'
import { entriesPath, entryChip } from '@/features/attendance/entries'
import { monthShort, toDateKey } from '@/lib/date'
import type { AttendanceEntry, ListResponse } from '@/types'

export function CalendarPage() {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const entries = useApi<ListResponse<AttendanceEntry>>(entriesPath(month, monthEnd))
  const shiftMonth = (delta: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  const byDate = new Map((entries.data?.items ?? []).map((e) => [e.date, e]))

  return (
    <div className="px-[50px] py-3">
      <DateStepper
        className="mb-3 justify-center"
        label={`${monthShort(month)} ${month.getFullYear()}`}
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
      />
      <MonthGrid
        month={month}
        renderDay={(date) => {
          const entry = byDate.get(toDateKey(date))
          const chip = entry && entryChip(entry)
          return chip && <CalendarChip {...chip} />
        }}
      />
    </div>
  )
}
