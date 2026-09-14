import type { ReactNode } from 'react'

/** Small grey label, e.g. a location or folder name inside a table. */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded bg-[#eef1f5] px-2 py-0.5 text-[11px]">{children}</span>
}
