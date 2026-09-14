import type { EmployeeRef } from '@/types'

interface EmployeePhotoProps {
  employee: EmployeeRef
  size: number
  radius?: number
}

/** Employee photo, or Zoho's grey silhouette placeholder when there is none. */
export function EmployeePhoto({ employee, size, radius = 8 }: EmployeePhotoProps) {
  const style = { width: size, height: size, borderRadius: radius }

  if (employee.photo_url) {
    return <img src={employee.photo_url} alt={employee.full_name} style={style} className="shrink-0 border border-line object-cover" />
  }

  return (
    <span aria-hidden="true" style={style} className="flex shrink-0 overflow-hidden border border-[#d5dbe5] bg-[#dfe3eb]">
      <svg viewBox="0 0 38 38" fill="#fff" className="size-full">
        <circle cx="19" cy="14.5" r="6" />
        <ellipse cx="19" cy="30" rx="10" ry="6.5" />
      </svg>
    </span>
  )
}
