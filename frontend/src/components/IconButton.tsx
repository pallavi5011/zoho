import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
}

/** Small bordered square toolbar button (search, filter, view toggles …). */
export function IconButton({ label, active, className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded border transition-colors disabled:opacity-40',
        active ? 'border-brand/50 bg-[#eef5fd] text-brand' : 'border-line bg-white text-muted enabled:hover:text-brand',
        className,
      )}
    >
      {children}
    </button>
  )
}
