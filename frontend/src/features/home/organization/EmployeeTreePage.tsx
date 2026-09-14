import { ListFilter, Printer } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { IconButton } from '@/components/IconButton'
import { CountBadge, PersonTileContent, TreeTile, treeColumnClass } from '@/features/home/organization/components/TreeTile'
import type { CurrentUser, EmployeeRecord, ListResponse } from '@/types'

export function EmployeeTreePage() {
  const me = useApi<CurrentUser>('/me')
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="px-5 py-3">
      <div className="mb-2 flex justify-end gap-1">
        <IconButton label="Print" onClick={() => window.print()}>
          <Printer className="size-4" />
        </IconButton>
        <IconButton label="Filter">
          <ListFilter className="size-4" />
        </IconButton>
      </div>

      <AsyncContent state={me}>
        {(user) => (
          <AsyncContent state={employees}>
            {({ items }) => {
              const byId = new Map(items.map((e) => [e.id, e]))
              const reportsOf = (id: string | null) => items.filter((e) => e.reporting_manager_id === id)
              const selected = byId.get(selectedId ?? user.id) ?? items[0]

              // Path from the top of the org to the selected person; each step is one column.
              const path: EmployeeRecord[] = []
              for (let cur: EmployeeRecord | undefined = selected; cur; cur = cur.reporting_manager_id ? byId.get(cur.reporting_manager_id) : undefined) {
                path.unshift(cur)
              }
              const columns = path.map((node, i) => ({ key: node.id, people: reportsOf(i === 0 ? null : path[i - 1].id), activeId: node.id }))
              if (selected && reportsOf(selected.id).length > 0) {
                columns.push({ key: `${selected.id}-reports`, people: reportsOf(selected.id), activeId: '' })
              }

              return (
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {columns.map((column, i) => (
                    <ul key={column.key} className={treeColumnClass(i > 0)}>
                      {column.people.map((person) => {
                        const active = person.id === column.activeId
                        return (
                          <li key={person.id} className="flex items-center gap-2">
                            <TreeTile active={active} onClick={() => setSelectedId(person.id)}>
                              <PersonTileContent person={person} />
                            </TreeTile>
                            <CountBadge count={reportsOf(person.id).length} active={active} />
                          </li>
                        )
                      })}
                    </ul>
                  ))}
                </div>
              )
            }}
          </AsyncContent>
        )}
      </AsyncContent>
    </div>
  )
}
