import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { inputClass } from '@/components/Field'
import { EmployeeField, FormRow, FormSpacer, RecordFormModal, toEmployeeRef, type SaveMode } from '@/components/RecordForm'
import { auditColumns, cancelAction, RecordsView, requestStatusColumn, type RecordColumn } from '@/components/RecordsView'
import { useTravelExpenses, useTravelExpenseStore, useTravelRequests } from '@/store/requests'
import type { CurrentUser, TravelExpense } from '@/types'

const COLUMNS: RecordColumn<TravelExpense>[] = [
  {
    label: 'Employee ID',
    sortValue: (r) => r.employee.employee_id,
    render: (r) => (
      <>
        {r.employee.employee_id} - <strong className="font-bold">{r.employee.full_name}</strong>
      </>
    ),
  },
  { label: 'Travel ID', sortValue: (r) => r.travel_id ?? '', render: (r) => r.travel_id ?? '-' },
  ...auditColumns<TravelExpense>(),
  requestStatusColumn<TravelExpense>(),
]

// TODO: POST /travel/expenses once the backend exists; expenses are kept locally for now.
function TravelExpenseFormModal({ onClose }: { onClose: () => void }) {
  const me = useApi<CurrentUser>('/me')
  const requests = useTravelRequests()
  const add = useTravelExpenseStore((s) => s.add)
  const [travelId, setTravelId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const user = me.data

  // Only this employee's submitted, still-valid trips can have expenses.
  const trips = (requests.data?.items ?? []).filter(
    (r) => r.employee.id === user?.id && !r.is_draft && r.status !== 'cancelled' && r.status !== 'rejected',
  )
  const trip = trips.find((t) => t.travel_id === travelId)

  function save(mode: SaveMode) {
    if (!user) return
    if (mode !== 'draft' && !trip) return setError('Please select a Travel ID.')

    const now = new Date().toISOString()
    add({
      id: `local-${Date.now()}`,
      employee: toEmployeeRef(user),
      travel_id: travelId || null,
      place_of_visit: trip?.place_of_visit ?? null,
      purpose: trip?.purpose ?? null,
      status: 'pending',
      is_draft: mode === 'draft',
      added_by: user.full_name,
      added_time: now,
      modified_by: user.full_name,
      modified_time: now,
    })

    if (mode === 'new') {
      setTravelId('')
      setError(null)
    } else {
      onClose()
    }
  }

  return (
    <RecordFormModal title="Add Travel Expense" section="Expense Details" error={error} onSave={save} onClose={onClose}>
      <EmployeeField user={user} label="Employee ID" nameFirst />
      <FormRow label="Travel ID" required>
        <select value={travelId} onChange={(e) => setTravelId(e.target.value)} className={inputClass}>
          <option value="">{trips.length ? 'Select' : 'No travel requests yet'}</option>
          {trips.map((t) => (
            <option key={t.id} value={t.travel_id}>
              {t.travel_id}
              {t.place_of_visit ? ` - ${t.place_of_visit}` : ''}
            </option>
          ))}
        </select>
      </FormRow>

      <FormSpacer />
      <FormRow label="Place of visit" muted>
        {trip?.place_of_visit ?? '-'}
      </FormRow>

      <FormSpacer />
      <FormRow label="Purpose of visit" muted>
        {trip?.purpose ?? '-'}
      </FormRow>
    </RecordFormModal>
  )
}

export function TravelExpensesPage() {
  const expenses = useTravelExpenses()
  const cancel = useTravelExpenseStore((s) => s.cancel)
  const [formOpen, setFormOpen] = useState(false)

  return (
    <>
      <RecordsView
        viewName="Travel Expense View"
        state={expenses}
        columns={COLUMNS}
        searchText={(r) => `${r.travel_id ?? ''} ${r.place_of_visit ?? ''} ${r.purpose ?? ''}`}
        onAdd={() => setFormOpen(true)}
        rowAction={cancelAction(cancel)}
      />
      {formOpen && <TravelExpenseFormModal onClose={() => setFormOpen(false)} />}
    </>
  )
}
