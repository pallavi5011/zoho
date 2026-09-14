import { Circle, CircleCheck, ClipboardList, ListFilter } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { EmployeePhoto } from '@/components/EmployeePhoto'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { Modal } from '@/components/Modal'
import { isOverdue, PRIORITY, TASK_STATUS } from '@/features/tasks/taskMeta'
import { TaskFormModal } from '@/features/tasks/TaskFormModal'
import { cn } from '@/lib/cn'
import { formatDate, formatDateTimeLong, parseDateKey } from '@/lib/date'
import { useTasks, useTaskStore } from '@/store/tasks'
import type { CurrentUser, Task, TaskStatus } from '@/types'

type Mode = 'mine' | 'track'
type Filter = 'total' | 'unassigned' | 'open' | 'completed'

const dateCell = (key: string | null) => (key ? formatDate(parseDateKey(key)) : '-')

function TaskDetailsModal({ task, onClose, onStatusChange }: { task: Task; onClose: () => void; onStatusChange: (status: TaskStatus) => void }) {
  const rows: [string, string][] = [
    ['Task owner', task.owner ? `${task.owner.employee_id} - ${task.owner.full_name}` : 'Unassigned'],
    ['Assigned by', `${task.assigned_by.employee_id} - ${task.assigned_by.full_name}`],
    ['Start Date', dateCell(task.start_date)],
    ['Due Date', dateCell(task.due_date)],
    ['Reminder', task.reminder_at ? formatDateTimeLong(task.reminder_at) : '-'],
    ['Priority', PRIORITY[task.priority].label],
  ]

  return (
    <Modal title={task.name} onClose={onClose} className="max-w-lg">
      <div className="space-y-4 px-5 py-4 text-[13px]">
        {task.description && <p className="whitespace-pre-line">{task.description}</p>}
        <dl className="grid grid-cols-[120px_1fr] gap-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          <dt className="self-center text-muted">Status</dt>
          <dd>
            <select
              aria-label="Task status"
              value={task.status}
              onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
              className={cn(toolbarInputClass, 'w-[200px]')}
            >
              {(Object.keys(TASK_STATUS) as TaskStatus[]).map((key) => (
                <option key={key} value={key}>
                  {TASK_STATUS[key].label}
                </option>
              ))}
            </select>
          </dd>
        </dl>
      </div>
    </Modal>
  )
}

/** My Tasks (tasks I own) and Track Tasks (tasks I assigned). */
export function TaskBoardPage({ mode }: { mode: Mode }) {
  const me = useApi<CurrentUser>('/me')
  const tasks = useTasks()
  const updateTask = useTaskStore((s) => s.updateTask)
  const [filter, setFilter] = useState<Filter>('open')
  const [query, setQuery] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="px-5 py-3">
      <AsyncContent state={tasks}>
        {({ items }) => {
          const userId = me.data?.id
          const scoped = items.filter((t) => (mode === 'mine' ? t.owner?.id === userId : t.assigned_by.id === userId))
          const matches: Record<Filter, (t: Task) => boolean> = {
            total: () => true,
            unassigned: (t) => !t.owner,
            open: (t) => t.status !== 'completed',
            completed: (t) => t.status === 'completed',
          }
          const chips: { key: Filter; label: string }[] = [
            { key: 'total', label: 'Total' },
            ...(mode === 'track' ? [{ key: 'unassigned' as const, label: 'Unassigned' }] : []),
            { key: 'open', label: 'Open' },
            { key: 'completed', label: 'Completed' },
          ]
          const q = query?.trim().toLowerCase() ?? ''
          const list = scoped
            .filter((t) => matches[filter](t) && (!q || `${t.name} ${t.description ?? ''}`.toLowerCase().includes(q)))
            .sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'))
          const selected = items.find((t) => t.id === selectedId)

          return (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    aria-pressed={filter === chip.key}
                    onClick={() => setFilter(chip.key)}
                    className={cn(
                      'flex h-8 items-center gap-2.5 rounded border px-3 text-[13px] transition-colors',
                      filter === chip.key ? 'border-brand/50 bg-[#eef5fd]' : 'border-transparent bg-white hover:border-line',
                    )}
                  >
                    {chip.label}
                    <strong className={cn('font-bold', chip.key === 'completed' ? 'text-success' : filter === chip.key && 'text-brand')}>
                      {scoped.filter(matches[chip.key]).length}
                    </strong>
                  </button>
                ))}
                {query !== null && (
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tasks"
                    aria-label="Search tasks"
                    className={cn(toolbarInputClass, 'w-64')}
                  />
                )}
                <div className="ml-auto flex gap-2">
                  <Button onClick={() => setFormOpen(true)}>Add Task</Button>
                  <IconButton label="Filter" active={query !== null} onClick={() => setQuery((v) => (v === null ? '' : null))}>
                    <ListFilter className="size-4" />
                  </IconButton>
                </div>
              </div>

              {list.length === 0 ? (
                <Card>
                  <EmptyState icon={ClipboardList} message="No tasks to list here" />
                </Card>
              ) : (
                <Card>
                  <ul className="divide-y divide-divider">
                    {list.map((task) => {
                      const done = task.status === 'completed'
                      const person = mode === 'mine' ? task.assigned_by : task.owner
                      return (
                        <li key={task.id} className="flex items-center gap-3 px-4 py-3 text-[13px]">
                          <button
                            type="button"
                            aria-label={done ? `Mark ${task.name} as open` : `Mark ${task.name} as completed`}
                            onClick={() => updateTask(task.id, { status: done ? 'open' : 'completed' })}
                            className="shrink-0 text-muted hover:text-success"
                          >
                            {done ? <CircleCheck className="size-5 fill-success text-white" /> : <Circle className="size-5" strokeWidth={1.5} />}
                          </button>
                          <button type="button" onClick={() => setSelectedId(task.id)} className="min-w-0 flex-1 text-left">
                            <p className={cn('truncate font-bold', done && 'text-muted line-through')}>{task.name}</p>
                            {task.description && <p className="truncate text-xs text-muted">{task.description}</p>}
                          </button>
                          <span className={cn('shrink-0 rounded px-2 py-0.5 text-[11px]', PRIORITY[task.priority].className)}>{PRIORITY[task.priority].label}</span>
                          <span className={cn('w-[110px] shrink-0 text-right', isOverdue(task) && 'text-danger')}>{dateCell(task.due_date)}</span>
                          <span className="flex w-[190px] shrink-0 items-center gap-2">
                            {person ? (
                              <>
                                <EmployeePhoto employee={person} size={24} radius={4} />
                                <span className="truncate">{person.full_name}</span>
                              </>
                            ) : (
                              <span className="text-muted">Unassigned</span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              )}

              {selected && (
                <TaskDetailsModal task={selected} onClose={() => setSelectedId(null)} onStatusChange={(status) => updateTask(selected.id, { status })} />
              )}
            </>
          )
        }}
      </AsyncContent>

      {formOpen && <TaskFormModal onClose={() => setFormOpen(false)} />}
    </div>
  )
}
