import type { ReactNode } from 'react'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { cn } from '@/lib/cn'
import type { EmployeeRef } from '@/types'

/** A column in the employee / department tree; columns after the first get a connector rule. */
export const treeColumnClass = (linked: boolean) =>
  cn('flex shrink-0 flex-col gap-2.5', linked && 'border-l border-[#cfd8e3] pl-6')

interface TreeTileProps {
  active?: boolean
  onClick?: () => void
  children: ReactNode
}

export function TreeTile({ active, onClick, children }: TreeTileProps) {
  const className = cn(
    'flex h-[46px] w-[230px] items-center gap-2.5 rounded border px-2.5 text-left transition-colors',
    active ? 'border-brand/60 bg-[#eef5fd]' : 'border-line bg-white',
    onClick && !active && 'hover:border-brand/40',
  )

  return onClick ? (
    <button type="button" onClick={onClick} aria-current={active || undefined} className={className}>
      {children}
    </button>
  ) : (
    <div className={className}>{children}</div>
  )
}

export function PersonTileContent({ person }: { person: EmployeeRef }) {
  return (
    <>
      <EmployeePhoto employee={person} size={30} radius={4} />
      <span className="min-w-0">
        <span className="block truncate text-xs font-bold">{person.full_name}</span>
        <span className="block truncate text-[11px] text-muted">{person.designation}</span>
      </span>
    </>
  )
}

export function CountBadge({ count, active }: { count: number; active?: boolean }) {
  return (
    <span
      className={cn(
        'min-w-6 rounded border px-1.5 text-center text-[11px] leading-5',
        count === 0 && 'invisible',
        active ? 'border-brand bg-brand text-white' : 'border-line bg-white',
      )}
    >
      {count}
    </span>
  )
}
