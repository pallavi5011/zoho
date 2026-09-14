import { useOutletContext } from 'react-router-dom'
import { GreetingCard } from '@/features/home/components/GreetingCard'
import { UpcomingHolidaysCard } from '@/features/home/components/UpcomingHolidaysCard'
import { WorkScheduleCard } from '@/features/home/components/WorkScheduleCard'
import type { MySpaceOverview } from '@/types'

export function ActivitiesTab() {
  const overview = useOutletContext<MySpaceOverview | null>()

  return (
    <>
      <GreetingCard name={overview?.profile.full_name ?? ''} />
      <WorkScheduleCard />
      <UpcomingHolidaysCard />
    </>
  )
}
