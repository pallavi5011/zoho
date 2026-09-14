import { Ellipsis, Rss } from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { createLocalPost, FeedCard } from '@/components/FeedCard'
import { PostComposer } from '@/components/PostComposer'
import { ACTIVE_UNDERLINE } from '@/components/TabNav'
import { cn } from '@/lib/cn'
import type { FeedItem, FeedType, MySpaceOverview, Paginated } from '@/types'

const FILTERS: { key: FeedType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'status', label: 'Status' },
  { key: 'announcement', label: 'Announcement' },
  { key: 'approval', label: 'Approvals' },
  { key: 'mail_alert', label: 'Mail Alerts' },
  { key: 'holiday', label: 'Holidays' },
]

export function FeedsTab() {
  const overview = useOutletContext<MySpaceOverview | null>()
  const feeds = useApi<Paginated<FeedItem>>('/myspace/feeds')
  const [filter, setFilter] = useState<FeedType | 'all'>('all')
  const [posted, setPosted] = useState<FeedItem[]>([])
  const authorName = overview?.profile.full_name ?? ''

  return (
    <>
      <PostComposer
        authorName={authorName}
        avatarColor={overview?.profile.avatar_color ?? '#8b6e62'}
        placeholder="Type @ to mention someone"
        onPost={(message) => setPosted((prev) => [createLocalPost(authorName, message), ...prev])}
      />

      <div role="tablist" className="flex h-9 items-stretch gap-4 px-3 text-[13px]">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn('relative whitespace-nowrap', filter === f.key ? ACTIVE_UNDERLINE : 'text-muted hover:text-ink')}
          >
            {f.label}
          </button>
        ))}
        <button type="button" aria-label="More filters" className="text-muted hover:text-ink">
          <Ellipsis className="size-4" />
        </button>
      </div>

      <AsyncContent state={feeds}>
        {(data) => {
          const items = [...posted, ...data.items].filter((item) => filter === 'all' || item.type === filter)
          if (items.length === 0) {
            return (
              <Card>
                <EmptyState icon={Rss} message="No feeds to show" />
              </Card>
            )
          }
          return items.map((item) => <FeedCard key={item.id} item={item} authorName={authorName} />)
        }}
      </AsyncContent>
    </>
  )
}
