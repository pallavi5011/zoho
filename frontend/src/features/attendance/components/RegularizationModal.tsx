import { useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { Field, inputClass, textareaClass } from '@/components/Field'
import { Modal } from '@/components/Modal'
import { formatMinutes, toDateKey, toMinutes } from '@/lib/date'
import { useRegularizationStore } from '@/store/requests'

/** Request to correct check-in / check-out for a past day. */
export function RegularizationModal({ onClose }: { onClose: () => void }) {
  const add = useRegularizationStore((s) => s.add)
  const todayKey = toDateKey(new Date())
  const [date, setDate] = useState('')
  const [checkIn, setCheckIn] = useState('09:00')
  const [checkOut, setCheckOut] = useState('18:00')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validTimes = Boolean(checkIn && checkOut) && checkOut > checkIn

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!date || !checkIn || !checkOut || !reason.trim()) return setError('Please fill all required fields.')
    if (date > todayKey) return setError('You cannot regularize a future date.')
    if (!validTimes) return setError('Check-out must be after check-in.')

    add({ id: `local-${Date.now()}`, date, check_in: checkIn, check_out: checkOut, reason: reason.trim(), status: 'pending', requested_on: todayKey })
    onClose()
  }

  return (
    <Modal title="Regularization Request" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 px-5 py-4">
        <Field label="Date" required>
          <input type="date" value={date} max={todayKey} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in" required>
            <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Check-out" required>
            <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputClass} />
          </Field>
        </div>
        {validTimes && <p className="text-[13px] text-muted">Total: {formatMinutes(toMinutes(checkOut) - toMinutes(checkIn))} Hrs</p>}
        <Field label="Reason" required>
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={textareaClass} />
        </Field>
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
