import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { toolbarInputClass } from '@/components/Field'
import { IconButton } from '@/components/IconButton'
import { cn } from '@/lib/cn'

interface PaginationProps {
  total: number
  /** Zero-based. */
  page: number
  pageSize: number
  pageSizes?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  /** Left side, e.g. "Total Record Count". */
  children?: ReactNode
}

/** Table footer: summary on the left, page size and prev/next on the right. */
export function Pagination({ total, page, pageSize, pageSizes = [10, 20, 50], onPageChange, onPageSizeChange, children }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : page * pageSize + 1
  const end = Math.min(total, (page + 1) * pageSize)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-divider px-4 py-2.5 text-[13px]">
      <div>{children}</div>
      <div className="flex items-center gap-3">
        <select aria-label="Records per page" value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className={cn(toolbarInputClass, 'w-20')}>
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-muted">Records per page</span>
        <span>
          {start} - {end}
        </span>
        <IconButton label="Previous page" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" />
        </IconButton>
        <IconButton label="Next page" disabled={page >= pageCount - 1} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
    </div>
  )
}

/** Clamps `page` and returns the rows for it. */
export function paginate<T>(rows: T[], page: number, pageSize: number) {
  const current = Math.min(page, Math.max(0, Math.ceil(rows.length / pageSize) - 1))
  return { current, rows: rows.slice(current * pageSize, (current + 1) * pageSize) }
}
