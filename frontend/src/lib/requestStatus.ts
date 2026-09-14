import { Ban, CircleCheck, CircleX, Clock, type LucideIcon } from 'lucide-react'
import type { RequestStatus } from '@/types'

export const REQUEST_STATUS: Record<RequestStatus, { label: string; icon: LucideIcon; className: string }> = {
  approved: { label: 'Approved', icon: CircleCheck, className: 'fill-success text-white' },
  pending: { label: 'Pending', icon: Clock, className: 'text-weekend' },
  rejected: { label: 'Rejected', icon: CircleX, className: 'text-danger' },
  cancelled: { label: 'Cancelled', icon: Ban, className: 'text-muted' },
}

/** Requests that still count (balances, calendars). */
export const isActiveRequest = (status: RequestStatus) => status === 'approved' || status === 'pending'

export const REQUEST_STATUS_FILTERS: { value: RequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]
