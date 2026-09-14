import { useState } from 'react'
import { auditColumns, RecordsView, type RecordColumn } from '@/components/RecordsView'
import { PRIORITY, TASK_STATUS } from '@/features/tasks/taskMeta'
import { TaskFormModal } from '@/features/tasks/TaskFormModal'
import { cn } from '@/lib/cn'
import { formatDate, parseDateKey } from '@/lib/date'
import { useTasks } from '@/store/tasks'
import type { Task } from '@/types'

const COLUMNS: RecordColumn<Task>[] = [
  { label: 'Task name', sortValue: (t) => t.name, render: (t) => t.name },
  { label: 'Due Date', sortValue: (t) => t.due_date ?? '', render: (t) => (t.due_date ? formatDate(parseDateKey(t.due_date)) : '-') },
  {
    label: 'Priority',
    sortValue: (t) => String(PRIORITY[t.priority].rank),
    render: (t) => <span className={cn('rounded px-2 py-0.5 text-[11px]', PRIORITY[t.priority].className)}>{PRIORITY[t.priority].label}</span>,
  },
  { label: 'Status', sortValue: (t) => t.status, render: (t) => <span className={TASK_STATUS[t.status].className}>{TASK_STATUS[t.status].label}</span> },
  {
    label: 'Task owner',
    sortValue: (t) => t.owner?.full_name ?? '',
    render: (t) => (t.owner ? `${t.owner.employee_id} - ${t.owner.full_name}` : 'Unassigned'),
  },
  ...auditColumns<Task>(),
]

/** Tasks → Form View: every task as a sortable record table. */
export function TaskFormViewPage() {
  const tasks = useTasks()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <>
      <RecordsView
        viewName="Task View"
        scopeLabel="Reportees + My Data"
        addLabel="Add Task"
        state={tasks}
        columns={COLUMNS}
        searchText={(t) => `${t.name} ${t.description ?? ''}`}
        onAdd={() => setFormOpen(true)}
      />
      {formOpen && <TaskFormModal onClose={() => setFormOpen(false)} />}
    </>
  )
}
