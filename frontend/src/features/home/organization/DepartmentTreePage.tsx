import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { CountBadge, PersonTileContent, TreeTile, treeColumnClass } from '@/features/home/organization/components/TreeTile'
import type { Department, EmployeeRecord, ListResponse } from '@/types'

/** "Front End" → "FE" */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function DepartmentTreePage() {
  const departments = useApi<ListResponse<Department>>('/organization/departments')
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="px-5 py-5">
      <AsyncContent state={departments}>
        {({ items: depts }) => (
          <AsyncContent state={employees}>
            {({ items }) => {
              const activeId = selectedId ?? depts[0]?.id
              const members = items.filter((e) => e.department_id === activeId)

              return (
                <div className="flex gap-6 overflow-x-auto pb-4">
                  <ul className={treeColumnClass(false)}>
                    {depts.map((dept) => {
                      const active = dept.id === activeId
                      return (
                        <li key={dept.id} className="flex items-center gap-2">
                          <TreeTile active={active} onClick={() => setSelectedId(dept.id)}>
                            <span className="flex size-[30px] shrink-0 items-center justify-center text-[11px]">{initials(dept.name)}</span>
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-bold">{dept.name}</span>
                              <span className="block truncate text-[11px] text-muted">{dept.parent_name ?? '-'}</span>
                            </span>
                          </TreeTile>
                          <CountBadge count={dept.member_count} active={active} />
                        </li>
                      )
                    })}
                  </ul>

                  <ul className={treeColumnClass(true)}>
                    {members.length === 0 && <li className="text-[13px] text-muted">No members in this department</li>}
                    {members.map((person) => (
                      <li key={person.id}>
                        <TreeTile>
                          <PersonTileContent person={person} />
                        </TreeTile>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            }}
          </AsyncContent>
        )}
      </AsyncContent>
    </div>
  )
}
