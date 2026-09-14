import { ChevronDown, Plane, Plus } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { cn } from '@/lib/cn'
import type { ListResponse, RelatedDataItem } from '@/types'

export function RelatedDataTab() {
  const related = useApi<ListResponse<RelatedDataItem>>('/myspace/related-data')
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <AsyncContent state={related}>
      {({ items }) =>
        items.map((item) => {
          const open = openKey === item.key
          return (
            <Card key={item.key}>
              <div className="flex h-[52px] items-center gap-3 px-3 text-[13px]">
                <Plane className="size-5 text-info" strokeWidth={1.5} />
                <p className="flex-1 font-bold">{item.label}</p>
                <button type="button" aria-label={`Add ${item.label}`} className="text-muted hover:text-brand">
                  <Plus className="size-4" />
                </button>
                <span className="flex size-6 items-center justify-center rounded-full bg-page text-[11px]">{item.count}</span>
                <button
                  type="button"
                  aria-label={`${open ? 'Collapse' : 'Expand'} ${item.label}`}
                  aria-expanded={open}
                  onClick={() => setOpenKey(open ? null : item.key)}
                  className="flex size-6 items-center justify-center rounded-full border border-line text-muted hover:text-ink"
                >
                  <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
                </button>
              </div>
              {open && <p className="border-t border-divider py-6 text-center text-[13px] text-muted">No records found</p>}
            </Card>
          )
        })
      }
    </AsyncContent>
  )
}
