import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded px-3.5 transition-colors disabled:opacity-50',
        variant === 'primary' ? 'bg-brand text-white hover:bg-brand-dark' : 'border border-line bg-white hover:bg-page',
        className,
      )}
    />
  )
}
