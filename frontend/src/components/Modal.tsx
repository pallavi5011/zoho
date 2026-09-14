import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  /** Width override, e.g. `max-w-4xl` for large forms. */
  className?: string
}

export function Modal({ title, onClose, children, className }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className={cn('w-full rounded-lg bg-white shadow-xl', className ?? 'max-w-md')}>
        <header className="flex items-center justify-between border-b border-divider px-5 py-3">
          <h2 className="text-[15px] font-bold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-muted hover:text-ink">
            <X className="size-5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
