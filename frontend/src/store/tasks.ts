import { create } from 'zustand'
import { useApi, type ApiState } from '@/api/useApi'
import type { Checklist, ListResponse, Task } from '@/types'

interface TasksState {
  /** Tasks created in this session, newest first. */
  added: Task[]
  /** Local edits (e.g. status) keyed by task id. */
  patches: Record<string, Partial<Task>>
  /** Checklist item id → done, for items ticked in this session. */
  checkedItems: Record<string, boolean>
  addTask: (task: Task) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  toggleItem: (itemId: string, done: boolean) => void
}

// TODO: replace with POST/PATCH /tasks and PATCH /checklists/items once the backend exists.
export const useTaskStore = create<TasksState>()((set) => ({
  added: [],
  patches: {},
  checkedItems: {},
  addTask: (task) => set((s) => ({ added: [task, ...s.added] })),
  updateTask: (id, patch) =>
    set((s) => ({ patches: { ...s.patches, [id]: { ...s.patches[id], ...patch, modified_time: new Date().toISOString() } } })),
  toggleItem: (itemId, done) => set((s) => ({ checkedItems: { ...s.checkedItems, [itemId]: done } })),
}))

/** GET /tasks merged with tasks added or edited locally. */
export function useTasks(): ApiState<ListResponse<Task>> {
  const state = useApi<ListResponse<Task>>('/tasks')
  const added = useTaskStore((s) => s.added)
  const patches = useTaskStore((s) => s.patches)

  if (!state.data) return state
  const items = [...added, ...state.data.items].map((task) => (patches[task.id] ? { ...task, ...patches[task.id] } : task))
  return { ...state, data: { items, total: items.length } }
}

/** GET /checklists with locally ticked items applied. */
export function useChecklists(): ApiState<ListResponse<Checklist>> {
  const state = useApi<ListResponse<Checklist>>('/checklists')
  const checked = useTaskStore((s) => s.checkedItems)

  if (!state.data) return state
  const items = state.data.items.map((c) => ({ ...c, items: c.items.map((item) => (item.id in checked ? { ...item, done: checked[item.id] } : item)) }))
  return { ...state, data: { ...state.data, items } }
}
