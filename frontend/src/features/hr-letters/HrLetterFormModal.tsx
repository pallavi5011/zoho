import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { inputClass, textareaClass } from '@/components/Field'
import { EmployeeField, FormRow, FormSpacer, RecordFormModal, toEmployeeRef, type SaveMode } from '@/components/RecordForm'
import { formatDate, formatExperience, parseDateKey, toDateKey } from '@/lib/date'
import { useHrLetterStore } from '@/store/requests'
import type { CurrentUser, EmployeeRecord, HrLetterTypeConfig, ListResponse } from '@/types'

/** Whole months between a yyyy-mm-dd date and today. */
function monthsSince(key: string) {
  const from = parseDateKey(key)
  const now = new Date()
  return (now.getFullYear() - from.getFullYear()) * 12 + now.getMonth() - from.getMonth() - (now.getDate() < from.getDate() ? 1 : 0)
}

const emptyForm = () => ({ date: toDateKey(new Date()), reason: '', otherReason: '', addressChanged: '', newAddress: '' })

// TODO: POST /hr-letters/requests once the backend exists; requests are kept locally for now.
export function HrLetterFormModal({ config, onClose }: { config: HrLetterTypeConfig; onClose: () => void }) {
  const me = useApi<CurrentUser>('/me')
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const add = useHrLetterStore((s) => s.add)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const update = (key: keyof ReturnType<typeof emptyForm>, value: string) => setForm((f) => ({ ...f, [key]: value }))
  const user = me.data
  const record = employees.data?.items.find((e) => e.id === user?.id)
  const otherChosen = form.reason === 'Others'
  const addressChanged = form.addressChanged === 'yes'

  function save(mode: SaveMode) {
    if (!user) return
    if (mode !== 'draft') {
      if (!form.date || !form.reason) return setError('Please fill all required fields.')
      if (otherChosen && !form.otherReason.trim()) return setError('Please enter the reason for request.')
      if (config.asks_address_change && !form.addressChanged) return setError('Please tell us whether your present address has changed.')
      if (addressChanged && !form.newAddress.trim()) return setError('Please enter your new present address.')
    }

    add({
      id: `local-${Date.now()}`,
      letter_type: config.key,
      employee: toEmployeeRef(user),
      date_of_request: form.date,
      reason: form.reason,
      other_reason: otherChosen ? form.otherReason.trim() || null : null,
      address_changed: config.asks_address_change && form.addressChanged ? addressChanged : null,
      new_present_address: addressChanged ? form.newAddress.trim() || null : null,
      status: 'pending',
      is_draft: mode === 'draft',
    })

    if (mode === 'new') {
      setForm(emptyForm())
      setError(null)
    } else {
      onClose()
    }
  }

  return (
    <RecordFormModal title={`Add ${config.name}`} section={`${config.name} Details`} error={error} onSave={save} onClose={onClose}>
      <EmployeeField user={user} />
      <FormRow label="Date of request" required>
        <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className={inputClass} />
      </FormRow>

      <FormRow label="Date of Joining" muted>
        {record ? formatDate(parseDateKey(record.date_of_joining)) : '-'}
      </FormRow>
      <FormRow label="Reason for request" required>
        <select value={form.reason} onChange={(e) => update('reason', e.target.value)} className={inputClass}>
          <option value="">Select</option>
          {config.reasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </FormRow>

      <FormRow label="Designation" muted>
        {user?.designation ?? '-'}
      </FormRow>
      {otherChosen ? (
        <FormRow label="Enter the Reason for request" required>
          <textarea rows={2} value={form.otherReason} onChange={(e) => update('otherReason', e.target.value)} className={textareaClass} />
        </FormRow>
      ) : (
        <FormSpacer />
      )}

      {config.show_department && (
        <FormRow label="Department" muted>
          {user?.department ?? '-'}
        </FormRow>
      )}
      {config.show_experience && (
        <FormRow label="Current Experience" muted>
          {record ? formatExperience(monthsSince(record.date_of_joining)) : '-'}
        </FormRow>
      )}

      {config.asks_address_change && (
        <FormRow label="Is there any change in Present address" required>
          <select value={form.addressChanged} onChange={(e) => update('addressChanged', e.target.value)} className={inputClass}>
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </FormRow>
      )}
      {config.asks_address_change && addressChanged && (
        <FormRow label="New Present Address" required>
          <textarea rows={3} value={form.newAddress} onChange={(e) => update('newAddress', e.target.value)} className={textareaClass} />
        </FormRow>
      )}
    </RecordFormModal>
  )
}
