import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
  className?: string
  children?: ReactNode
}

export function EmptyState({ icon: Icon, message, className, children }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-8 text-center', className)}>
      <span className="flex size-[112px] items-center justify-center rounded-full bg-gradient-to-b from-[#f1f3fa] to-[#dde2f1] text-[#7483bf]">
        <Icon className="size-11" strokeWidth={1.25} />
      </span>
      <p className="mt-4">{message}</p>
      {children}
    </div>
  )
}
