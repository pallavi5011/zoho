import { Hammer } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Card } from '@/components/Card'

const toTitle = (slug: string) => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export function ComingSoon() {
  const { pathname } = useLocation()
  const title = toTitle(pathname.split('/').filter(Boolean).at(-1) ?? '')

  return (
    <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <Hammer className="size-8 text-muted" strokeWidth={1.5} />
      <h2 className="text-[15px] font-bold">{title}</h2>
      <p className="text-muted">This section will be built next.</p>
    </Card>
  )
}

export function ComingSoonPage() {
  return (
    <div className="p-5">
      <ComingSoon />
    </div>
  )
}
