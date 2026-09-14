import { ListFilter, Megaphone, MessageSquare, Search, ThumbsUp, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { cn } from '@/lib/cn'
import { formatDateTimeLong } from '@/lib/date'
import type { Announcement, ListResponse } from '@/types'

// TODO: likes are local until the backend exists.
export function AnnouncementsPage() {
  const announcements = useApi<ListResponse<Announcement>>('/organization/announcements')
  const [query, setQuery] = useState<string | null>(null)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="px-5 py-3">
      <div className="mb-3 flex justify-end gap-2">
        {query !== null && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search announcements"
            aria-label="Search announcements"
            className={cn(toolbarInputClass, 'w-64')}
          />
        )}
        <IconButton label="Search" active={query !== null} onClick={() => setQuery((q) => (q === null ? '' : null))}>
          <Search className="size-4" />
        </IconButton>
        <IconButton label="Filter">
          <ListFilter className="size-4" />
        </IconButton>
      </div>

      <AsyncContent state={announcements}>
        {({ items }) => {
          const q = query?.trim().toLowerCase() ?? ''
          const list = items.filter((a) => !q || a.title.toLowerCase().includes(q))

          if (list.length === 0) {
            return (
              <Card>
                <EmptyState icon={Megaphone} message="No announcements found" />
              </Card>
            )
          }

          return (
            <div className="space-y-2.5">
              {list.map((a) => {
                const isLiked = liked[a.id] ?? a.liked_by_me
                const likes = a.likes - (a.liked_by_me ? 1 : 0) + (isLiked ? 1 : 0)
                const open = openId === a.id

                return (
                  <Card key={a.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#dfe3eb] text-white">
                        <UserRound className="size-5" />
                      </span>
                      <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : a.id)} className="min-w-0 flex-1 text-left">
                        <p className="truncate font-bold">{a.title}</p>
                        <p className="text-[11px] text-muted">
                          {a.author_name} · {formatDateTimeLong(a.created_at)}
                        </p>
                      </button>
                      <button
                        type="button"
                        aria-label={isLiked ? 'Unlike' : 'Like'}
                        aria-pressed={isLiked}
                        onClick={() => setLiked((prev) => ({ ...prev, [a.id]: !isLiked }))}
                        className={cn('flex items-center gap-1 text-[13px]', isLiked ? 'text-brand' : 'hover:text-brand')}
                      >
                        {likes}
                        <ThumbsUp className={cn('size-4', isLiked && 'fill-brand/20')} strokeWidth={1.5} />
                      </button>
                      <span className="ml-5 flex items-center gap-1 text-[13px]">
                        {a.comments_count}
                        <MessageSquare className="size-4 text-brand" strokeWidth={1.5} />
                      </span>
                    </div>
                    {open && <p className="mt-3 whitespace-pre-line pl-11 text-[13px]">{a.body}</p>}
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
