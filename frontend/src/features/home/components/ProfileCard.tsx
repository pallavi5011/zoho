import { Fragment } from 'react'
import { Card } from '@/components/Card'
import { InitialAvatar } from '@/components/InitialAvatar'
import { statusClass } from '@/features/home/presence'
import { cn } from '@/lib/cn'
import { splitDuration } from '@/lib/date'
import { useTodayAttendance } from '@/store/attendance'
import type { MySpaceOverview } from '@/types'

interface ProfileCardProps {
  profile: MySpaceOverview['profile']
  /** Zoho hides name and designation on the Profile and Files tabs. */
  compact?: boolean
}

export function ProfileCard({ profile, compact }: ProfileCardProps) {
  const { checkedIn, workedMs, toggleCheckIn } = useTodayAttendance()
  const timer = splitDuration(workedMs)

  return (
    <Card className="flex flex-col items-center px-5 pb-4 text-center">
      <InitialAvatar
        name={profile.full_name}
        color={profile.avatar_color}
        className="-mt-16 size-[98px] rounded-xl border border-white/70 text-[56px] font-light"
      />

      {!compact && (
        <>
          <p className="mt-[18px]">
            <span className="text-muted">{profile.employee_id} - </span>
            <strong className="font-bold">{profile.full_name}</strong>
          </p>
          <p className="text-muted">{profile.designation}</p>
        </>
      )}
      <p className={cn(compact ? 'mt-7' : 'mt-2.5', statusClass(profile.status))}>{profile.status_label}</p>

      <div className="mt-2 flex items-center gap-1.5" role="timer" aria-label="Time worked today">
        {timer.map((part, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="font-bold">:</span>}
            <span className="flex size-[34px] items-center justify-center rounded-lg bg-page text-base font-bold tabular-nums">
              {part}
            </span>
          </Fragment>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleCheckIn}
        className={cn(
          'mt-2 h-8 min-w-[110px] rounded border bg-white px-3.5 transition-colors',
          checkedIn ? 'border-danger text-danger hover:bg-danger/5' : 'border-success text-success hover:bg-success/5',
        )}
      >
        {checkedIn ? 'Check-out' : 'Check-in'}
      </button>
    </Card>
  )
}
