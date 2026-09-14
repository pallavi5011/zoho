import { useState } from 'react'
import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { EmployeeSummary } from '@/features/home/components/EmployeeSummary'
import type { EmployeeRef } from '@/types'

const PREVIEW_COUNT = 3

export function DepartmentMembersCard({ members }: { members: EmployeeRef[] }) {
  const [expanded, setExpanded] = useState(false)
  const hiddenCount = members.length - PREVIEW_COUNT
  const visible = expanded ? members : members.slice(0, PREVIEW_COUNT)

  return (
    <Card className="px-5 pb-4 pt-5">
      <h2 className="text-[17px] font-bold">Department Members</h2>
      {members.length === 0 && <p className="mt-3 text-muted">No department members.</p>}
      <ul className="mt-2">
        {visible.map((member) => (
          <li key={member.id} className="flex gap-3 border-b border-divider py-3">
            <EmployeePhoto employee={member} size={38} radius={7} />
            <EmployeeSummary employee={member} />
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-3 text-brand hover:underline">
          {expanded ? 'Show less' : `+${hiddenCount} More`}
        </button>
      )}
    </Card>
  )
}
