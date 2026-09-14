import { Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Field, inputClass, textareaClass } from '@/components/Field'
import { Modal } from '@/components/Modal'
import { EmployeeSummary } from '@/features/home/components/EmployeeSummary'
import { formatDate, parseDateKey } from '@/lib/date'
import type { Delegation, EmployeeRef, ListResponse } from '@/types'

// TODO: POST/DELETE to the backend; for now changes live only in this page.
function DelegationForm({ onClose, onSave }: { onClose: () => void; onSave: (delegation: Delegation) => void }) {
  const employees = useApi<ListResponse<EmployeeRef>>('/employees')
  const [delegateId, setDelegateId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const delegate = employees.data?.items.find((emp) => emp.id === delegateId)
    if (!delegate || !fromDate || !toDate) return setError('Please fill all required fields.')
    if (toDate < fromDate) return setError('To date cannot be before From date.')
    onSave({ id: `local-${Date.now()}`, delegate, from_date: fromDate, to_date: toDate, reason: reason.trim() || null })
  }

  return (
    <Modal title="Add Delegation" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 px-5 py-4">
        <Field label="Delegate to" required>
          <select value={delegateId} onChange={(e) => setDelegateId(e.target.value)} className={inputClass}>
            <option value="">Select employee</option>
            {employees.data?.items.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_id} - {emp.full_name}
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
        <Field label="Reason">
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={textareaClass} />
        </Field>
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  )
}

export function DelegationPage() {
  const delegations = useApi<ListResponse<Delegation>>('/myspace/delegations')
  const [added, setAdded] = useState<Delegation[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="px-[50px] py-10">
      <AsyncContent state={delegations}>
        {(data) => {
          const items = [...data.items, ...added].filter((d) => !removed.includes(d.id))

          if (items.length === 0) {
            return (
              <Card className="flex min-h-[370px] flex-col items-center justify-center px-6 text-center">
                <p className="text-[15px]">No delegations added currently.</p>
                <p className="mt-3 max-w-[520px] text-[13px] text-muted">
                  Delegation lets you reassign approvals from one employee to another for a specific time frame.
                </p>
                <Button className="mt-4" onClick={() => setFormOpen(true)}>
                  Add Delegation
                </Button>
              </Card>
            )
          }

          return (
            <Card>
              <header className="flex items-center justify-between border-b border-divider px-5 py-3">
                <h2 className="text-[15px] font-bold">Delegations</h2>
                <Button onClick={() => setFormOpen(true)}>Add Delegation</Button>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-divider text-muted">
                      <th className="px-5 py-2.5 font-normal">Delegate</th>
                      <th className="px-3 py-2.5 font-normal">From</th>
                      <th className="px-3 py-2.5 font-normal">To</th>
                      <th className="px-3 py-2.5 font-normal">Reason</th>
                      <th className="px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((d) => (
                      <tr key={d.id} className="border-b border-divider last:border-0">
                        <td className="px-5 py-3">
                          <EmployeeSummary employee={{ ...d.delegate, status: null, status_label: null }} />
                        </td>
                        <td className="px-3 py-3">{formatDate(parseDateKey(d.from_date))}</td>
                        <td className="px-3 py-3">{formatDate(parseDateKey(d.to_date))}</td>
                        <td className="px-3 py-3">{d.reason ?? '-'}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            aria-label="Remove delegation"
                            onClick={() => setRemoved((r) => [...r, d.id])}
                            className="text-muted hover:text-danger"
                          >
                            <Trash2 className="size-4" strokeWidth={1.5} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        }}
      </AsyncContent>

      {formOpen && (
        <DelegationForm
          onClose={() => setFormOpen(false)}
          onSave={(delegation) => {
            setAdded((prev) => [...prev, delegation])
            setFormOpen(false)
          }}
        />
      )}
    </div>
  )
}
