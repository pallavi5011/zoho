import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/date'
import type { Shift } from '@/types'

export function ShiftBox({ shift, className }: { shift: Shift; className?: string }) {
  return (
    <div className={cn('rounded border-l-[3px] border-[#999] bg-[#f6f6f6] px-2.5 py-[5px]', className)}>
      <p className="text-xs">{shift.name}</p>
      <p className="text-[11px] text-muted">
        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
      </p>
    </div>
  )
}
