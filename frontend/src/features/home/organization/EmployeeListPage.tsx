import { ListFilter, Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { paginate, Pagination } from '@/components/Pagination'
import { nextSort, SortButton, type SortState } from '@/components/SortButton'
import { cn } from '@/lib/cn'
import type { EmployeeRecord, ListResponse } from '@/types'

type SortKey = 'employee_id' | 'first_name' | 'last_name' | 'preferred_name' | 'email' | 'department' | 'designation'

const COLUMNS: { key: SortKey | 'photo'; label: string }[] = [
  { key: 'employee_id', label: 'Employee ID' },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'preferred_name', label: 'Preferred Name' },
  { key: 'email', label: 'Email address' },
  { key: 'photo', label: 'Photo' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
]

export function EmployeeListPage() {
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const [sort, setSort] = useState<SortState<SortKey>>({ key: 'employee_id', dir: 1 })
  const [pageSize, setPageSize] = useState(50)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn('px-5 py-3', expanded && 'fixed inset-0 z-40 overflow-auto bg-page')}>
      <div className="mb-3 flex items-center gap-2">
        <select aria-label="View" defaultValue="employee" className={cn(toolbarInputClass, 'w-[260px]')}>
          <option value="employee">Employee View</option>
        </select>
        {query !== null && (
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search by name, ID or email"
            aria-label="Search employees"
            className={cn(toolbarInputClass, 'w-72')}
          />
        )}
        <div className="ml-auto flex gap-2">
          <IconButton label={expanded ? 'Exit full screen' : 'Full screen'} onClick={() => setExpanded((v) => !v)}>
            {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </IconButton>
          <IconButton
            label="Filter"
            active={query !== null}
            onClick={() => {
              setQuery((q) => (q === null ? '' : null))
              setPage(0)
            }}
          >
            <ListFilter className="size-4" />
          </IconButton>
        </div>
      </div>

      <AsyncContent state={employees}>
        {({ items }) => {
          const q = query?.trim().toLowerCase() ?? ''
          const filtered = items.filter((e) => !q || [e.full_name, e.employee_id, e.email].some((v) => v.toLowerCase().includes(q)))
          const sorted = [...filtered].sort((a, b) => (a[sort.key] ?? '').localeCompare(b[sort.key] ?? '') * sort.dir)
          const { current, rows } = paginate(sorted, page, pageSize)
          const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id))

          const toggleAll = () =>
            setSelected(allSelected ? selected.filter((id) => !rows.some((r) => r.id === id)) : [...new Set([...selected, ...rows.map((r) => r.id)])])
          const toggleRow = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

          return (
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-[13px]">
                  <thead className="bg-[#eef1f5]">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <input type="checkbox" aria-label="Select all on this page" checked={allSelected} onChange={toggleAll} />
                      </th>
                      {COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          aria-sort={sort.key === col.key ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}
                          className="px-3 py-3 font-normal"
                        >
                          {col.key === 'photo' ? (
                            col.label
                          ) : (
                            <SortButton label={col.label} active={sort.key === col.key} dir={sort.dir} onClick={() => setSort(nextSort(sort, col.key as SortKey))} />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={COLUMNS.length + 1} className="px-4 py-10 text-center text-muted">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      rows.map((e) => (
                        <tr key={e.id} className={cn('border-b border-divider last:border-0', selected.includes(e.id) && 'bg-[#f5f9fe]')}>
                          <td className="px-4 py-3.5">
                            <input type="checkbox" aria-label={`Select ${e.full_name}`} checked={selected.includes(e.id)} onChange={() => toggleRow(e.id)} />
                          </td>
                          <td className="px-3">{e.employee_id}</td>
                          <td className="px-3">{e.first_name}</td>
                          <td className="px-3">{e.last_name}</td>
                          <td className="px-3">{e.preferred_name}</td>
                          <td className="px-3">{e.email}</td>
                          <td className="px-3">
                            <EmployeePhoto employee={e} size={38} radius={6} />
                          </td>
                          <td className="px-3">{e.department}</td>
                          <td className="px-3">{e.designation}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                total={sorted.length}
                page={current}
                pageSize={pageSize}
                pageSizes={[10, 25, 50]}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setPage(0)
                }}
              >
                Total Record Count: <span className="text-brand">{filtered.length}</span>
                {selected.length > 0 && <span className="ml-3 text-muted">({selected.length} selected)</span>}
              </Pagination>
            </div>
          )
        }}
      </AsyncContent>
    </div>
  )
}
