import { ChevronDown, ListChecks, ListFilter } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { Tag } from '@/components/Tag'
import { cn } from '@/lib/cn'
import { formatDate, parseDateKey } from '@/lib/date'
import { useChecklists, useTaskStore } from '@/store/tasks'
import type { Checklist } from '@/types'

/** Track Checklists (assigned to me) and Related Checklists. */
export function ChecklistsPage({ relation }: { relation: Checklist['relation'] }) {
  const checklists = useChecklists()
  const toggleItem = useTaskStore((s) => s.toggleItem)
  const [query, setQuery] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="px-5 py-3">
      <div className="mb-3 flex justify-end gap-2">
        {query !== null && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search checklists"
            aria-label="Search checklists"
            className={cn(toolbarInputClass, 'w-64')}
          />
        )}
        <IconButton label="Filter" active={query !== null} onClick={() => setQuery((q) => (q === null ? '' : null))}>
          <ListFilter className="size-4" />
        </IconButton>
      </div>

      <AsyncContent state={checklists}>
        {({ items }) => {
          const q = query?.trim().toLowerCase() ?? ''
          const list = items.filter((c) => c.relation === relation && (!q || `${c.name} ${c.related_to}`.toLowerCase().includes(q)))

          if (list.length === 0) {
            return (
              <Card>
                <EmptyState icon={ListChecks} message="No checklists to list here" />
              </Card>
            )
          }

          return (
            <div className="space-y-2.5">
              {list.map((checklist) => {
                const done = checklist.items.filter((i) => i.done).length
                const total = checklist.items.length
                const open = openId === checklist.id
                return (
                  <Card key={checklist.id} className="text-[13px]">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : checklist.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <ListChecks className="size-5 shrink-0 text-info" strokeWidth={1.5} />
                      <span className="min-w-0 flex-1 truncate font-bold">{checklist.name}</span>
                      <Tag>{checklist.related_to}</Tag>
                      <span className="w-[110px] text-right text-muted">{checklist.due_date ? formatDate(parseDateKey(checklist.due_date)) : '-'}</span>
                      <span className="flex w-[140px] items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-page">
                          <span className="block h-full bg-success" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                        </span>
                        <span className="text-xs text-muted">
                          {done}/{total}
                        </span>
                      </span>
                      <ChevronDown className={cn('size-4 text-muted transition-transform', open && 'rotate-180')} />
                    </button>
                    {open && (
                      <ul className="space-y-2 border-t border-divider px-4 py-3">
                        {checklist.items.map((item) => (
                          <li key={item.id}>
                            <label className="flex items-center gap-2.5">
                              <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id, !item.done)} />
                              <span className={cn(item.done && 'text-muted line-through')}>{item.title}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                )
              })}
            </div>
          )
        }}
      </AsyncContent>
    </div>
  )
}
