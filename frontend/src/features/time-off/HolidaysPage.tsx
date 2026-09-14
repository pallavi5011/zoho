import { CalendarDays, Ellipsis, List, ListFilter, Umbrella } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { Tag } from '@/components/Tag'
import { DateStepper } from '@/components/DateStepper'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { CalendarChip, MonthGrid } from '@/components/MonthGrid'
import { cn } from '@/lib/cn'
import { formatDate, monthShort, parseDateKey, toDateKey, weekdayShort } from '@/lib/date'
import type { CurrentUser, HolidayDetail, ListResponse } from '@/types'

const ALL_LOCATIONS = 'All Locations'

export function HolidaysPage() {
  const holidays = useApi<ListResponse<HolidayDetail>>('/holidays')
  const me = useApi<CurrentUser>('/me')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [anchor, setAnchor] = useState(() => new Date())

  const year = anchor.getFullYear()
  const label = view === 'list' ? `01-Jan-${year} - 31-Dec-${year}` : `${monthShort(anchor)} ${year}`
  const step = (dir: 1 | -1) =>
    setAnchor((d) => (view === 'list' ? new Date(d.getFullYear() + dir, 0, 1) : new Date(d.getFullYear(), d.getMonth() + dir, 1)))

  return (
    <div className="px-5 py-3">
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span />
        <DateStepper label={label} onPrev={() => step(-1)} onNext={() => step(1)} />
        <div className="flex justify-end gap-2">
          <div className="flex gap-1">
            <IconButton label="List view" active={view === 'list'} aria-pressed={view === 'list'} onClick={() => setView('list')}>
              <List className="size-4" />
            </IconButton>
            <IconButton label="Calendar view" active={view === 'calendar'} aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>
              <CalendarDays className="size-4" />
            </IconButton>
          </div>
          <select aria-label="Holiday scope" value={scope} onChange={(e) => setScope(e.target.value as 'mine' | 'all')} className={cn(toolbarInputClass, 'w-[180px]')}>
            <option value="mine">My Holidays</option>
            <option value="all">All Holidays</option>
          </select>
          <IconButton label="Filter">
            <ListFilter className="size-4" />
          </IconButton>
          <IconButton label="More actions">
            <Ellipsis className="size-4" />
          </IconButton>
        </div>
      </div>

      <AsyncContent state={holidays}>
        {({ items }) => {
          const visible = items
            .filter((h) => scope === 'all' || h.location === ALL_LOCATIONS || h.location === me.data?.location)
            .sort((a, b) => a.date.localeCompare(b.date))

          if (view === 'calendar') {
            return (
              <MonthGrid
                month={anchor}
                renderDay={(date) =>
                  visible.filter((h) => h.date === toDateKey(date)).map((h) => <CalendarChip key={h.id} tone="holiday" label={h.name} sub={h.location} />)
                }
              />
            )
          }

          const inYear = visible.filter((h) => h.date.startsWith(String(year)))
          if (inYear.length === 0) {
            return (
              <Card>
                <EmptyState icon={Umbrella} message="No holidays found for this period" />
              </Card>
            )
          }

          const todayKey = toDateKey(new Date())
          return (
            <div className="overflow-x-auto rounded-lg border border-line bg-white">
              <table className="w-full min-w-[820px] text-left text-[13px]">
                <thead className="bg-[#eef1f5]">
                  <tr>
                    {['Name', 'Date', 'Location', 'Shifts', 'Classification'].map((col) => (
                      <th key={col} className="border-r border-divider px-3 py-2.5 font-normal last:border-0">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inYear.map((h) => {
                    const date = parseDateKey(h.date)
                    return (
                      <tr key={h.id} className={cn('border-b border-divider last:border-0', h.date >= todayKey && 'bg-[#f5f9fe]')}>
                        <td className="border-r border-divider px-3 py-3.5">{h.name}</td>
                        <td className="border-r border-divider px-3">
                          {formatDate(date)}, {weekdayShort(date)}
                        </td>
                        <td className="border-r border-divider px-3">
                          <Tag>{h.location}</Tag>
                        </td>
                        <td className="border-r border-divider px-3">{h.shift ? <Tag>{h.shift}</Tag> : <Tag>-</Tag>}</td>
                        <td className="px-3">
                          <Tag>{h.classification}</Tag>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        }}
      </AsyncContent>
    </div>
  )
}
