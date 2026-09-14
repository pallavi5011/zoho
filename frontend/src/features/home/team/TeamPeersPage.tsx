import { ChevronRight, Users } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { EmptyState } from '@/components/EmptyState'
import { statusClass } from '@/features/home/presence'
import type { CurrentUser, EmployeeRecord, ListResponse } from '@/types'

export function TeamPeersPage() {
  const me = useApi<CurrentUser>('/me')
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const [managerId, setManagerId] = useState<string | null>(null)

  return (
    <div className="px-5 py-3">
      <AsyncContent state={me}>
        {(user) => (
          <AsyncContent state={employees}>
            {({ items }) => {
              const byId = new Map(items.map((e) => [e.id, e]))
              const activeId = managerId ?? byId.get(user.id)?.reporting_manager_id ?? null

              // Reporting chain from the top of the org down to the selected manager.
              const chain: EmployeeRecord[] = []
              for (let cur = activeId ? byId.get(activeId) : undefined; cur; cur = cur.reporting_manager_id ? byId.get(cur.reporting_manager_id) : undefined) {
                chain.unshift(cur)
              }
              const members = items.filter((e) => e.reporting_manager_id === activeId && e.id !== user.id)

              return (
                <>
                  <div className="mb-2.5 flex items-center gap-3">
                    <nav aria-label="Reporting chain" className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
                      {chain.map((person, i) => {
                        const last = i === chain.length - 1
                        return (
                          <Fragment key={person.id}>
                            {i > 0 && <ChevronRight className="size-4 shrink-0 text-muted" />}
                            <button
                              type="button"
                              title={person.full_name}
                              aria-current={last || undefined}
                              onClick={() => setManagerId(person.id)}
                              className="flex shrink-0 items-center gap-2 text-[13px]"
                            >
                              <EmployeePhoto employee={person} size={30} radius={6} />
                              {last && (
                                <span>
                                  <span className="text-muted">{person.employee_id} - </span>
                                  <strong className="font-bold">{person.full_name}</strong>
                                </span>
                              )}
                            </button>
                          </Fragment>
                        )
                      })}
                    </nav>
                    <span className="rounded bg-[#e3e8ef] px-3 py-1.5 text-[13px]">Members {members.length}</span>
                  </div>

                  {members.length === 0 ? (
                    <Card>
                      <EmptyState icon={Users} message="No peers found" />
                    </Card>
                  ) : (
                    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                      {members.map((person) => {
                        const hasReports = items.some((e) => e.reporting_manager_id === person.id)
                        return (
                          <Card key={person.id} className="flex items-center gap-3 p-2.5 text-[13px]">
                            <EmployeePhoto employee={person} size={42} radius={6} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate">
                                <span className="text-muted">{person.employee_id} - </span>
                                <strong className="font-bold">{person.full_name}</strong>
                              </p>
                              <p className="truncate text-xs">{person.designation}</p>
                              {person.status_label && <p className={`text-xs ${statusClass(person.status)}`}>{person.status_label}</p>}
                            </div>
                            {hasReports && (
                              <button type="button" onClick={() => setManagerId(person.id)} className="shrink-0 text-xs text-brand hover:underline">
                                View team
                              </button>
                            )}
                          </Card>
                        )
                      })}
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
