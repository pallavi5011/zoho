import { UserPlus } from 'lucide-react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { EmployeeCard } from '@/features/home/organization/components/EmployeeCard'
import { addDays, formatDate, parseDateKey, toDateKey } from '@/lib/date'
import type { EmployeeRecord, ListResponse } from '@/types'

const WINDOW_DAYS = 15

export function NewHiresPage() {
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const since = toDateKey(addDays(new Date(), -WINDOW_DAYS))

  return (
    <div className="px-5 py-3">
      <AsyncContent state={employees}>
        {({ items }) => {
          const hires = items.filter((e) => e.date_of_joining >= since).sort((a, b) => b.date_of_joining.localeCompare(a.date_of_joining))

          if (hires.length === 0) {
            return (
              <Card>
                <EmptyState icon={UserPlus} message={`No New Joinees in past ${WINDOW_DAYS} days.`} />
              </Card>
            )
          }

          return (
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {hires.map((person) => (
                <EmployeeCard
                  key={person.id}
                  employee={person}
                  extra={<p className="mt-1.5 text-xs text-success">Joined on {formatDate(parseDateKey(person.date_of_joining))}</p>}
                />
              ))}
            </div>
          )
        }}
      </AsyncContent>
    </div>
  )
}
