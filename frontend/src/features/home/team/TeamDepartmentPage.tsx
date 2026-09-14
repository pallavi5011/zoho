import { Users } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { statusClass } from '@/features/home/presence'
import { cn } from '@/lib/cn'
import type { CurrentUser, Department, EmployeeRecord, ListResponse } from '@/types'

function groupByDesignation(people: EmployeeRecord[]) {
  const groups = new Map<string, EmployeeRecord[]>()
  for (const person of people) {
    const key = person.designation ?? 'Other'
    groups.set(key, [...(groups.get(key) ?? []), person])
  }
  return [...groups]
}

export function TeamDepartmentPage() {
  const me = useApi<CurrentUser>('/me')
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const departments = useApi<ListResponse<Department>>('/organization/departments')
  const [departmentId, setDepartmentId] = useState<string | null>(null)
  const [location, setLocation] = useState('all')

  return (
    <div className="px-5 py-3">
      <AsyncContent state={departments}>
        {({ items: depts }) => (
          <AsyncContent state={employees}>
            {({ items }) => {
              const activeId = departmentId ?? me.data?.department_id ?? depts[0]?.id
              const department = depts.find((d) => d.id === activeId)
              const head = items.find((e) => e.id === department?.head_id)
              const locations = [...new Set(items.map((e) => e.location))].sort()
              const members = items.filter((e) => e.department_id === activeId && (location === 'all' || e.location === location))

              return (
                <>
                  <Card className="mb-2.5 flex flex-wrap items-center gap-3 p-3 text-[13px]">
                    <select
                      aria-label="Department"
                      value={activeId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className={cn(toolbarInputClass, 'h-9 w-[260px]')}
                    >
                      {depts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <select aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)} className={cn(toolbarInputClass, 'h-9 w-[200px]')}>
                      <option value="all">All Locations</option>
                      {locations.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    {head && (
                      <div className="ml-auto flex items-center gap-2.5">
                        <EmployeePhoto employee={head} size={36} />
                        <div>
                          <p>
                            <span className="text-muted">{head.employee_id} - </span>
                            <strong className="font-bold">{head.full_name}</strong>
                          </p>
                          <p className="text-xs text-muted">Department head</p>
                        </div>
                      </div>
                    )}
                    <div className="ml-auto text-right">
                      <p className="font-bold">{members.length}</p>
                      <p className="text-muted">Members</p>
                    </div>
                  </Card>

                  {members.length === 0 ? (
                    <Card>
                      <EmptyState icon={Users} message="No members found for this filter" />
                    </Card>
                  ) : (
                    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                      {groupByDesignation(members).map(([designation, people]) => (
                        <Card key={designation} className="p-4 text-[13px]">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-bold">{designation}</h3>
                            <span className="rounded bg-page px-2 py-0.5 text-xs">{people.length}</span>
                          </div>
                          {people.map((person) => (
                            <div key={person.id} className="mt-4 flex items-center gap-3">
                              <EmployeePhoto employee={person} size={32} radius={6} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate">
                                  <span className="text-muted">{person.employee_id} - </span>
                                  <strong className="font-bold">{person.full_name}</strong>
                                </p>
                                {person.mobile && <p className="text-xs text-muted">{person.mobile}</p>}
                              </div>
                              {person.status_label && <span className={statusClass(person.status)}>{person.status_label}</span>}
                            </div>
                          ))}
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )
            }}
          </AsyncContent>
        )}
      </AsyncContent>
    </div>
  )
}
