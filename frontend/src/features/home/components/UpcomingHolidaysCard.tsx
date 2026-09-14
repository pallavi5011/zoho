import { Umbrella } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { IconTile } from '@/features/home/components/IconTile'
import { formatDate, parseDateKey, weekdayLong } from '@/lib/date'
import type { Holiday, ListResponse } from '@/types'

const PREVIEW_COUNT = 3

export function UpcomingHolidaysCard() {
  const holidays = useApi<ListResponse<Holiday>>('/holidays/upcoming')
  const [showAll, setShowAll] = useState(false)

  return (
    <AsyncContent state={holidays}>
      {({ items }) => (
        <Card className="flex gap-4 p-5">
          <IconTile icon={Umbrella} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-bold leading-[21px]">Upcoming Holidays</h2>

            {items.length === 0 ? (
              <p className="mt-3 text-muted">No upcoming holidays.</p>
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {(showAll ? items : items.slice(0, PREVIEW_COUNT)).map((holiday) => {
                  const date = parseDateKey(holiday.date)
                  return (
                    <div
                      key={holiday.id}
                      className="min-w-[144px] rounded border border-[#46acd0] border-l-[3px] border-l-[#55b0ff] px-4 py-1.5"
                    >
                      <p>{holiday.name}</p>
                      <p className="text-[13px] text-muted">
                        {formatDate(date)}, {weekdayLong(date)}
                      </p>
                    </div>
                  )
                })}
                {items.length > PREVIEW_COUNT && (
                  <button type="button" onClick={() => setShowAll((v) => !v)} className="text-brand hover:underline">
                    {showAll ? 'View less' : 'View all'}
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </AsyncContent>
  )
}
