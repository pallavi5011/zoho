import { FileText, RotateCw, SlidersHorizontal, UserRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { ACTIVE_UNDERLINE } from '@/components/TabNav'
import { cn } from '@/lib/cn'
import { formatDate, formatDateTimeLong, parseDateKey, weekdayLong } from '@/lib/date'
import type { Dashboard, EmployeeRef } from '@/types'

interface WidgetProps {
  title: string
  wide?: boolean
  extra?: ReactNode
  children: ReactNode
}

/** Dashboard tile: 1 column wide, or 1.5 columns when `wide`. */
function Widget({ title, wide, extra, children }: WidgetProps) {
  return (
    <Card className={cn('flex min-h-[348px] flex-col', wide ? 'xl:col-span-3' : 'xl:col-span-2')}>
      <header className="flex h-[50px] shrink-0 items-center justify-between border-b border-divider px-6">
        <h2 className="text-[15px] font-bold">{title}</h2>
        {extra}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </Card>
  )
}

const Empty = ({ text }: { text: string }) => <p className="m-auto px-6 text-center">{text}</p>

function PeopleList({ people, empty }: { people: EmployeeRef[]; empty: string }) {
  if (people.length === 0) return <Empty text={empty} />
  return (
    <ul className="px-6">
      {people.map((person) => (
        <li key={person.id} className="flex items-center gap-3 border-b border-divider py-3 text-[13px]">
          <EmployeePhoto employee={person} size={32} radius={6} />
          <span>
            {person.employee_id} - <strong className="font-bold">{person.full_name}</strong>
          </span>
        </li>
      ))}
    </ul>
  )
}

const PRIORITY_CLASS = { low: 'text-success', medium: 'text-weekend', high: 'text-danger' }

function MyFiles({ files }: { files: Dashboard['my_files'] }) {
  const [tab, setTab] = useState<'organization' | 'employee'>('organization')
  const list = tab === 'organization' ? files.organization_files : files.employee_files

  return (
    <>
      <div role="tablist" className="grid h-[42px] grid-cols-2 border-b border-divider px-7">
        {(['organization', 'employee'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn('relative', tab === key ? cn('text-brand', ACTIVE_UNDERLINE) : 'text-muted hover:text-ink')}
          >
            {key === 'organization' ? 'Organization Files' : 'Employee Files'}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty text="No files found" />
      ) : (
        <ul className="px-5">
          {list.map((file) => (
            <li key={file.id} className="flex items-center gap-2 border-b border-divider py-3">
              <FileText className="size-5 shrink-0 text-danger" strokeWidth={1.5} />
              <span className="truncate">{file.name}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export function DashboardPage() {
  const dashboard = useApi<Dashboard>('/myspace/dashboard')

  return (
    <div className="px-[26px] pb-6 pt-2">
      <div className="mb-2 flex justify-end">
        <div className="flex items-center rounded border border-line bg-white text-muted">
          <button type="button" aria-label="Refresh" onClick={dashboard.reload} className="px-2 py-1.5 hover:text-brand">
            <RotateCw className={cn('size-4', dashboard.loading && 'animate-spin')} strokeWidth={1.5} />
          </button>
          <span className="h-4 w-px bg-line" />
          <button type="button" aria-label="Customize dashboard" className="px-2 py-1.5 hover:text-brand">
            <SlidersHorizontal className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <AsyncContent state={dashboard}>
        {(data) => (
          <div className="grid gap-2.5 xl:grid-cols-6">
            <Widget title="Birthday">
              <PeopleList people={data.birthdays} empty="No birthdays today" />
            </Widget>
            <Widget title="New Hires">
              <PeopleList people={data.new_hires} empty="No New Joinees in past 15 days." />
            </Widget>
            <Widget title="Favorites">
              <PeopleList people={data.favorites} empty="No Favorites found." />
            </Widget>

            <Widget title="Quick Links">
              {data.quick_links.length === 0 ? (
                <Empty text="No quick links" />
              ) : (
                <ul className="px-6">
                  {data.quick_links.map((link) => (
                    <li key={link.id} className="border-b border-divider py-3">
                      <a href={link.url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Widget>
            <Widget title="Announcements">
              {data.announcements.length === 0 ? (
                <Empty text="No announcements" />
              ) : (
                <ul className="px-6">
                  {data.announcements.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 border-b border-divider py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px]">{a.title}</p>
                        <p className="text-[11px] text-muted">{formatDateTimeLong(a.created_at)}</p>
                      </div>
                      <span className="flex size-8 items-center justify-center rounded-md bg-[#dfe3eb] text-white">
                        <UserRound className="size-5" />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Widget>
            <Widget title="Leave Report">
              <ul className="px-6">
                {data.leave_report.map((leave) => (
                  <li key={leave.key} className="flex items-center gap-3 border-b border-divider py-2.5">
                    <span
                      style={{ borderColor: leave.color }}
                      className="flex size-[28px] shrink-0 items-center justify-center rounded-full border-2 text-[10px]"
                    >
                      {leave.count}
                    </span>
                    <div className="text-[13px]">
                      <p>{leave.name}</p>
                      {leave.available !== null && <p className="text-[11px] text-muted">Available {leave.available} Day(s)</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </Widget>

            <Widget title="Upcoming Holidays">
              {data.upcoming_holidays.length === 0 ? (
                <Empty text="No upcoming holidays" />
              ) : (
                <ul className="px-6">
                  {data.upcoming_holidays.map((holiday) => {
                    const date = parseDateKey(holiday.date)
                    return (
                      <li key={holiday.id} className="border-b border-divider py-3 text-[13px]">
                        <p>{holiday.name}</p>
                        <p className="text-[11px] text-muted">
                          {formatDate(date)}, {weekdayLong(date)}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Widget>
            <Widget title="My Pending Tasks" wide>
              {data.pending_tasks.length === 0 ? (
                <Empty text="No pending tasks" />
              ) : (
                <ul className="px-6">
                  {data.pending_tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-3 border-b border-divider py-3 text-[13px]">
                      <p className="min-w-0 flex-1 truncate">{task.title}</p>
                      {task.due_date && <span className="text-muted">Due {formatDate(parseDateKey(task.due_date))}</span>}
                      <span className={cn('w-14 text-right capitalize', PRIORITY_CLASS[task.priority])}>{task.priority}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Widget>

            <Widget
              title="My Files"
              wide
              extra={
                <span className="flex items-center gap-1.5 text-[13px] text-muted">
                  Total Files <span className="rounded bg-page px-1.5 py-0.5 text-xs font-bold text-ink">{data.my_files.total}</span>
                </span>
              }
            >
              <MyFiles files={data.my_files} />
            </Widget>
            <Widget title="Work Anniversary">
              <PeopleList people={data.work_anniversaries} empty="No work anniversaries today" />
            </Widget>

            <Widget title="Wedding Anniversary">
              <PeopleList people={data.wedding_anniversaries} empty="No wedding anniversaries today" />
            </Widget>
            <Widget title="Lop Summary" wide>
              {data.lop_summary ? (
                <div className="m-auto text-center">
                  <p className="text-muted">{data.lop_summary.pay_period}</p>
                  <p className="mt-1 text-2xl font-bold">{data.lop_summary.lop_days} LOP day(s)</p>
                </div>
              ) : (
                <Empty text="No pay period is configured" />
              )}
            </Widget>
          </div>
        )}
      </AsyncContent>
    </div>
  )
}
