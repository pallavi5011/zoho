const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const pad = (n: number) => String(n).padStart(2, '0')

/** Local-date key, yyyy-mm-dd. */
export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function parseDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 13-Sep-2026 */
export const formatDate = (d: Date) => `${pad(d.getDate())}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`

/** "09:00" → "9:00 AM" */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`
}

/** ISO timestamp → "11 September 10:05 AM" */
export function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${monthLong(d)} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

export const weekdayShort = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short' })
export const weekdayLong = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long' })
export const monthShort = (d: Date) => MONTHS[d.getMonth()]
export const monthLong = (d: Date) => d.toLocaleDateString('en-US', { month: 'long' })

export function greeting(d: Date) {
  const hour = d.getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

/** 13 → "1 Year and 1 Month" */
export function formatExperience(months: number) {
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = []
  if (years) parts.push(`${years} Year${years > 1 ? 's' : ''}`)
  if (rest || !years) parts.push(`${rest} Month${rest === 1 ? '' : 's'}`)
  return parts.join(' and ')
}

/** ISO timestamp → "13 March 2025, 11:11 AM" */
export function formatDateTimeLong(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${monthLong(d)} ${d.getFullYear()}, ${formatTime(`${d.getHours()}:${d.getMinutes()}`)}`
}

export const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)

export const isWeekendDate = (d: Date) => d.getDay() === 0 || d.getDay() === 6

/** Every date from `from` to `to`, inclusive. */
export function eachDay(from: Date, to: Date) {
  const days: Date[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d)
  return days
}

/** "HH:mm" → minutes since midnight */
export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** 754 → "12:34" */
export const formatMinutes = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(Math.floor(minutes % 60))}`

/** Sunday of the week containing `d`. */
export const startOfWeek = (d: Date) => addDays(d, -d.getDay())

/** 0.5 → "0.5 day", 11 → "11 days" */
export const formatDays = (n: number) => `${n} ${n > 1 ? 'days' : 'day'}`

/** Milliseconds → ['hh', 'mm', 'ss'] */
export function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map(pad)
}
