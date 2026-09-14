import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface DateStepperProps {
  label: string
  onPrev: () => void
  onNext: () => void
  className?: string
}

/** "‹ 📅 ›  13-Sep-2026" period switcher. */
export function DateStepper({ label, onPrev, onNext, className }: DateStepperProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-1.5 rounded border border-line bg-white px-1.5 py-1 text-muted">
        <button type="button" aria-label="Previous" onClick={onPrev} className="hover:text-ink">
          <ChevronLeft className="size-4" />
        </button>
        <CalendarDays className="size-4" strokeWidth={1.5} />
        <button type="button" aria-label="Next" onClick={onNext} className="hover:text-ink">
          <ChevronRight className="size-4" />
        </button>
      </div>
      <p className="whitespace-nowrap text-[13px] font-bold">{label}</p>
    </div>
  )
}
