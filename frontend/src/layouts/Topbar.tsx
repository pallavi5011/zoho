import { Bell, Plus, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useApi } from '@/api/useApi'
import { InitialAvatar } from '@/components/InitialAvatar'
import { TabNav } from '@/components/TabNav'
import { moduleTabs, moreServices, reportsModule, sidebarModules } from '@/navigation'
import type { CurrentUser } from '@/types'

export function Topbar() {
  const { pathname } = useLocation()
  const { data: me } = useApi<CurrentUser>('/me')
  const module = [...sidebarModules, ...moreServices, reportsModule].find((m) => pathname.startsWith(m.to))
  const tabs = module && moduleTabs[module.to]
  const notifications = me?.notification_count ?? 0

  return (
    <header className="flex h-12 shrink-0 items-center bg-nav px-5 text-white">
      {tabs ? <TabNav tabs={tabs} tone="dark" className="gap-4" /> : <h1 className="px-2 text-[15px]">{module?.label}</h1>}

      <div className="ml-auto flex items-center gap-5">
        <button
          type="button"
          aria-label="Quick actions"
          className="flex size-8 items-center justify-center rounded bg-brand transition-colors hover:bg-brand-dark"
        >
          <Plus className="size-5" strokeWidth={1.75} />
        </button>
        <button type="button" aria-label="Search employee" className="opacity-90 hover:opacity-100">
          <Search className="size-5" strokeWidth={1.75} />
        </button>
        <button type="button" aria-label="Notifications" className="relative opacity-90 hover:opacity-100">
          <Bell className="size-5" strokeWidth={1.75} />
          {notifications > 0 && (
            <span className="absolute -right-3 -top-2 min-w-5 rounded-full bg-[#e5534b] px-1 text-center text-[10px] font-bold leading-4">
              {notifications > 99 ? '99+' : notifications}
            </span>
          )}
        </button>
        {me && <InitialAvatar name={me.full_name} color={me.avatar_color} className="size-8 rounded-full text-base" />}
      </div>
    </header>
  )
}
