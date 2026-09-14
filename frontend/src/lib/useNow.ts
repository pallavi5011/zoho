import { useEffect, useState } from 'react'

/** Current timestamp, re-rendering every `intervalMs` while `live` is true. */
export function useNow(live = true, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [live, intervalMs])

  return now
}
