import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import type { TabItem } from '@/navigation'

export const ACTIVE_UNDERLINE =
  'after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t-sm after:bg-brand'

interface TabNavProps {
  tabs: TabItem[]
  tone?: 'light' | 'dark'
  className?: string
}

/** Route-driven tabs with Zoho's blue underline on the active one. */
export function TabNav({ tabs, tone = 'light', className }: TabNavProps) {
  return (
    <nav className={cn('flex h-full items-stretch', className)}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            cn(
              'relative flex shrink-0 items-center whitespace-nowrap px-2 text-sm',
              tone === 'dark' ? 'text-white' : 'text-ink hover:text-brand',
              isActive && ACTIVE_UNDERLINE,
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

interface SegmentTabsProps<K extends string> {
  tabs: { key: K; label: string }[]
  value: K
  onChange: (key: K) => void
  className?: string
}

/** Same look as TabNav, driven by local state instead of the URL. */
export function SegmentTabs<K extends string>({ tabs, value, onChange, className }: SegmentTabsProps<K>) {
  return (
    <div role="tablist" className={cn('flex h-full items-stretch gap-3', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === value}
          onClick={() => onChange(tab.key)}
          className={cn('relative shrink-0 whitespace-nowrap px-2 text-sm', tab.key === value ? ACTIVE_UNDERLINE : 'hover:text-brand')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
