import { CheckCheck } from 'lucide-react'
import { useApi } from '@/api/useApi'
import { ApprovalList } from '@/components/ApprovalList'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import type { ApprovalItem, ListResponse } from '@/types'

export function ApprovalsTab() {
  const approvals = useApi<ListResponse<ApprovalItem>>('/myspace/approvals')

  return (
    <AsyncContent state={approvals}>
      {({ items }) =>
        items.length === 0 ? (
          <Card>
            <EmptyState icon={CheckCheck} message="All set! No requests pending approval" />
          </Card>
        ) : (
          <ApprovalList items={items} />
        )
      }
    </AsyncContent>
  )
}
