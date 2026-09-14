import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toDateKey } from '@/lib/date'
import { useNow } from '@/lib/useNow'

interface AttendanceState {
  /** Day the worked time belongs to (yyyy-mm-dd). */
  day: string
  /** Time worked in finished sessions today. */
  workedMs: number
  /** Start of the running session, null when checked out. */
  checkInAt: number | null
  note: string
  setNote: (note: string) => void
  toggleCheckIn: () => void
}

// TODO: replace with the check-in / check-out API once the backend exists.
export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      day: toDateKey(new Date()),
      workedMs: 0,
      checkInAt: null,
      note: '',
      setNote: (note) => set({ note }),
      toggleCheckIn: () => {
        const now = Date.now()
        const today = toDateKey(new Date(now))
        const { day, workedMs, checkInAt } = get()
        const worked = day === today ? workedMs : 0
        set(
          checkInAt === null
            ? { day: today, workedMs: worked, checkInAt: now }
            : { day: today, workedMs: worked + (now - checkInAt), checkInAt: null },
        )
      },
    }),
    { name: 'zp-attendance' },
  ),
)

/** Live check-in state and time worked today (re-renders every second while checked in). */
export function useTodayAttendance() {
  const { day, workedMs, checkInAt, note, setNote, toggleCheckIn } = useAttendanceStore()
  const checkedIn = checkInAt !== null
  const now = useNow(checkedIn)
  const finished = day === toDateKey(new Date()) || checkedIn ? workedMs : 0

  return {
    checkedIn,
    workedMs: finished + (checkedIn ? Math.max(0, now - checkInAt) : 0),
    note,
    setNote,
    toggleCheckIn,
  }
}
