import type { ReactNode } from 'react'

/** Bold title followed by a thin rule, as on Zoho's profile cards. */
export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center gap-5">
      <h3 className="shrink-0 text-[15px] font-bold">{title}</h3>
      <span className="h-px flex-1 bg-divider" />
      {action}
    </div>
  )
}
