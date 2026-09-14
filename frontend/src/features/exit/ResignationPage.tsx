import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { EmployeeDetailRows } from '@/components/EmployeeDetailRows'
import { inputClass, textareaClass } from '@/components/Field'
import { EmployeeField, FormRow, RecordFormModal, toEmployeeRef, type SaveMode } from '@/components/RecordForm'
import { auditColumns, cancelAction, formatRecordTime, RecordsView, requestStatusColumn, type RecordColumn } from '@/components/RecordsView'
import { formatDate, parseDateKey, toDateKey } from '@/lib/date'
import { useResignations, useResignationStore } from '@/store/requests'
import type { CurrentUser, ResignationRequest } from '@/types'

const COLUMNS: RecordColumn<ResignationRequest>[] = [
  requestStatusColumn<ResignationRequest>('Approval Status'),
  { label: 'Approver', render: (r) => r.approver ?? '-' },
  { label: 'Approval Time', render: (r) => (r.approval_time ? formatRecordTime(r.approval_time) : '-') },
  ...auditColumns<ResignationRequest>(),
  {
    label: 'Emp Name',
    sortValue: (r) => r.employee.full_name,
    render: (r) => (
      <>
        {r.employee.employee_id} - <strong className="font-bold">{r.employee.full_name}</strong>
      </>
    ),
  },
  {
    label: 'Date of Resignation',
    sortValue: (r) => r.date_of_resignation ?? '',
    render: (r) => (r.date_of_resignation ? formatDate(parseDateKey(r.date_of_resignation)) : '-'),
  },
  { label: 'Elaborate your reason for Resignation', render: (r) => r.reason ?? '-' },
]

// TODO: POST /exit/resignations once the backend exists; requests are kept locally for now.
function ResignationFormModal({ onClose }: { onClose: () => void }) {
  const me = useApi<CurrentUser>('/me')
  const resignations = useResignations()
  const add = useResignationStore((s) => s.add)
  const [date, setDate] = useState(toDateKey(new Date()))
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const user = me.data

  function save(mode: SaveMode) {
    if (!user) return
    if (mode !== 'draft') {
      if (!date || !reason.trim()) return setError('Please fill all required fields.')
      const active = resignations.data?.items.some(
        (r) => r.employee.id === user.id && !r.is_draft && (r.status === 'pending' || r.status === 'approved'),
      )
      if (active) return setError('You already have an active resignation request.')
    }

    const now = new Date().toISOString()
    add({
      id: `local-${Date.now()}`,
      employee: toEmployeeRef(user),
      date_of_resignation: date || null,
      reason: reason.trim() || null,
      status: 'pending',
      approver: null,
      approval_time: null,
      is_draft: mode === 'draft',
      added_by: user.full_name,
      added_time: now,
      modified_by: user.full_name,
      modified_time: now,
    })
    onClose()
  }

  return (
    <RecordFormModal title="Add Resignation Request" section="Resignation Request Details" error={error} onSave={save} onClose={onClose} columns={1} allowNew={false}>
      <EmployeeField user={user} label="Emp Name" />
      <EmployeeDetailRows fields={['joining', 'department', 'designation', 'manager', 'employment_type']} />
      <FormRow label="Date of Resignation" required>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </FormRow>
      <FormRow label="Elaborate your reason for Resignation" required>
        <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className={textareaClass} />
      </FormRow>
    </RecordFormModal>
  )
}

export function ResignationPage() {
  const resignations = useResignations()
  const cancel = useResignationStore((s) => s.cancel)
  const [formOpen, setFormOpen] = useState(false)

  return (
    <>
      <RecordsView
        viewName="Resignation Request View"
        scopeLabel="Reportees + My Data"
        state={resignations}
        columns={COLUMNS}
        searchText={(r) => `${r.employee.full_name} ${r.reason ?? ''}`}
        onAdd={() => setFormOpen(true)}
        rowAction={cancelAction(cancel)}
      />
      {formOpen && <ResignationFormModal onClose={() => setFormOpen(false)} />}
    </>
  )
}
