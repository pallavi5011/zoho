import { Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { statusClass } from '@/features/home/presence'
import { cn } from '@/lib/cn'
import type { EmployeeRecord } from '@/types'

interface EmployeeCardProps {
  employee: EmployeeRecord
  extra?: ReactNode
  favorite?: boolean
  onToggleFavorite?: () => void
}

/** Centered directory card: photo, name, email, designation, department, status. */
export function EmployeeCard({ employee, extra, favorite, onToggleFavorite }: EmployeeCardProps) {
  return (
    <Card className="relative flex flex-col items-center px-3 py-4 text-center text-[13px]">
      {onToggleFavorite && (
        <button
          type="button"
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorite}
          onClick={onToggleFavorite}
          className="absolute right-3 top-3 text-muted hover:text-weekend"
        >
          <Star className={cn('size-4', favorite && 'fill-weekend text-weekend')} strokeWidth={1.5} />
        </button>
      )}
      <EmployeePhoto employee={employee} size={84} radius={8} />
      <p className="mt-3 w-full truncate">
        <span className="text-muted">{employee.employee_id} - </span>
        <strong className="font-bold">{employee.full_name}</strong>
      </p>
      <p className="w-full truncate text-xs text-muted">{employee.email}</p>
      <p className="mt-1.5 text-xs">{employee.designation}</p>
      <p className="mt-1.5 text-xs">{employee.department}</p>
      {extra}
      {employee.status_label && <p className={cn('mt-1.5 text-xs', statusClass(employee.status))}>{employee.status_label}</p>}
    </Card>
  )
}
