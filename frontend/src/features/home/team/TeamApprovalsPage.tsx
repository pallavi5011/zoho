import { CheckCheck, ListFilter, X } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { ApprovalList } from '@/components/ApprovalList'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { IconButton } from '@/components/IconButton'
import type { ApprovalItem, ListResponse } from '@/types'

const DEFAULT_FILTERS = [
  { key: 'status', label: 'Status : Pending' },
  { key: 'employee_status', label: 'Employee Status : All Active Employee Requests' },
]

export function TeamApprovalsPage() {
  const approvals = useApi<ListResponse<ApprovalItem>>('/team/approvals')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const pendingOnly = filters.some((f) => f.key === 'status')

  return (
    <div className="px-5 py-3">
      <div className="flex justify-end">
        <IconButton label="Filter">
          <ListFilter className="size-4" />
        </IconButton>
      </div>

      <div className="my-3 flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <span key={filter.key} className="flex items-center gap-2 rounded border border-line bg-white px-2.5 py-1 text-xs">
            {filter.label}
            <button
              type="button"
              aria-label={`Remove filter ${filter.label}`}
              onClick={() => setFilters(filters.filter((f) => f.key !== filter.key))}
              className="text-muted hover:text-ink"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="ml-auto text-xs text-brand hover:underline">
          Reset
        </button>
      </div>

      <AsyncContent state={approvals}>
        {({ items }) => {
          const list = pendingOnly ? items.filter((item) => item.status_label === 'Pending') : items
          return list.length === 0 ? (
            <Card>
              <EmptyState icon={CheckCheck} message="There are no results that fit your criteria. Please revise your filters." />
            </Card>
          ) : (
            <ApprovalList items={list} />
          )
        }}
      </AsyncContent>
    </div>
  )
}
