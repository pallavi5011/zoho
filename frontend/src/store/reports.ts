import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReportFavouritesState {
  /** Report key → starred, for reports toggled on this device. */
  overrides: Record<string, boolean>
  toggle: (key: string, current: boolean) => void
}

// TODO: PATCH /reports/{key}/favourite once the backend exists.
export const useReportFavourites = create<ReportFavouritesState>()(
  persist(
    (set) => ({
      overrides: {},
      toggle: (key, current) => set((s) => ({ overrides: { ...s.overrides, [key]: !current } })),
    }),
    { name: 'zp-report-favourites' },
  ),
)
