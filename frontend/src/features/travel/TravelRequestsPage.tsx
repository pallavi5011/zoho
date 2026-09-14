import { useState } from 'react'
import { auditColumns, cancelAction, RecordsView, requestStatusColumn, type RecordColumn } from '@/components/RecordsView'
import { TravelRequestFormModal } from '@/features/travel/TravelRequestFormModal'
import { formatDate, parseDateKey } from '@/lib/date'
import { useTravelRequests, useTravelRequestStore } from '@/store/requests'
import type { TravelRequest } from '@/types'

const dateCell = (key: string | null) => (key ? formatDate(parseDateKey(key)) : '-')

const COLUMNS: RecordColumn<TravelRequest>[] = [
  {
    label: 'Employee ID',
    sortValue: (r) => r.employee.employee_id,
    render: (r) => (
      <>
        {r.employee.employee_id} - <strong className="font-bold">{r.employee.full_name}</strong>
      </>
    ),
  },
  { label: 'Travel ID', sortValue: (r) => r.travel_id, render: (r) => r.travel_id },
  { label: 'Employee Department', sortValue: (r) => r.department ?? '', render: (r) => r.department ?? '-' },
  { label: 'Place of visit', sortValue: (r) => r.place_of_visit ?? '', render: (r) => r.place_of_visit ?? '-' },
  { label: 'Expected date of departure', sortValue: (r) => r.departure_date ?? '', render: (r) => dateCell(r.departure_date) },
  { label: 'Expected date of arrival', sortValue: (r) => r.arrival_date ?? '', render: (r) => dateCell(r.arrival_date) },
  { label: 'Purpose of visit', sortValue: (r) => r.purpose ?? '', render: (r) => r.purpose ?? '-' },
  {
    label: 'Expected duration in days',
    sortValue: (r) => String(r.duration_days ?? 0).padStart(4, '0'),
    render: (r) => r.duration_days ?? '-',
  },
  { label: 'Is billable to customer', render: (r) => (r.is_billable === null ? '-' : r.is_billable ? 'Yes' : 'No') },
  { label: 'Customer name', sortValue: (r) => r.customer_name ?? '', render: (r) => r.customer_name ?? '-' },
  ...auditColumns<TravelRequest>(),
  requestStatusColumn<TravelRequest>(),
]

export function TravelRequestsPage() {
  const requests = useTravelRequests()
  const cancel = useTravelRequestStore((s) => s.cancel)
  const [formOpen, setFormOpen] = useState(false)

  return (
    <>
      <RecordsView
        viewName="Travel Request View"
        state={requests}
        columns={COLUMNS}
        searchText={(r) => `${r.travel_id} ${r.place_of_visit ?? ''} ${r.purpose ?? ''} ${r.customer_name ?? ''}`}
        onAdd={() => setFormOpen(true)}
        rowAction={cancelAction(cancel)}
      />
      {formOpen && <TravelRequestFormModal onClose={() => setFormOpen(false)} />}
    </>
  )
}
