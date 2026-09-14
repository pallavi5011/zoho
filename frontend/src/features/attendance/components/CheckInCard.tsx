import { Power } from 'lucide-react'
import { Card } from '@/components/Card'
import { inputClass } from '@/components/Field'
import { cn } from '@/lib/cn'
import { formatTime, splitDuration } from '@/lib/date'
import { useTodayAttendance } from '@/store/attendance'
import type { Shift } from '@/types'

/** Shift, check-in notes and the big Check-in / Check-out button. */
export function CheckInCard({ shift }: { shift: Shift | null }) {
  const { checkedIn, workedMs, note, setNote, toggleCheckIn } = useTodayAttendance()
  const [hh, mm, ss] = splitDuration(workedMs)

  return (
    <Card className="flex flex-wrap items-center gap-5 px-5 py-3 shadow-[0_2px_6px_rgba(15,34,58,0.08)]">
      <p className="text-[17px] font-bold">
        {shift ? `${shift.name} [ ${formatTime(shift.start_time)} - ${formatTime(shift.end_time)} ]` : 'No shift assigned'}
      </p>
      <span className="h-10 w-px bg-divider" />
      <div className="w-[400px] max-w-full">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add notes for check-in" aria-label="Notes for check-in" className={inputClass} />
      </div>
      <button
        type="button"
        onClick={toggleCheckIn}
        className={cn(
          'ml-auto flex h-12 items-center gap-3 rounded pl-3 pr-1.5 text-left text-white transition-colors',
          checkedIn ? 'bg-danger hover:bg-danger/90' : 'bg-[#43b77a] hover:bg-[#3aa46c]',
        )}
      >
        <span className="text-[13px] leading-tight">
          <span className="block font-bold">{checkedIn ? 'Check-out' : 'Check-in'}</span>
          <span className="block tabular-nums">
            {hh}:{mm}:{ss} Hrs
          </span>
        </span>
        <span className="flex size-8 items-center justify-center rounded-full bg-white">
          <Power className={cn('size-4', checkedIn ? 'text-danger' : 'text-success')} />
        </span>
      </button>
    </Card>
  )
}
