import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

interface SortButtonProps {
  label: string
  active: boolean
  dir: 1 | -1
  onClick: () => void
}

/** Column header label with Zoho's sort arrows. */
export function SortButton({ label, active, dir, onClick }: SortButtonProps) {
  const Icon = !active ? ArrowUpDown : dir === 1 ? ArrowUp : ArrowDown
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 whitespace-nowrap hover:text-brand">
      {label}
      <Icon className={active ? 'size-3.5 text-brand' : 'size-3.5 text-muted'} />
    </button>
  )
}

export type SortState<K extends string> = { key: K; dir: 1 | -1 }

/** Same column → flip direction, new column → ascending. */
export const nextSort = <K extends string>(current: SortState<K>, key: K): SortState<K> => ({
  key,
  dir: current.key === key && current.dir === 1 ? -1 : 1,
})
