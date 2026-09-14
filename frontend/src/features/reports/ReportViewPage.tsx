import { ChevronLeft, FileChartColumn } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { REPORT_VIEWS } from '@/features/reports/reportViews'
import type { ListResponse, ReportDefinition } from '@/types'

/** /reports/:scope/:reportKey — header plus the report's own view. */
export function ReportViewPage() {
  const { scope, reportKey } = useParams()
  const reports = useApi<ListResponse<ReportDefinition>>('/reports')

  return (
    <div className="px-5 py-3">
      <Link to={`/reports/${scope === 'team' ? 'team' : 'my'}`} className="mb-3 inline-flex items-center gap-1 text-[13px] text-brand hover:underline">
        <ChevronLeft className="size-4" />
        {scope === 'team' ? 'Team Reports' : 'My Reports'}
      </Link>

      <AsyncContent state={reports}>
        {({ items }) => {
          const report = items.find((r) => r.key === reportKey && r.scope === scope)
          if (!report) {
            return (
              <Card>
                <EmptyState icon={FileChartColumn} message="Report not found" />
              </Card>
            )
          }
          const View = REPORT_VIEWS[report.key]
          return (
            <>
              <Card className="mb-2.5 px-5 py-4">
                <h1 className="text-[17px] font-bold">{report.name}</h1>
                <p className="text-[13px] text-muted">
                  {report.category} · {report.description}
                </p>
              </Card>
              <View />
            </>
          )
        }}
      </AsyncContent>
    </div>
  )
}
