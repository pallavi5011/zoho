import { Accessibility, Megaphone, Moon } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/layouts/Sidebar'
import { Topbar } from '@/layouts/Topbar'

const railButtons = [
  { label: 'Accessibility', icon: Accessibility },
  { label: 'Switch to night mode', icon: Moon },
  { label: "What's new", icon: Megaphone },
]

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-page text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <aside className="flex w-12 shrink-0 flex-col items-center justify-end gap-4 bg-white pb-3">
            {railButtons.map(({ label, icon: Icon }) => (
              <button key={label} type="button" aria-label={label} title={label} className="text-[#444] hover:text-brand">
                <Icon className="size-5" strokeWidth={1.5} />
              </button>
            ))}
          </aside>
        </div>
      </div>
    </div>
  )
}
