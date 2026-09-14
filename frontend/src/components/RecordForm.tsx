import type { FormEvent, ReactNode } from 'react'
import { Button } from '@/components/Button'
import { inputClass } from '@/components/Field'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/cn'
import type { CurrentUser, EmployeeRef } from '@/types'

export type SaveMode = 'submit' | 'new' | 'draft'

/** Label on the left, field on the right — Zoho form row. `muted` rows are read-only info. */
export function FormRow({ label, required, muted, children }: { label: string; required?: boolean; muted?: boolean; children: ReactNode }) {
  return (
    <label className="grid grid-cols-[160px_1fr] items-center gap-3 text-[13px]">
      <span className={cn(muted && 'italic text-muted')}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <div className={cn(muted && 'italic text-muted')}>{children}</div>
    </label>
  )
}

/** Keeps the two-column grid aligned when a column has no field in this row. */
export const FormSpacer = () => <span className="hidden md:block" />

/** Disabled select showing the logged-in employee, as on every Zoho form. */
export function EmployeeField({ user, label = 'EmployeeID', nameFirst }: { user: CurrentUser | null; label?: string; nameFirst?: boolean }) {
  const text = !user ? 'Loading…' : nameFirst ? `${user.full_name} ${user.employee_id}` : `${user.employee_id} ${user.full_name}`
  return (
    <FormRow label={label} required>
      <select disabled aria-label="Employee" className={cn(inputClass, 'bg-page')}>
        <option>{text}</option>
      </select>
    </FormRow>
  )
}

export const toEmployeeRef = (user: EmployeeRef | CurrentUser): EmployeeRef => ({
  id: user.id,
  employee_id: user.employee_id,
  full_name: user.full_name,
  designation: user.designation,
  photo_url: user.photo_url,
  status: null,
  status_label: null,
})

interface RecordFormModalProps {
  title: string
  section: string
  error: string | null
  onSave: (mode: SaveMode) => void
  onClose: () => void
  /** Two-column grid (default) or a single column of rows. */
  columns?: 1 | 2
  allowNew?: boolean
  allowDraft?: boolean
  /** Further titled sections below the first one. */
  extraSections?: { title: string; content: ReactNode }[]
  /** FormRow / FormSpacer items of the first section, laid out row by row. */
  children: ReactNode
}

/** Zoho "Add Record" dialog: titled sections of fields plus Submit / Submit and New / Save Draft / Cancel. */
export function RecordFormModal({
  title,
  section,
  error,
  onSave,
  onClose,
  columns = 2,
  allowNew = true,
  allowDraft = true,
  extraSections = [],
  children,
}: RecordFormModalProps) {
  const gridClass = cn('grid gap-x-10 gap-y-4', columns === 2 && 'md:grid-cols-2')

  function submit(e: FormEvent) {
    e.preventDefault()
    onSave('submit')
  }

  return (
    <Modal title={title} onClose={onClose} className={columns === 2 ? 'max-w-4xl' : 'max-w-2xl'}>
      <form onSubmit={submit}>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto bg-page p-4">
          {[{ title: section, content: children }, ...extraSections].map((s) => (
            <section key={s.title} className="rounded-lg bg-white p-5">
              <h3 className="mb-5 font-bold">{s.title}</h3>
              <div className={gridClass}>{s.content}</div>
            </section>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-divider px-5 py-3">
          <Button type="submit">Submit</Button>
          {allowNew && <Button onClick={() => onSave('new')}>Submit and New</Button>}
          {allowDraft && (
            <Button variant="secondary" onClick={() => onSave('draft')}>
              Save Draft
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {error && <p className="ml-2 text-[13px] text-danger">{error}</p>}
        </div>
      </form>
    </Modal>
  )
}
