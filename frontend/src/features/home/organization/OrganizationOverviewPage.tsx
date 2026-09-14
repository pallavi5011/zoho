import {
  CalendarCheck,
  ClipboardCheck,
  DoorOpen,
  Folder,
  LayoutGrid,
  MapPin,
  Plane,
  Star,
  Umbrella,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '@/api/useApi'
import { AppLogo } from '@/components/AppLogo'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { CoverBanner } from '@/components/CoverBanner'
import { SegmentTabs } from '@/components/TabNav'
import type { OrganizationOverview } from '@/types'

const SERVICES: Record<string, { icon: LucideIcon; color: string; to: string }> = {
  time_off: { icon: Umbrella, color: '#3a9fd6', to: '/time-off' },
  attendance: { icon: CalendarCheck, color: '#f08a3c', to: '/attendance' },
  files: { icon: Folder, color: '#3a9fd6', to: '/files' },
  hr_letters: { icon: Star, color: '#f08a3c', to: '/hr-letters' },
  travel: { icon: Plane, color: '#3a9fd6', to: '/travel' },
  tasks: { icon: ClipboardCheck, color: '#f08a3c', to: '/tasks' },
  exit_management: { icon: DoorOpen, color: '#e0565b', to: '/exit-management' },
}

const TABS = [
  { key: 'services', label: 'Services' },
  { key: 'location', label: 'Location' },
] as const

export function OrganizationOverviewPage() {
  const overview = useApi<OrganizationOverview>('/organization/overview')
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('services')

  return (
    <div className="pb-6">
      <CoverBanner />

      <div className="relative -mt-8 flex gap-2 px-[50px]">
        <AsyncContent state={overview} className="flex-1">
          {(data) => (
            <>
              <aside className="flex w-[280px] shrink-0 flex-col gap-2.5">
                <Card className="flex flex-col items-center px-5 pb-5 text-center text-[13px]">
                  <span className="-mt-16 flex size-[98px] items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
                    {data.organization.logo_url ? (
                      <img src={data.organization.logo_url} alt="" className="size-full object-contain" />
                    ) : (
                      <AppLogo className="size-16" />
                    )}
                  </span>
                  <p className="mt-3 font-bold">{data.organization.name}</p>
                  <p className="text-muted">{data.organization.country}</p>
                </Card>
                <Card className="p-4 text-[13px]">
                  <h3 className="text-[15px] font-bold">Quick Links</h3>
                  {data.quick_links.length === 0 ? (
                    <p className="py-4 text-center">No quick links</p>
                  ) : (
                    data.quick_links.map((link) => (
                      <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="mt-2 block text-brand hover:underline">
                        {link.title}
                      </a>
                    ))
                  )}
                </Card>
              </aside>

              <section className="flex min-w-0 flex-1 flex-col gap-2.5">
                <div className="h-[58px] rounded-lg bg-white px-3 shadow-[0_2px_6px_rgba(15,34,58,0.08)]">
                  <SegmentTabs tabs={[...TABS]} value={tab} onChange={setTab} />
                </div>

                <div className="grid gap-2.5 md:grid-cols-2">
                  {tab === 'services'
                    ? data.services.map((service) => {
                        const meta = SERVICES[service.key] ?? { icon: LayoutGrid, color: '#3a9fd6', to: '/home' }
                        const Icon = meta.icon
                        return (
                          <Link
                            key={service.key}
                            to={meta.to}
                            className="flex h-[58px] items-center gap-3 rounded-lg border border-line bg-white px-3 text-[13px] font-bold transition-colors hover:border-brand"
                          >
                            <span
                              style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                              className="flex size-7 items-center justify-center rounded-md"
                            >
                              <Icon className="size-4" strokeWidth={1.5} />
                            </span>
                            {service.label}
                          </Link>
                        )
                      })
                    : data.locations.map((location) => (
                        <Card key={location.id} className="flex items-center gap-3 p-4 text-[13px]">
                          <MapPin className="size-5 text-info" strokeWidth={1.5} />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold">{location.name}</p>
                            <p className="truncate text-muted">{location.address}</p>
                          </div>
                          <span className="text-muted">{location.employee_count} employees</span>
                        </Card>
                      ))}
                </div>
              </section>
            </>
          )}
        </AsyncContent>
      </div>
    </div>
  )
}
