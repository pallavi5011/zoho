import { useApi } from '@/api/useApi'
import { FormRow } from '@/components/RecordForm'
import { formatDate, parseDateKey } from '@/lib/date'
import type { CurrentUser, EmployeeRecord, ListResponse } from '@/types'

export type EmployeeDetail = 'joining' | 'department' | 'designation' | 'manager' | 'employment_type'

/** Read-only employee info rows shown at the top of Zoho forms (Date of Joining, Department …). */
export function EmployeeDetailRows({ fields }: { fields: EmployeeDetail[] }) {
  const me = useApi<CurrentUser>('/me')
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const record = employees.data?.items.find((e) => e.id === me.data?.id)
  const manager = employees.data?.items.find((e) => e.id === record?.reporting_manager_id)

  const rows: Record<EmployeeDetail, [string, string]> = {
    joining: ['Date of Joining', record ? formatDate(parseDateKey(record.date_of_joining)) : '-'],
    department: ['Department', record?.department ?? '-'],
    designation: ['Designation', record?.designation ?? '-'],
    manager: ['Reporting Manager', manager ? `${manager.full_name} ${manager.employee_id}` : '-'],
    employment_type: ['Employment Type', record?.employment_type ?? '-'],
  }

  return (
    <>
      {fields.map((key) => (
        <FormRow key={key} label={rows[key][0]} muted>
          {rows[key][1]}
        </FormRow>
      ))}
    </>
  )
}
