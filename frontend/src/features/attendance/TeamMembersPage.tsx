import { Search, Users } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/date'
import type { AttendanceStatus, ListResponse, TeamAttendance } from '@/types'

/** Board column order; empty columns are hidden. */
const COLUMN_ORDER: AttendanceStatus[] = ['present', 'on_duty', 'yet_to_check_in', 'on_leave', 'absent', 'holiday', 'weekend']

export function TeamMembersPage() {
  const team = useApi<ListResponse<TeamAttendance>>('/attendance/team')
  const [query, setQuery] = useState<string | null>(null)

  return (
    <div className="px-5 py-3">
      <div className="mb-3 flex justify-end gap-2">
        {query !== null && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee"
            aria-label="Search employee"
            className={cn(toolbarInputClass, 'w-64')}
          />
        )}
        <IconButton label="Search employee" active={query !== null} onClick={() => setQuery((q) => (q === null ? '' : null))}>
          <Search className="size-4" />
        </IconButton>
      </div>

      <AsyncContent state={team}>
        {({ items }) => {
          const q = query?.trim().toLowerCase() ?? ''
          const members = items.filter((m) => !q || `${m.employee.full_name} ${m.employee.employee_id}`.toLowerCase().includes(q))
          const columns = COLUMN_ORDER.map((status) => ({
            status,
            members: members.filter((m) => (m.employee.status ?? 'yet_to_check_in') === status),
          })).filter((c) => c.members.length > 0)

          if (columns.length === 0) {
            return (
              <Card>
                <EmptyState icon={Users} message="No team members found" />
              </Card>
            )
          }

          return (
            <div className="flex items-start gap-2.5 overflow-x-auto pb-4">
              {columns.map((column) => (
                <section key={column.status} className="w-[280px] shrink-0 rounded-lg bg-[#e6e9f0] p-2.5 text-[13px]">
                  <header className="mb-2 flex items-center justify-between px-1 py-1.5">
                    <h3 className="text-sm font-bold">{column.members[0].employee.status_label ?? 'Yet to check-in'}</h3>
                    <span className="rounded bg-white px-2 text-xs">{column.members.length}</span>
                  </header>
                  <ul className="space-y-2">
                    {column.members.map(({ employee, location, shift, check_in }) => (
                      <li key={employee.id} className="rounded-lg bg-white">
                        <div className="flex items-center gap-3 p-2.5">
                          <EmployeePhoto employee={employee} size={32} radius={6} />
                          <div className="min-w-0">
                            <p className="truncate">
                              <span className="text-muted">{employee.employee_id} - </span>
                              <strong className="font-bold">{employee.full_name}</strong>
                            </p>
                            <p className="text-xs text-muted">{location}</p>
                          </div>
                        </div>
                        <p className="border-t border-divider px-2.5 py-2 text-xs">
                          {shift.name} - {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                          {check_in && <span className="text-success"> · In at {formatTime(check_in)}</span>}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )
        }}
      </AsyncContent>
    </div>
  )
}
