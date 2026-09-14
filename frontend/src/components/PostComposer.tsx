import { useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { InitialAvatar } from '@/components/InitialAvatar'

interface PostComposerProps {
  authorName: string
  avatarColor: string
  placeholder: string
  onPost: (message: string) => void
}

export function PostComposer({ authorName, avatarColor, placeholder, onPost }: PostComposerProps) {
  const [text, setText] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    const message = text.trim()
    if (!message) return
    onPost(message)
    setText('')
  }

  return (
    <Card className="p-3">
      <form onSubmit={submit} className="flex items-center gap-3">
        <InitialAvatar name={authorName} color={avatarColor} className="size-8 rounded-md text-sm" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8a8a8a]"
        />
        {text.trim() && <Button type="submit">Post</Button>}
      </form>
    </Card>
  )
}
