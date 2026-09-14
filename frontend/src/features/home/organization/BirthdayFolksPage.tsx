import { Cake, Search } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { DateStepper } from '@/components/DateStepper'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { EmployeeCard } from '@/features/home/organization/components/EmployeeCard'
import { cn } from '@/lib/cn'
import { addDays, formatDate, monthShort, pad, startOfWeek } from '@/lib/date'
import type { EmployeeRecord, ListResponse } from '@/types'

type Range = 'today' | 'week' | 'month'

const RANGES: { key: Range; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
]

/** MM-DD keys covered by the range around `date`. */
function rangeDays(range: Range, date: Date) {
  const key = (d: Date) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  if (range === 'today') return [key(date)]
  if (range === 'week') return Array.from({ length: 7 }, (_, i) => key(addDays(startOfWeek(date), i)))
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Array.from({ length: days }, (_, i) => key(new Date(date.getFullYear(), date.getMonth(), i + 1)))
}

function rangeLabel(range: Range, date: Date) {
  if (range === 'today') return formatDate(date)
  if (range === 'week') return `${formatDate(startOfWeek(date))} - ${formatDate(addDays(startOfWeek(date), 6))}`
  return `${monthShort(date)} ${date.getFullYear()}`
}

export function BirthdayFolksPage() {
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const [range, setRange] = useState<Range>('today')
  const [date, setDate] = useState(() => new Date())
  const [query, setQuery] = useState<string | null>(null)

  const step = (dir: 1 | -1) =>
    setDate((d) => (range === 'today' ? addDays(d, dir) : range === 'week' ? addDays(d, 7 * dir) : new Date(d.getFullYear(), d.getMonth() + dir, 1)))

  return (
    <div className="px-5 py-3">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <select aria-label="Range" value={range} onChange={(e) => setRange(e.target.value as Range)} className={cn(toolbarInputClass, 'h-9 w-[260px]')}>
          {RANGES.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
        <DateStepper label={rangeLabel(range, date)} onPrev={() => step(-1)} onNext={() => step(1)} />
        <div className="flex justify-end gap-2">
          {query !== null && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employee"
              aria-label="Search employee"
              className={cn(toolbarInputClass, 'w-56')}
            />
          )}
          <IconButton label="Search" active={query !== null} onClick={() => setQuery((q) => (q === null ? '' : null))}>
            <Search className="size-4" />
          </IconButton>
        </div>
      </div>

      <AsyncContent state={employees}>
        {({ items }) => {
          const days = rangeDays(range, date)
          const q = query?.trim().toLowerCase() ?? ''
          const folks = items
            .filter((e) => days.includes(e.birthday) && (!q || e.full_name.toLowerCase().includes(q)))
            .sort((a, b) => a.birthday.localeCompare(b.birthday))

          if (folks.length === 0) {
            return (
              <Card>
                <EmptyState icon={Cake} message="No Birthday buddies found." />
              </Card>
            )
          }

          return (
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {folks.map((person) => {
                const [month, day] = person.birthday.split('-').map(Number)
                return (
                  <EmployeeCard
                    key={person.id}
                    employee={person}
                    extra={
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-weekend">
                        <Cake className="size-3.5" /> {pad(day)}-{monthShort(new Date(2000, month - 1, 1))}
                      </p>
                    }
                  />
                )
              })}
            </div>
          )
        }}
      </AsyncContent>
    </div>
  )
}
