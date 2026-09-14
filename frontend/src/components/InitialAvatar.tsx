import { cn } from '@/lib/cn'

/** Coloured tile with the first letter of a name — Zoho's default for the logged-in user. */
export function InitialAvatar({ name, color, className }: { name: string; color: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: color }}
      className={cn('flex shrink-0 items-center justify-center text-white', className)}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
