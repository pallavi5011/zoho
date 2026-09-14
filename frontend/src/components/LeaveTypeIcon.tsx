import { CalendarDays, Coffee, Stethoscope, TreePalm, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

const ICONS: Record<string, LucideIcon> = { CL: Coffee, PL: TreePalm, SL: Stethoscope }

/** Tinted tile with the icon for a leave type code (CL, PL, SL …). */
export function LeaveTypeIcon({ code, color, className }: { code: string; color: string; className?: string }) {
  const Icon = ICONS[code] ?? CalendarDays
  return (
    <span style={{ backgroundColor: `${color}1f`, color }} className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', className)}>
      <Icon className="size-[18px]" strokeWidth={1.5} />
    </span>
  )
}
