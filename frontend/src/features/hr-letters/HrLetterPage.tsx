import { PackageOpen } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { cancelAction, RecordsView, requestStatusColumn, type RecordColumn } from '@/components/RecordsView'
import { HrLetterFormModal } from '@/features/hr-letters/HrLetterFormModal'
import { formatDate, parseDateKey } from '@/lib/date'
import { useHrLetterRequests, useHrLetterStore } from '@/store/requests'
import type { HrLetterRequest, HrLetterType, HrLetterTypeConfig, ListResponse } from '@/types'

/** Table columns for a letter type; address fields only for Address Proof. */
function columnsFor(config: HrLetterTypeConfig): RecordColumn<HrLetterRequest>[] {
  const address = config.asks_address_change
  return [
    {
      label: 'EmployeeID',
      sortValue: (r) => r.employee.employee_id,
      render: (r) => (
        <>
          {r.employee.employee_id} - <strong className="font-bold">{r.employee.full_name}</strong>
        </>
      ),
    },
    { label: 'Date of request', sortValue: (r) => r.date_of_request, render: (r) => formatDate(parseDateKey(r.date_of_request)) },
    ...(address
      ? [{ label: 'Is there any change in Present address', render: (r: HrLetterRequest) => (r.address_changed === null ? '-' : r.address_changed ? 'Yes' : 'No') }]
      : []),
    { label: 'Reason for request', sortValue: (r) => r.reason, render: (r) => r.reason || '-' },
    { label: 'Enter the Reason for request (If others is chosen)', render: (r) => r.other_reason ?? '-' },
    ...(address ? [{ label: 'New Present Address', render: (r: HrLetterRequest) => r.new_present_address ?? '-' }] : []),
    requestStatusColumn<HrLetterRequest>(),
  ]
}

/** One HR letter tab (Address Proof, Bonafide Letter, Experience Letter). */
export function HrLetterPage({ type }: { type: HrLetterType }) {
  const types = useApi<ListResponse<HrLetterTypeConfig>>('/hr-letters/types')
  const requests = useHrLetterRequests()
  const cancel = useHrLetterStore((s) => s.cancel)
  const [formOpen, setFormOpen] = useState(false)

  const config = types.data?.items.find((c) => c.key === type)
  if (!config) {
    return (
      <div className="px-5 py-3">
        {types.data ? (
          <Card>
            <EmptyState icon={PackageOpen} message="This letter type is not available" />
          </Card>
        ) : (
          <AsyncContent state={types}>{() => null}</AsyncContent>
        )}
      </div>
    )
  }

  return (
    <>
      <RecordsView
        viewName={`${config.name} View`}
        state={requests}
        columns={columnsFor(config)}
        include={(r) => r.letter_type === type}
        searchText={(r) => `${r.reason} ${r.other_reason ?? ''}`}
        onAdd={() => setFormOpen(true)}
        rowAction={cancelAction(cancel)}
      />
      {formOpen && <HrLetterFormModal config={config} onClose={() => setFormOpen(false)} />}
    </>
  )
}
