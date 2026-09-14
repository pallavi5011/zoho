import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  /** Path of the More service currently occupying the sidebar slot. */
  slot: string | null
  setSlot: (path: string) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      slot: null,
      setSlot: (slot) => set({ slot }),
    }),
    { name: 'zp-sidebar' },
  ),
)
