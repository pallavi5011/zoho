import { PartyPopper, Star } from 'lucide-react'
import { Fragment } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { cn } from '@/lib/cn'
import { formatDate, formatExperience, monthLong, parseDateKey } from '@/lib/date'
import type { CareerEvent, CareerHistory } from '@/types'

function groupByYear(events: CareerEvent[]) {
  const groups = new Map<string, CareerEvent[]>()
  for (const event of [...events].sort((a, b) => b.date.localeCompare(a.date))) {
    const year = event.date.slice(0, 4)
    groups.set(year, [...(groups.get(year) ?? []), event])
  }
  return [...groups]
}

function EventCard({ event }: { event: CareerEvent }) {
  const joined = event.type === 'joined'
  const Icon = joined ? PartyPopper : Star

  return (
    <div
      className={cn(
        'flex gap-4 rounded-md border px-5 py-4 text-[13px]',
        joined ? 'border-[#e1eee5] bg-[#f3f9f5]' : 'border-[#f1d9c4] bg-[#fcefe3]',
      )}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md border bg-white',
          joined ? 'border-[#d3eadb] text-success' : 'border-[#f5d7bd] text-[#f08a3c]',
        )}
      >
        <Icon className="size-4" strokeWidth={1.5} />
      </span>
      {joined ? (
        <p className="self-center">{event.message}</p>
      ) : (
        <dl className="grid grid-cols-[120px_1fr] gap-y-2">
          {event.changes.map((change) => (
            <Fragment key={change.label}>
              <dt>{change.label}:</dt>
              <dd>{change.value ?? '-'}</dd>
            </Fragment>
          ))}
          {event.message && (
            <>
              <dt>Message:</dt>
              <dd>{event.message}</dd>
            </>
          )}
        </dl>
      )}
    </div>
  )
}

export function CareerHistoryTab() {
  const history = useApi<CareerHistory>('/myspace/career-history')

  return (
    <AsyncContent state={history}>
      {(data) => (
        <>
          <Card className="grid grid-cols-3 px-3 py-3 text-[13px]">
            <div>
              <p>Current Experience</p>
              <p className="font-bold">{formatExperience(data.current_experience_months)}</p>
            </div>
            <div>
              <p>Total Experience</p>
              <p className="font-bold">{formatExperience(data.total_experience_months)}</p>
            </div>
            <div className="text-right">
              <p>Date of Joining</p>
              <p className="font-bold">{formatDate(parseDateKey(data.date_of_joining))}</p>
            </div>
          </Card>

          {groupByYear(data.timeline).map(([year, events]) => (
            <section key={year}>
              <h3 className="px-3 pb-2 pt-2 text-[17px] font-bold">{year}</h3>
              <ol className="relative space-y-4 before:absolute before:inset-y-0 before:left-[78px] before:w-px before:bg-[#d9dde3]">
                {events.map((event) => {
                  const date = parseDateKey(event.date)
                  return (
                    <li key={event.id} className="relative grid grid-cols-[62px_1fr] items-center gap-4">
                      <div className="text-center">
                        <p className="text-[13px] font-bold">{date.getDate()}</p>
                        <p className="text-[11px] text-muted">{monthLong(date)}</p>
                      </div>
                      <EventCard event={event} />
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </>
      )}
    </AsyncContent>
  )
}
