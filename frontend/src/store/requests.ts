import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { useApi, type ApiState } from '@/api/useApi'
import type {
  ExitInterview,
  HrLetterRequest,
  LeaveRequest,
  ListResponse,
  Regularization,
  RequestStatus,
  ResignationRequest,
  TravelExpense,
  TravelRequest,
} from '@/types'

interface LocalRequest {
  id: string
  status: RequestStatus
}

interface LocalRequestsState<T> {
  /** Items created in this session, newest first. */
  added: T[]
  cancelledIds: string[]
  add: (item: T) => void
  cancel: (id: string) => void
}

type LocalRequestsStore<T> = UseBoundStore<StoreApi<LocalRequestsState<T>>>

// TODO: replace with POST / cancel endpoints once the backend exists.
const createLocalRequests = <T extends LocalRequest>() =>
  create<LocalRequestsState<T>>()((set) => ({
    added: [],
    cancelledIds: [],
    add: (item) => set((s) => ({ added: [item, ...s.added] })),
    cancel: (id) => set((s) => ({ cancelledIds: [...s.cancelledIds, id] })),
  }))

export const useLeaveStore = createLocalRequests<LeaveRequest>()
export const useRegularizationStore = createLocalRequests<Regularization>()
export const useHrLetterStore = createLocalRequests<HrLetterRequest>()
export const useTravelRequestStore = createLocalRequests<TravelRequest>()
export const useTravelExpenseStore = createLocalRequests<TravelExpense>()
export const useResignationStore = createLocalRequests<ResignationRequest>()
export const useExitInterviewStore = createLocalRequests<ExitInterview>()

/** GET `path` merged with items added or cancelled locally. */
export function useMergedRequests<T extends LocalRequest>(path: string, useStore: LocalRequestsStore<T>): ApiState<ListResponse<T>> {
  const state = useApi<ListResponse<T>>(path)
  const added = useStore((s) => s.added)
  const cancelledIds = useStore((s) => s.cancelledIds)

  if (!state.data) return state
  const items = [...added, ...state.data.items].map((item) => (cancelledIds.includes(item.id) ? { ...item, status: 'cancelled' as const } : item))
  return { ...state, data: { items, total: items.length } }
}

export const useLeaveRequests = () => useMergedRequests('/leave/requests', useLeaveStore)
export const useRegularizations = () => useMergedRequests('/attendance/regularizations', useRegularizationStore)
export const useHrLetterRequests = () => useMergedRequests('/hr-letters/requests', useHrLetterStore)
export const useTravelRequests = () => useMergedRequests('/travel/requests', useTravelRequestStore)
export const useTravelExpenses = () => useMergedRequests('/travel/expenses', useTravelExpenseStore)
export const useResignations = () => useMergedRequests('/exit/resignations', useResignationStore)
export const useExitInterviews = () => useMergedRequests('/exit/interviews', useExitInterviewStore)
