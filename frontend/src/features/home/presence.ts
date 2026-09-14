import type { AttendanceStatus } from '@/types'

const STATUS_CLASS: Record<AttendanceStatus, string> = {
  weekend: 'text-weekend',
  holiday: 'text-weekend',
  present: 'text-success',
  on_duty: 'text-[#9c5de0]',
  on_leave: 'text-danger',
  absent: 'text-danger',
  yet_to_check_in: 'text-danger',
}

/** Text colour for a status label such as "Weekend". */
export const statusClass = (status: AttendanceStatus | null) => (status ? STATUS_CLASS[status] : 'text-muted')
