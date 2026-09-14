import { cn } from '@/lib/cn'

/** 1–5 Likert scale picker (5 being the highest). */
export function RatingInput({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          className={cn(
            'flex size-8 items-center justify-center rounded border text-[13px] transition-colors',
            value === n ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:border-brand',
          )}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
