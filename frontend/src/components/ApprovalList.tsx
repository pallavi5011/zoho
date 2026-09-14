import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { formatDateTime } from '@/lib/date'
import type { ApprovalItem } from '@/types'

export function ApprovalList({ items }: { items: ApprovalItem[] }) {
  return (
    <Card className="divide-y divide-divider">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 px-5 py-3">
          <EmployeePhoto employee={item.requested_by} size={36} />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{item.title}</p>
            <p className="text-[13px] text-muted">
              {item.module} · {item.requested_by.full_name} · {formatDateTime(item.requested_at)}
            </p>
          </div>
          <span className="text-weekend">{item.status_label}</span>
        </div>
      ))}
    </Card>
  )
}
