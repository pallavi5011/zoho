import type { LucideIcon } from 'lucide-react'

export function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-[45px] shrink-0 items-center justify-center rounded-lg bg-[rgba(100,213,253,0.1)] text-info">
      <Icon className="size-[22px]" strokeWidth={1.5} />
    </span>
  )
}
