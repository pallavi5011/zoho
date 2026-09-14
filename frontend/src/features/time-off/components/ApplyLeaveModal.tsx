import { useState, type FormEvent } from 'react'
import { useApi } from '@/api/useApi'
import { Button } from '@/components/Button'
import { Field, inputClass, textareaClass } from '@/components/Field'
import { Modal } from '@/components/Modal'
import { addDays, formatDays, isWeekendDate, parseDateKey, toDateKey } from '@/lib/date'
import { useLeaveStore } from '@/store/requests'
import type { CurrentUser, LeaveBalance, LeaveRequest, ListResponse } from '@/types'

type Session = LeaveRequest['session']

/** Working days between two yyyy-mm-dd keys, inclusive (weekends skipped). */
function workingDays(from: string, to: string) {
  let count = 0
  for (let d = parseDateKey(from); toDateKey(d) <= to; d = addDays(d, 1)) if (!isWeekendDate(d)) count++
  return count
}

export function ApplyLeaveModal({ onClose }: { onClose: () => void }) {
  const balances = useApi<ListResponse<LeaveBalance>>('/leave/balances')
  const me = useApi<CurrentUser>('/me')
  const add = useLeaveStore((s) => s.add)

  const [typeId, setTypeId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [session, setSession] = useState<Session>('full_day')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const balance = balances.data?.items.find((b) => b.id === typeId)
  const singleDay = Boolean(fromDate) && fromDate === toDate
  const validRange = Boolean(fromDate && toDate) && toDate >= fromDate
  const days = !validRange ? 0 : singleDay && session !== 'full_day' ? 0.5 : workingDays(fromDate, toDate)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!balance || !fromDate || !toDate || !me.data) return setError('Please fill all required fields.')
    if (!validRange) return setError('To date cannot be before From date.')
    if (days === 0) return setError('The selected dates fall on weekends.')
    if (days > balance.available) return setError(`Only ${formatDays(balance.available)} of ${balance.name} available.`)

    add({
      id: `local-${Date.now()}`,
      employee: {
        id: me.data.id,
        employee_id: me.data.employee_id,
        full_name: me.data.full_name,
        designation: me.data.designation,
        photo_url: me.data.photo_url,
        status: null,
        status_label: null,
      },
      leave_type_id: balance.id,
      leave_type_name: balance.name,
      leave_type_code: balance.code,
      pay_type: 'Paid',
      from_date: fromDate,
      to_date: toDate,
      days,
      session: singleDay ? session : 'full_day',
      reason: reason.trim() || null,
      status: 'pending',
      requested_on: toDateKey(new Date()),
    })
    onClose()
  }

  return (
    <Modal title="Apply Leave" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 px-5 py-4">
        <Field label="Leave type" required>
          <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className={inputClass}>
            <option value="">Select leave type</option>
            {balances.data?.items.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({formatDays(b.available)} available)
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From" required>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="To" required>
            <input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
          </Field>
        </div>
        {singleDay && (
          <Field label="Session">
            <select value={session} onChange={(e) => setSession(e.target.value as Session)} className={inputClass}>
              <option value="full_day">Full day</option>
              <option value="first_half">First half</option>
              <option value="second_half">Second half</option>
            </select>
          </Field>
        )}
        <Field label="Reason for leave">
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={textareaClass} />
        </Field>
        {validRange && <p className="text-[13px] text-muted">Total: {formatDays(days)}</p>}
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  )
}
