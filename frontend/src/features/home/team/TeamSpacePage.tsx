import { MessagesSquare, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { CoverBanner } from '@/components/CoverBanner'
import { EmptyState } from '@/components/EmptyState'
import { createLocalPost, FeedCard } from '@/components/FeedCard'
import { PostComposer } from '@/components/PostComposer'
import { SegmentTabs } from '@/components/TabNav'
import type { CurrentUser, FeedItem, TeamSpace } from '@/types'

const TABS = [
  { key: 'wall', label: 'Department Wall' },
  { key: 'groups', label: 'Groups' },
] as const

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-4 text-[13px]">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      {children}
    </Card>
  )
}

function CountRow({ label, count, accent }: { label: string; count: number; accent?: boolean }) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <span className={accent ? 'border-l-2 border-weekend pl-2' : undefined}>{label}</span>
      <span>{count}</span>
    </div>
  )
}

export function TeamSpacePage() {
  const team = useApi<TeamSpace>('/team/space')
  const { data: me } = useApi<CurrentUser>('/me')
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('wall')
  const [posted, setPosted] = useState<FeedItem[]>([])
  const authorName = me?.full_name ?? ''

  return (
    <div className="pb-6">
      <CoverBanner className="bg-[#c9d9f2]" showMenu={false} />

      <div className="relative -mt-8 flex gap-2 px-[50px]">
        <AsyncContent state={team} className="flex-1">
          {(data) => {
            const wall = [...posted, ...data.wall]
            return (
              <>
                <aside className="flex w-[280px] shrink-0 flex-col gap-2.5">
                  <Card className="flex flex-col items-center px-5 pb-4 text-[13px]">
                    <span className="-mt-16 flex size-[98px] items-center justify-center rounded-xl border border-line bg-white text-[40px]">
                      {data.department.name.charAt(0)}
                    </span>
                    <p className="mt-3">{data.department.name}</p>
                    <div className="mt-3 flex w-full justify-between border-t border-divider pt-3">
                      <span>Team strength</span>
                      <span>{data.department.strength}</span>
                    </div>
                  </Card>
                  <Card className="p-4 text-[13px]">
                    <h3 className="text-[15px] font-bold">Team Availability</h3>
                    {data.availability.map((a) => (
                      <CountRow key={a.status} label={a.label} count={a.count} accent />
                    ))}
                  </Card>
                  <Card className="p-4 text-[13px]">
                    <h3 className="text-[15px] font-bold">Location Diversity</h3>
                    {data.location_diversity.map((l) => (
                      <CountRow key={l.location} label={l.location} count={l.count} />
                    ))}
                  </Card>
                </aside>

                <section className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="h-[58px] rounded-lg bg-white px-3 shadow-[0_2px_6px_rgba(15,34,58,0.08)]">
                    <SegmentTabs tabs={[...TABS]} value={tab} onChange={setTab} />
                  </div>

                  {tab === 'wall' ? (
                    <>
                      <PostComposer
                        authorName={authorName}
                        avatarColor={me?.avatar_color ?? '#8b6e62'}
                        placeholder="Post a message to your department"
                        onPost={(message) => setPosted((prev) => [createLocalPost(authorName, message), ...prev])}
                      />
                      {wall.length === 0 ? (
                        <EmptyState icon={MessagesSquare} message="No Feeds Yet" />
                      ) : (
                        wall.map((item) => <FeedCard key={item.id} item={item} authorName={authorName} />)
                      )}
                    </>
                  ) : data.groups.length === 0 ? (
                    <EmptyState icon={Users} message="No groups yet" />
                  ) : (
                    <Card className="divide-y divide-divider">
                      {data.groups.map((g) => (
                        <div key={g.id} className="flex justify-between px-5 py-3 text-[13px]">
                          <span className="font-bold">{g.name}</span>
                          <span className="text-muted">{g.member_count} members</span>
                        </div>
                      ))}
                    </Card>
                  )}
                </section>

                <aside className="flex w-[290px] shrink-0 flex-col gap-2.5">
                  <SideCard title="Work Anniversary">
                    {data.work_anniversaries.length ? data.work_anniversaries.map((e) => <p key={e.id}>{e.full_name}</p>) : <p>No work anniversary celebrations today</p>}
                  </SideCard>
                  <SideCard title="New Hires">
                    {data.new_hires.length ? data.new_hires.map((e) => <p key={e.id}>{e.full_name}</p>) : <p>No new hires in the last 15 days</p>}
                  </SideCard>
                  <SideCard title="Birthday Buddy">
                    {data.birthdays.length ? data.birthdays.map((e) => <p key={e.id}>{e.full_name}</p>) : <p>No birthday celebrations today</p>}
                  </SideCard>
                  <SideCard title="Department Files">
                    {data.department_files.length ? data.department_files.map((f) => <p key={f.id} className="truncate">{f.name}</p>) : <p>No files found</p>}
                  </SideCard>
                </aside>
              </>
            )
          }}
        </AsyncContent>
      </div>
    </div>
  )
}
