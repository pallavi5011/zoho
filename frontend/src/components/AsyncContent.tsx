import type { ReactNode } from 'react'
import type { ApiState } from '@/api/useApi'
import { Card } from '@/components/Card'
import { cn } from '@/lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div role="status" aria-label="Loading" className={cn('flex justify-center py-8', className)}>
      <span className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  )
}

interface AsyncContentProps<T> {
  state: ApiState<T>
  children: (data: T) => ReactNode
  className?: string
}

/** Loading / error card for an API call, then `children(data)` once it has loaded. */
export function AsyncContent<T>({ state, children, className }: AsyncContentProps<T>) {
  if (state.data) return <>{children(state.data)}</>

  return (
    <Card className={className}>
      {state.loading ? <Spinner /> : <p className="py-8 text-center text-danger">{state.error}</p>}
    </Card>
  )
}
