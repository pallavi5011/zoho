import { CalendarCheck, FileChartColumn, IdCard, Search, Star, Umbrella, X, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { cn } from '@/lib/cn'
import { useReportFavourites } from '@/store/reports'
import type { ListResponse, ReportDefinition } from '@/types'

const FAVOURITES = 'My Favourites'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  [FAVOURITES]: Star,
  'Employee Information': IdCard,
  'Time Off': Umbrella,
  Attendance: CalendarCheck,
}

/** My Reports / Team Reports: searchable report catalogue grouped by category. */
export function ReportsCatalogPage({ scope }: { scope: ReportDefinition['scope'] }) {
  const reports = useApi<ListResponse<ReportDefinition>>('/reports')
  const { overrides, toggle } = useReportFavourites()
  const [query, setQuery] = useState('')

  return (
    <div className="px-5 py-5">
      <div className="relative mx-auto mb-5 max-w-[620px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Reports"
          aria-label="Search Reports"
          className="h-11 w-full rounded-lg border border-line bg-white px-10 text-sm outline-none transition-colors focus:border-brand"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
            <X className="size-4" />
          </button>
        )}
      </div>

      <AsyncContent state={reports}>
        {({ items }) => {
          const isFavourite = (r: ReportDefinition) => overrides[r.key] ?? r.is_favourite
          const q = query.trim().toLowerCase()
          const visible = items.filter((r) => r.scope === scope && (!q || `${r.name} ${r.category}`.toLowerCase().includes(q)))

          const groups = new Map<string, ReportDefinition[]>()
          const favourites = visible.filter(isFavourite)
          if (favourites.length) groups.set(FAVOURITES, favourites)
          for (const report of visible) groups.set(report.category, [...(groups.get(report.category) ?? []), report])

          return (
            <Card className="min-h-[60vh] px-10 py-9">
              {visible.length === 0 ? (
                <EmptyState icon={FileChartColumn} message="No reports found" />
              ) : (
                <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[...groups].map(([title, group]) => {
                    const Icon = CATEGORY_ICONS[title] ?? FileChartColumn
                    return (
                      <section key={title} className="text-[13px]">
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                          <Icon className="size-4" strokeWidth={1.5} />
                          {title}
                        </h3>
                        <ul>
                          {group.map((report) => {
                            const starred = isFavourite(report)
                            return (
                              <li key={report.key} className="flex items-center gap-3 border-b border-divider py-2.5">
                                <button
                                  type="button"
                                  aria-label={starred ? `Remove ${report.name} from favourites` : `Add ${report.name} to favourites`}
                                  aria-pressed={starred}
                                  onClick={() => toggle(report.key, starred)}
                                  className="text-muted hover:text-weekend"
                                >
                                  <Star className={cn('size-4', starred && 'fill-weekend text-weekend')} strokeWidth={1.5} />
                                </button>
                                <Link to={`/reports/${scope}/${report.key}`} className="hover:text-brand">
                                  {report.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </section>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        }}
      </AsyncContent>
    </div>
  )
}
