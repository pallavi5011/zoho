import type { ReactNode } from 'react'

const controlBase = 'rounded border border-line bg-white px-3 text-sm outline-none transition-colors focus:border-brand'

/** Full-width form input/select (inside a Field). */
export const inputClass = `${controlBase} h-9 w-full`

/** Full-width multi-line input. */
export const textareaClass = `${controlBase} w-full py-2`

/** Compact toolbar control — no width, so pass one (e.g. `w-[260px]`). */
export const toolbarInputClass = `${controlBase} h-8`

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block text-[13px]">
      <span className="text-muted">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
