import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { inputClass, textareaClass } from '@/components/Field'
import { FormRow, RecordFormModal, toEmployeeRef, type SaveMode } from '@/components/RecordForm'
import { PRIORITY, TASK_STATUS } from '@/features/tasks/taskMeta'
import { toDateKey } from '@/lib/date'
import { useTaskStore } from '@/store/tasks'
import type { CurrentUser, EmployeeRecord, ListResponse, TaskPriority, TaskStatus } from '@/types'

const ME = 'me'
const UNASSIGNED = 'unassigned'

const emptyForm = () => ({
  owner: ME,
  name: '',
  description: '',
  start: toDateKey(new Date()),
  due: toDateKey(new Date()),
  reminder: '',
  priority: 'moderate' as TaskPriority,
  status: 'open' as TaskStatus,
})

export function TaskFormModal({ onClose }: { onClose: () => void }) {
  const me = useApi<CurrentUser>('/me')
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const addTask = useTaskStore((s) => s.addTask)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const user = me.data

  const update = <K extends keyof ReturnType<typeof emptyForm>>(key: K, value: ReturnType<typeof emptyForm>[K]) => setForm((f) => ({ ...f, [key]: value }))
  const others = (employees.data?.items ?? []).filter((e) => e.id !== user?.id)

  function save(mode: SaveMode) {
    if (!user) return
    if (!form.name.trim()) return setError('Please enter the task name.')
    if (form.start && form.due && form.due < form.start) return setError('Due Date cannot be before Start Date.')

    const owner = form.owner === ME ? toEmployeeRef(user) : form.owner === UNASSIGNED ? null : others.find((e) => e.id === form.owner)
    const now = new Date().toISOString()
    addTask({
      id: `local-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim() || null,
      owner: owner ? toEmployeeRef(owner) : null,
      assigned_by: toEmployeeRef(user),
      start_date: form.start || null,
      due_date: form.due || null,
      reminder_at: form.reminder ? new Date(form.reminder).toISOString() : null,
      priority: form.priority,
      status: form.status,
      added_by: user.full_name,
      added_time: now,
      modified_by: user.full_name,
      modified_time: now,
    })

    if (mode === 'new') {
      setForm(emptyForm())
      setError(null)
    } else {
      onClose()
    }
  }

  return (
    <RecordFormModal title="Add Task" section="Task Details" error={error} onSave={save} onClose={onClose} columns={1} allowDraft={false}>
      <FormRow label="Task owner">
        <select value={form.owner} onChange={(e) => update('owner', e.target.value)} className={inputClass}>
          <option value={ME}>{user ? `${user.full_name} ${user.employee_id}` : 'Me'}</option>
          {others.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name} {e.employee_id}
            </option>
          ))}
          <option value={UNASSIGNED}>Unassigned</option>
        </select>
      </FormRow>
      <FormRow label="Task name" required>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
      </FormRow>
      <FormRow label="Description">
        <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} className={textareaClass} />
      </FormRow>
      <FormRow label="Start Date">
        <input type="date" value={form.start} onChange={(e) => update('start', e.target.value)} className={inputClass} />
      </FormRow>
      <FormRow label="Due Date">
        <input type="date" value={form.due} min={form.start || undefined} onChange={(e) => update('due', e.target.value)} className={inputClass} />
      </FormRow>
      <FormRow label="Reminder">
        <input type="datetime-local" value={form.reminder} onChange={(e) => update('reminder', e.target.value)} className={inputClass} />
      </FormRow>
      <FormRow label="Priority">
        <select value={form.priority} onChange={(e) => update('priority', e.target.value as TaskPriority)} className={inputClass}>
          {(Object.keys(PRIORITY) as TaskPriority[]).map((key) => (
            <option key={key} value={key}>
              {PRIORITY[key].label}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label="Status" required>
        <select value={form.status} onChange={(e) => update('status', e.target.value as TaskStatus)} className={inputClass}>
          {(Object.keys(TASK_STATUS) as TaskStatus[]).map((key) => (
            <option key={key} value={key}>
              {TASK_STATUS[key].label}
            </option>
          ))}
        </select>
      </FormRow>
    </RecordFormModal>
  )
}
