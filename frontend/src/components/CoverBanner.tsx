import { Ellipsis } from 'lucide-react'
import { cn } from '@/lib/cn'

export function CoverBanner({ className, showMenu = true }: { className?: string; showMenu?: boolean }) {
  return (
    <div className={cn('relative h-[140px]', className ?? 'home-cover')}>
      {showMenu && (
        <button
          type="button"
          aria-label="More options"
          className="absolute right-9 top-5 flex size-[30px] items-center justify-center rounded bg-white text-[#555] hover:bg-page"
        >
          <Ellipsis className="size-4" />
        </button>
      )}
    </div>
  )
}
