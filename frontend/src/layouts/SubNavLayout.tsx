import { Outlet } from 'react-router-dom'
import { TabNav } from '@/components/TabNav'
import type { TabItem } from '@/navigation'

/** White second-level tab bar (Overview / Dashboard / …) above the page. */
export function SubNavLayout({ tabs }: { tabs: TabItem[] }) {
  return (
    <>
      <div className="sticky top-0 z-10 h-10 bg-white px-5">
        <TabNav tabs={tabs} className="gap-4 overflow-x-auto" />
      </div>
      <Outlet />
    </>
  )
}
