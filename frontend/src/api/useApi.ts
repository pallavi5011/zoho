import { useCallback, useEffect, useState } from 'react'
import { apiGet } from '@/api/client'

export interface ApiState<T> {
  data: T | null
  error: string | null
  loading: boolean
  reload: () => void
}

/** GETs `path` on mount and whenever it changes. */
export function useApi<T>(path: string): ApiState<T> {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<Omit<ApiState<T>, 'reload'>>({ data: null, error: null, loading: true })

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: null }))
    apiGet<T>(path)
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch(
        (err: unknown) =>
          active && setState({ data: null, error: err instanceof Error ? err.message : 'Something went wrong', loading: false }),
      )
    return () => {
      active = false
    }
  }, [path, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { ...state, reload }
}
