import {
  AlarmClock,
  CircleCheck,
  Ellipsis,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Umbrella,
  type LucideIcon,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Card } from '@/components/Card'
import { inputClass } from '@/components/Field'
import { formatDateTime } from '@/lib/date'
import type { FeedItem, FeedType } from '@/types'

const FEED_ICONS: Record<FeedType, LucideIcon> = {
  reminder: AlarmClock,
  announcement: Megaphone,
  status: MessageCircle,
  approval: CircleCheck,
  mail_alert: Mail,
  holiday: Umbrella,
}

// TODO: replace local posts/comments with POST calls once the backend exists.
export function createLocalPost(authorName: string, message: string): FeedItem {
  return {
    id: `local-${Date.now()}`,
    type: 'status',
    title: authorName,
    message,
    created_at: new Date().toISOString(),
    comments: [],
  }
}

export function FeedCard({ item, authorName }: { item: FeedItem; authorName: string }) {
  const Icon = FEED_ICONS[item.type]
  const [comments, setComments] = useState(item.comments)
  const [commenting, setCommenting] = useState(false)
  const [draft, setDraft] = useState('')

  function addComment(e: FormEvent) {
    e.preventDefault()
    const message = draft.trim()
    if (!message) return
    setComments((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, author_name: authorName, message, created_at: new Date().toISOString() },
    ])
    setDraft('')
  }

  return (
    <Card className="p-3 text-[13px]">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-[#f5f7fa] text-muted">
          <Icon className="size-4" strokeWidth={1.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p>{item.title}</p>
          <p className="text-xs text-muted">{formatDateTime(item.created_at)}</p>
        </div>
        <button type="button" aria-label="More actions" className="text-muted hover:text-ink">
          <Ellipsis className="size-4" />
        </button>
      </div>

      <p className="mt-3 whitespace-pre-line">{item.message}</p>

      {comments.map((comment) => (
        <p key={comment.id} className="mt-3 rounded bg-page px-3 py-2">
          <strong className="font-bold">{comment.author_name}</strong> {comment.message}
        </p>
      ))}

      {commenting && (
        <form onSubmit={addComment} className="mt-3">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment and press Enter"
            aria-label="Write a comment"
            className={inputClass}
          />
        </form>
      )}

      <button
        type="button"
        onClick={() => setCommenting((v) => !v)}
        className="mt-4 flex items-center gap-1.5 hover:text-brand"
      >
        <MessageSquare className="size-4" strokeWidth={1.5} />
        Comment{comments.length > 0 && ` (${comments.length})`}
      </button>
    </Card>
  )
}
