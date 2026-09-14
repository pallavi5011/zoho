import { statusClass } from '@/features/home/presence'
import type { EmployeeRef } from '@/types'

/** "SSA128 - Name" with the attendance status below it. */
export function EmployeeSummary({ employee, label }: { employee: EmployeeRef; label?: string }) {
  return (
    <div className="min-w-0 leading-[21px]">
      {label && <p className="text-muted">{label}</p>}
      <p className="truncate">
        <span className="text-muted">{employee.employee_id} - </span>
        <strong className="font-bold">{employee.full_name}</strong>
      </p>
      {employee.status_label && <p className={statusClass(employee.status)}>{employee.status_label}</p>}
    </div>
  )
}
