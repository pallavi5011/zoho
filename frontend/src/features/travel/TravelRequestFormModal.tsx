import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { inputClass } from '@/components/Field'
import { EmployeeField, FormRow, FormSpacer, RecordFormModal, toEmployeeRef, type SaveMode } from '@/components/RecordForm'
import { parseDateKey } from '@/lib/date'
import { useTravelRequests, useTravelRequestStore } from '@/store/requests'
import type { CurrentUser, Department, ListResponse } from '@/types'

const emptyForm = () => ({ department: '', departure: '', purpose: '', billable: '', place: '', arrival: '', duration: '', customer: '' })
type TravelForm = ReturnType<typeof emptyForm>

/** Inclusive number of days between two yyyy-mm-dd keys. */
const tripDays = (from: string, to: string) => Math.round((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / 86_400_000) + 1

// TODO: POST /travel/requests once the backend exists; requests are kept locally for now.
export function TravelRequestFormModal({ onClose }: { onClose: () => void }) {
  const me = useApi<CurrentUser>('/me')
  const departments = useApi<ListResponse<Department>>('/organization/departments')
  const requests = useTravelRequests()
  const add = useTravelRequestStore((s) => s.add)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const user = me.data

  function update(key: keyof TravelForm, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value }
      // Fill the duration from the dates; it stays editable.
      if ((key === 'departure' || key === 'arrival') && next.departure && next.arrival && next.arrival >= next.departure) {
        next.duration = String(tripDays(next.departure, next.arrival))
      }
      return next
    })
  }

  function save(mode: SaveMode) {
    if (!user) return
    if (mode !== 'draft') {
      if (form.departure && form.arrival && form.arrival < form.departure) return setError('Expected date of arrival cannot be before departure.')
      if (form.duration && !(Number(form.duration) > 0)) return setError('Expected duration must be a positive number.')
      if (form.billable === 'yes' && !form.customer.trim()) return setError('Please enter the customer name.')
    }

    const now = new Date().toISOString()
    const nextNumber = (requests.data?.items.length ?? 0) + 1
    add({
      id: `local-${Date.now()}`,
      travel_id: `TR-${String(nextNumber).padStart(4, '0')}`,
      employee: toEmployeeRef(user),
      department: departments.data?.items.find((d) => d.id === form.department)?.name ?? null,
      place_of_visit: form.place.trim() || null,
      departure_date: form.departure || null,
      arrival_date: form.arrival || null,
      purpose: form.purpose.trim() || null,
      duration_days: form.duration ? Number(form.duration) : null,
      is_billable: form.billable ? form.billable === 'yes' : null,
      customer_name: form.billable === 'yes' ? form.customer.trim() || null : null,
      status: 'pending',
      is_draft: mode === 'draft',
      added_by: user.full_name,
      added_time: now,
      modified_by: user.full_name,
      modified_time: now,
    })

    if (mode === 'new') {
      setForm(emptyForm())
      setError(null)
    } else {
      onClose()
    }
  }

  return (
    <RecordFormModal title="Add Travel Request" section="Travel Initiate" error={error} onSave={save} onClose={onClose}>
      <EmployeeField user={user} label="Employee ID" nameFirst />
      <FormRow label="Place of visit">
        <input value={form.place} onChange={(e) => update('place', e.target.value)} className={inputClass} />
      </FormRow>

      <FormRow label="Employee Department">
        <select value={form.department} onChange={(e) => update('department', e.target.value)} className={inputClass}>
          <option value="">Select</option>
          {departments.data?.items.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Expected date of arrival">
        <input type="date" value={form.arrival} min={form.departure || undefined} onChange={(e) => update('arrival', e.target.value)} className={inputClass} />
      </FormRow>

      <FormRow label="Expected date of departure">
        <input type="date" value={form.departure} onChange={(e) => update('departure', e.target.value)} className={inputClass} />
      </FormRow>
      <FormRow label="Expected duration in days">
        <input type="number" min={1} value={form.duration} onChange={(e) => update('duration', e.target.value)} className={inputClass} />
      </FormRow>

      <FormRow label="Purpose of visit">
        <input value={form.purpose} onChange={(e) => update('purpose', e.target.value)} className={inputClass} />
      </FormRow>
      <FormRow label="Customer name" required={form.billable === 'yes'}>
        <input value={form.customer} disabled={form.billable !== 'yes'} onChange={(e) => update('customer', e.target.value)} className={inputClass} />
      </FormRow>

      <FormRow label="Is billable to customer">
        <select value={form.billable} onChange={(e) => update('billable', e.target.value)} className={inputClass}>
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </FormRow>
      <FormSpacer />
    </RecordFormModal>
  )
}
