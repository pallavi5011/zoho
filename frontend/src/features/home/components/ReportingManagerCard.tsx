import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { EmployeeSummary } from '@/features/home/components/EmployeeSummary'
import type { EmployeeRef } from '@/types'

export function ReportingManagerCard({ manager }: { manager: EmployeeRef }) {
  return (
    <Card className="flex items-center gap-3 p-5">
      <EmployeePhoto employee={manager} size={54} />
      <EmployeeSummary employee={manager} label="Reporting Manager" />
    </Card>
  )
}
