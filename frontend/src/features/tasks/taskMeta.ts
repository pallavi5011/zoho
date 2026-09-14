import { toDateKey } from '@/lib/date'
import type { Task, TaskPriority, TaskStatus } from '@/types'

export const PRIORITY: Record<TaskPriority, { label: string; rank: number; className: string }> = {
  high: { label: 'High', rank: 3, className: 'bg-danger/10 text-danger' },
  moderate: { label: 'Moderate', rank: 2, className: 'bg-weekend/15 text-[#b7791f]' },
  low: { label: 'Low', rank: 1, className: 'bg-success/10 text-success' },
}

export const TASK_STATUS: Record<TaskStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'text-brand' },
  in_progress: { label: 'In Progress', className: 'text-weekend' },
  completed: { label: 'Completed', className: 'text-success' },
}

export const isOverdue = (task: Task) => task.status !== 'completed' && Boolean(task.due_date) && task.due_date! < toDateKey(new Date())
