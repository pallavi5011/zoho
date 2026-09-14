import { SlidersHorizontal } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { CoverBanner } from '@/components/CoverBanner'
import { TabNav } from '@/components/TabNav'
import { DepartmentMembersCard } from '@/features/home/components/DepartmentMembersCard'
import { ProfileCard } from '@/features/home/components/ProfileCard'
import { ReportingManagerCard } from '@/features/home/components/ReportingManagerCard'
import { overviewTabs } from '@/navigation'
import type { MySpaceOverview } from '@/types'

/** My Space → Overview: cover, left profile column, and the Activities/Feeds/… tabs. */
export function HomePage() {
  const overview = useApi<MySpaceOverview>('/myspace/overview')
  const { pathname } = useLocation()
  const compact = /\/(profile|files)$/.test(pathname)

  return (
    <div className="pb-6">
      <CoverBanner />

      <div className="relative -mt-8 flex gap-2 px-[50px]">
        <aside className="flex w-[280px] shrink-0 flex-col gap-2.5">
          <AsyncContent state={overview}>
            {(data) => (
              <>
                <ProfileCard profile={data.profile} compact={compact} />
                {data.reporting_manager && <ReportingManagerCard manager={data.reporting_manager} />}
                <DepartmentMembersCard members={data.department_members} />
              </>
            )}
          </AsyncContent>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex h-[58px] items-stretch rounded-lg bg-white pl-5 pr-4 shadow-[0_2px_6px_rgba(15,34,58,0.08)]">
            <TabNav tabs={overviewTabs} className="min-w-0 gap-3 overflow-x-auto" />
            <button type="button" aria-label="Customize tabs" className="ml-auto self-center pl-3 text-[#555] hover:text-brand">
              <SlidersHorizontal className="size-5" strokeWidth={1.5} />
            </button>
          </div>
          <Outlet context={overview.data} />
        </section>
      </div>
    </div>
  )
}
