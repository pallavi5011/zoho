import { useState, type ReactNode } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { DateStepper } from '@/components/DateStepper'
import { toolbarInputClass } from '@/components/Field'
import { entriesPath } from '@/features/attendance/entries'
import { statusClass } from '@/features/home/presence'
import { cn } from '@/lib/cn'
import { formatDate, formatExperience, formatMinutes, formatTime, monthShort, pad, parseDateKey, toDateKey, toMinutes } from '@/lib/date'
import type { AttendanceEntry, CareerHistory, EmployeeRecord, LeaveBalance, ListResponse, ReportKey } from '@/types'

/* ---------- shared building blocks ---------- */

/** Single-series bar colour (reference palette, categorical slot 1). */
const SERIES_1 = '#2a78d6'

function StatTiles({ stats }: { stats: { label: string; value: ReactNode }[] }) {
  return (
    <div className="mb-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="px-4 py-3">
          <p className="text-[13px] text-muted">{s.label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{s.value}</p>
        </Card>
      ))}
    </div>
  )
}

function DataTable({ columns, rows, empty }: { columns: string[]; rows: ReactNode[][]; empty: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full min-w-[640px] whitespace-nowrap text-left text-[13px]">
        <thead className="bg-[#eef1f5]">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-normal">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-divider last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

/** Horizontal bars for one measure; every row carries its count and share as text. */
function BarList({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const total = rows.reduce((sum, r) => sum + r.value, 0)
  const max = Math.max(1, ...rows.map((r) => r.value))

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-bold">{title}</h3>
      <ul className="space-y-1">
        {rows.map((row) => {
          const share = total ? Math.round((row.value / total) * 100) : 0
          return (
            <li
              key={row.label}
              title={`${row.label}: ${row.value} (${share}%)`}
              className="grid grid-cols-[minmax(120px,180px)_1fr_90px] items-center gap-3 rounded px-2 py-1.5 text-[13px] hover:bg-page"
            >
              <span className="truncate">{row.label}</span>
              <span className="h-3">
                <span className="block h-full rounded-r-[4px]" style={{ width: `${(row.value / max) * 100}%`, backgroundColor: SERIES_1 }} />
              </span>
              <span className="text-right tabular-nums">
                <strong className="font-bold">{row.value}</strong> <span className="text-muted">({share}%)</span>
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

const dateLabel = (key: string) => formatDate(parseDateKey(key))

/** Month switcher + the month's attendance entries. */
function MonthEntries({ children }: { children: (entries: AttendanceEntry[]) => ReactNode }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const entries = useApi<ListResponse<AttendanceEntry>>(entriesPath(month, end))
  const monthKey = `${month.getFullYear()}-${pad(month.getMonth() + 1)}`
  const shift = (dir: 1 | -1) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + dir, 1))

  return (
    <>
      <DateStepper className="mb-3 justify-center" label={`${monthShort(month)} ${month.getFullYear()}`} onPrev={() => shift(-1)} onNext={() => shift(1)} />
      <AsyncContent state={entries}>{({ items }) => children(items.filter((e) => e.date.startsWith(monthKey)))}</AsyncContent>
    </>
  )
}

/* ---------- My Reports ---------- */

function CareerHistoryReport() {
  const history = useApi<CareerHistory>('/myspace/career-history')
  return (
    <AsyncContent state={history}>
      {(data) => (
        <>
          <StatTiles
            stats={[
              { label: 'Current experience', value: formatExperience(data.current_experience_months) },
              { label: 'Total experience', value: formatExperience(data.total_experience_months) },
              { label: 'Date of joining', value: dateLabel(data.date_of_joining) },
              { label: 'Changes recorded', value: data.timeline.length },
            ]}
          />
          <DataTable
            columns={['Date', 'Event', 'Details']}
            empty="No career changes recorded"
            rows={[...data.timeline]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((event) => [
                dateLabel(event.date),
                event.type === 'joined' ? 'Joined' : 'Update',
                event.changes.length ? event.changes.map((c) => `${c.label}: ${c.value ?? '-'}`).join(', ') : (event.message ?? '-'),
              ])}
          />
        </>
      )}
    </AsyncContent>
  )
}

function LeaveBalanceReport() {
  const balances = useApi<ListResponse<LeaveBalance>>('/leave/balances')
  return (
    <AsyncContent state={balances}>
      {({ items }) => {
        const booked = items.reduce((sum, b) => sum + b.booked, 0)
        const available = items.reduce((sum, b) => sum + b.available, 0)
        return (
          <>
            <StatTiles
              stats={[
                { label: 'Leave types', value: items.length },
                { label: 'Allotted', value: booked + available },
                { label: 'Booked', value: booked },
                { label: 'Available', value: available },
              ]}
            />
            <DataTable
              columns={['Leave type', 'Allotted', 'Booked', 'Available']}
              empty="No leave types"
              rows={[
                ...items.map((b) => [b.name, b.booked + b.available, b.booked, b.available]),
                [<strong className="font-bold">Total</strong>, <strong className="font-bold">{booked + available}</strong>, <strong className="font-bold">{booked}</strong>, <strong className="font-bold">{available}</strong>],
              ]}
            />
          </>
        )
      }}
    </AsyncContent>
  )
}

function EarlyLateReport() {
  return (
    <MonthEntries>
      {(entries) => {
        const rows = entries
          .filter((e) => e.shift && e.check_in)
          .map((e) => {
            const late = toMinutes(e.check_in!) - toMinutes(e.shift!.start_time)
            const early = e.check_out ? toMinutes(e.shift!.end_time) - toMinutes(e.check_out) : 0
            return { e, late: Math.max(0, late), early: Math.max(0, early) }
          })
        const flag = (minutes: number) => (minutes > 0 ? <span className="text-danger">{formatMinutes(minutes)} Hrs</span> : <span className="text-muted">-</span>)
        return (
          <>
            <StatTiles
              stats={[
                { label: 'Days checked in', value: rows.length },
                { label: 'Late check-ins', value: rows.filter((r) => r.late > 0).length },
                { label: 'Early check-outs', value: rows.filter((r) => r.early > 0).length },
                { label: 'On time', value: rows.filter((r) => !r.late && !r.early).length },
              ]}
            />
            <DataTable
              columns={['Date', 'Shift', 'Check-in', 'Late by', 'Check-out', 'Early by']}
              empty="No check-ins this month"
              rows={rows.map(({ e, late, early }) => [
                dateLabel(e.date),
                `${e.shift!.name} (${formatTime(e.shift!.start_time)} - ${formatTime(e.shift!.end_time)})`,
                formatTime(e.check_in!),
                flag(late),
                e.check_out ? formatTime(e.check_out) : '-',
                flag(early),
              ])}
            />
          </>
        )
      }}
    </MonthEntries>
  )
}

function PresentAbsentReport() {
  const todayKey = toDateKey(new Date())
  return (
    <MonthEntries>
      {(entries) => {
        const count = (status: AttendanceEntry['status']) => entries.filter((e) => e.status === status).length
        const past = entries.filter((e) => e.date <= todayKey)
        return (
          <>
            <StatTiles
              stats={[
                { label: 'Present', value: count('present') },
                { label: 'Leave', value: count('on_leave') },
                { label: 'Weekend / Holiday', value: count('weekend') + count('holiday') },
                { label: 'Absent / Not marked', value: count('absent') + past.filter((e) => !e.status).length },
              ]}
            />
            <DataTable
              columns={['Date', 'Status', 'Hours worked']}
              empty="No attendance for this month"
              rows={past.map((e) => [
                dateLabel(e.date),
                <span className={statusClass(e.status)}>{e.status_label ?? 'Not marked'}</span>,
                e.worked_minutes ? `${formatMinutes(e.worked_minutes)} Hrs` : '-',
              ])}
            />
          </>
        )
      }}
    </MonthEntries>
  )
}

function PresenceHoursReport() {
  return (
    <MonthEntries>
      {(entries) => {
        const days = entries.filter((e) => e.status === 'present' && e.shift)
        const shiftMinutes = (e: AttendanceEntry) => toMinutes(e.shift!.end_time) - toMinutes(e.shift!.start_time)
        const worked = days.reduce((sum, e) => sum + e.worked_minutes, 0)
        const expected = days.reduce((sum, e) => sum + shiftMinutes(e), 0)
        const signed = (minutes: number) => (
          <span className={cn('tabular-nums', minutes >= 0 ? 'text-success' : 'text-danger')}>
            {minutes >= 0 ? '+' : '-'}
            {formatMinutes(Math.abs(minutes))} Hrs
          </span>
        )
        return (
          <>
            <StatTiles
              stats={[
                { label: 'Days present', value: days.length },
                { label: 'Hours worked', value: `${formatMinutes(worked)} Hrs` },
                { label: 'Shift hours', value: `${formatMinutes(expected)} Hrs` },
                { label: 'Difference', value: signed(worked - expected) },
              ]}
            />
            <DataTable
              columns={['Date', 'Shift hours', 'Hours worked', 'Difference']}
              empty="No presence recorded this month"
              rows={days.map((e) => [dateLabel(e.date), `${formatMinutes(shiftMinutes(e))} Hrs`, `${formatMinutes(e.worked_minutes)} Hrs`, signed(e.worked_minutes - shiftMinutes(e))])}
            />
          </>
        )
      }}
    </MonthEntries>
  )
}

/* ---------- Team Reports ---------- */

const countBy = (items: EmployeeRecord[], key: (e: EmployeeRecord) => string) => {
  const counts = new Map<string, number>()
  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1)
  return [...counts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
}

const GROUPS = {
  department: { label: 'Department', key: (e: EmployeeRecord) => e.department },
  location: { label: 'Location', key: (e: EmployeeRecord) => e.location },
  designation: { label: 'Designation', key: (e: EmployeeRecord) => e.designation ?? 'Not set' },
}

function DistributionReport() {
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const [group, setGroup] = useState<keyof typeof GROUPS>('department')

  return (
    <AsyncContent state={employees}>
      {({ items }) => (
        <>
          <div className="mb-3 flex items-center justify-end gap-2 text-[13px]">
            <span className="text-muted">Group by</span>
            <select aria-label="Group by" value={group} onChange={(e) => setGroup(e.target.value as keyof typeof GROUPS)} className={cn(toolbarInputClass, 'w-[200px]')}>
              {Object.entries(GROUPS).map(([value, g]) => (
                <option key={value} value={value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <BarList title={`Employees by ${GROUPS[group].label.toLowerCase()} (${items.length} total)`} rows={countBy(items, GROUPS[group].key)} />
        </>
      )}
    </AsyncContent>
  )
}

const TENURE_BUCKETS = [
  { label: 'Less than 1 year', max: 12 },
  { label: '1–3 years', max: 36 },
  { label: '3–5 years', max: 60 },
  { label: '5+ years', max: Infinity },
]

function DiversityReport() {
  const employees = useApi<ListResponse<EmployeeRecord>>('/organization/employees')
  const now = new Date()
  const tenureMonths = (e: EmployeeRecord) => {
    const joined = parseDateKey(e.date_of_joining)
    return (now.getFullYear() - joined.getFullYear()) * 12 + now.getMonth() - joined.getMonth()
  }

  return (
    <AsyncContent state={employees}>
      {({ items }) => (
        <div className="grid gap-2.5 lg:grid-cols-2">
          <BarList title="By location" rows={countBy(items, (e) => e.location)} />
          {/* Ordinal buckets keep their natural order, including empty ones. */}
          <BarList
            title="By tenure"
            rows={TENURE_BUCKETS.map((bucket, i) => ({
              label: bucket.label,
              value: items.filter((e) => {
                const months = tenureMonths(e)
                return months < bucket.max && months >= (TENURE_BUCKETS[i - 1]?.max ?? 0)
              }).length,
            }))}
          />
        </div>
      )}
    </AsyncContent>
  )
}

export const REPORT_VIEWS: Record<ReportKey, () => ReactNode> = {
  career_history: CareerHistoryReport,
  leave_balance: LeaveBalanceReport,
  early_late_checkin: EarlyLateReport,
  present_absent: PresentAbsentReport,
  presence_hours: PresenceHoursReport,
  distribution: DistributionReport,
  diversity: DiversityReport,
}
