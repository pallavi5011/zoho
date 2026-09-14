import { Ellipsis, Search, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AppLogo } from '@/components/AppLogo'
import { cn } from '@/lib/cn'
import { moreServices, reportsModule, sidebarModules, type ModuleItem } from '@/navigation'
import { useSidebarStore } from '@/store/sidebar'

const tileClass = (active: boolean) =>
  cn('flex size-10 items-center justify-center rounded-lg transition-colors', active ? 'bg-brand' : 'bg-sidebar-tile group-hover:bg-sidebar-tile-hover')

const labelClass = (active: boolean) => cn('max-w-[64px] truncate text-[10px] leading-3', active ? 'text-white' : 'text-[#dcdcdc]')

function SidebarItem({ to, label, icon: Icon }: ModuleItem) {
  return (
    <NavLink to={to} title={label} className="group flex flex-col items-center gap-1.5">
      {({ isActive }) => (
        <>
          <span className={tileClass(isActive)}>
            <Icon className="size-[18px] text-white" strokeWidth={1.75} />
          </span>
          <span className={labelClass(isActive)}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

/** "More" tile that opens Zoho's full-height More Services panel beside the sidebar. */
function MoreMenu({ services }: { services: ModuleItem[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const visible = services.filter((s) => s.label.toLowerCase().includes(query.trim().toLowerCase()))

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v)
          setQuery('')
        }}
        className="group flex w-full flex-col items-center gap-1.5"
      >
        <span className={tileClass(open)}>
          <Ellipsis className="size-[18px] text-white" strokeWidth={1.75} />
        </span>
        <span className={labelClass(open)}>More</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="More Services"
          className="fixed bottom-0 left-[68px] top-12 z-50 flex w-[420px] max-w-[calc(100vw-68px)] flex-col bg-white text-ink shadow-[4px_0_16px_rgba(15,34,58,0.12)]"
        >
          <div className="p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Services"
                aria-label="Search Services"
                className="h-9 w-full rounded border border-line bg-white pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-brand"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 pb-2 pt-1 text-[13px]">
            <h2 className="font-bold">More Services</h2>
            <button type="button" className="flex items-center gap-1 text-brand hover:underline">
              <Settings className="size-3.5" strokeWidth={1.75} />
              Preferences
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 pb-3">
            {visible.length === 0 && <p className="px-2 py-3 text-[13px] text-muted">No services found</p>}
            {visible.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex h-10 items-center gap-3 rounded px-2 text-[13px] transition-colors hover:bg-page"
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={1.5} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const { pathname } = useLocation()
  const { slot, setSlot } = useSidebarStore()

  // Like Zoho: the More service you open takes the sidebar slot, the one it replaces moves into More.
  const current = moreServices.find((s) => pathname.startsWith(s.to))
  useEffect(() => {
    if (current && current.to !== slot) setSlot(current.to)
  }, [current, slot, setSlot])

  const slotService = current ?? moreServices.find((s) => s.to === slot) ?? moreServices[0]
  const inMore = moreServices.filter((s) => s.to !== slotService.to)

  return (
    <aside className="flex w-[68px] shrink-0 flex-col bg-sidebar pb-3">
      <Link to="/home" aria-label="Zoho People home" className="flex h-14 shrink-0 items-center justify-center">
        <AppLogo className="size-7" />
      </Link>
      <nav className="flex flex-col gap-[14px]">
        {sidebarModules.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
        <SidebarItem {...slotService} />
        <MoreMenu services={inMore} />
      </nav>
      <div className="mt-auto pt-3">
        <SidebarItem {...reportsModule} />
      </div>
    </aside>
  )
}
