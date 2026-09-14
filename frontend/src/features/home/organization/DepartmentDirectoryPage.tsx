import { Search, Users, X } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { EmployeeCard } from '@/features/home/organization/components/EmployeeCard'
import { cn } from '@/lib/cn'
import type { CurrentUser, Department, EmployeeRecord, ListResponse } from '@/types'

// TODO: favorites are local until the backend exists.
export function DepartmentDirectoryPage() {
  const me = useApi<CurrentUser>('/me')
  const departments = useApi<ListResponse<Department>>('/organization/departments')
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  return (
    <div className="px-5 py-3">
      <AsyncContent state={departments}>
        {({ items: depts }) => (
          <AsyncContent state={employees}>
            {({ items }) => {
              const activeId = selectedId ?? me.data?.department_id ?? depts[0]?.id
              const department = depts.find((d) => d.id === activeId)
              const head = items.find((e) => e.id === department?.head_id)
              const members = items.filter((e) => e.department_id === activeId)
              const q = search.trim().toLowerCase()
              const visibleDepts = [...depts].sort((a, b) => a.name.localeCompare(b.name)).filter((d) => d.name.toLowerCase().includes(q))

              return (
                <div className="flex gap-2.5">
                  <Card className="flex h-[calc(100vh-128px)] w-[300px] shrink-0 flex-col">
                    <div className="relative border-b border-divider p-3">
                      <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Department"
                        aria-label="Search Department"
                        className={cn(toolbarInputClass, 'h-9 w-full pl-8 pr-8')}
                      />
                      {search && (
                        <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted">
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                    <ul className="flex-1 overflow-y-auto py-1">
                      {visibleDepts.length === 0 && <li className="px-4 py-3 text-[13px] text-muted">No departments found</li>}
                      {visibleDepts.map((d) => (
                        <li key={d.id}>
                          <button
                            type="button"
                            aria-current={d.id === activeId || undefined}
                            onClick={() => setSelectedId(d.id)}
                            className={cn('w-full px-4 py-2 text-left text-[13px] hover:bg-page', d.id === activeId && 'bg-[#eef5fd] font-bold text-brand')}
                          >
                            {d.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <div className="min-w-0 flex-1">
                    <Card className="mb-2.5 grid grid-cols-3 items-center px-4 py-3 text-[13px]">
                      {head ? (
                        <div className="flex items-center gap-2.5">
                          <EmployeePhoto employee={head} size={36} />
                          <div className="min-w-0">
                            <p className="truncate">
                              <span className="text-muted">{head.employee_id} - </span>
                              <strong className="font-bold">{head.full_name}</strong>
                            </p>
                            <p className="text-xs text-muted">Department head</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">No department head</span>
                      )}
                      <p className="text-center font-bold">{department?.name}</p>
                      <div className="text-right">
                        <p className="font-bold">{members.length}</p>
                        <p className="text-muted">Members</p>
                      </div>
                    </Card>

                    {members.length === 0 ? (
                      <Card>
                        <EmptyState icon={Users} message="No members in this department" />
                      </Card>
                    ) : (
                      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                        {members.map((person) => (
                          <EmployeeCard
                            key={person.id}
                            employee={person}
                            favorite={favorites.includes(person.id)}
                            onToggleFavorite={() => toggleFavorite(person.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            }}
          </AsyncContent>
        )}
      </AsyncContent>
    </div>
  )
}
