import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { LeaveTypeIcon } from '@/components/LeaveTypeIcon'
import { cn } from '@/lib/cn'
import { formatDays } from '@/lib/date'
import type { LeaveBalance, ListResponse } from '@/types'

export function LeaveTab() {
  const balances = useApi<ListResponse<LeaveBalance>>('/leave/balances')

  return (
    <AsyncContent state={balances}>
      {({ items }) =>
        items.map((balance) => (
          <Card key={balance.id} className="flex items-center gap-4 px-3 py-4 text-[13px]">
            <LeaveTypeIcon code={balance.code} color={balance.color} />
            <p className="min-w-0 flex-1 font-bold">{balance.name}</p>
            <div className="w-[118px]">
              <p className="text-muted">Available</p>
              <p className={cn(balance.available > 0 && 'text-success')}>{formatDays(balance.available)}</p>
            </div>
            <div className="w-[150px]">
              <p className="text-muted">Booked</p>
              <p className="font-bold">{formatDays(balance.booked)}</p>
            </div>
          </Card>
        ))
      }
    </AsyncContent>
  )
}
