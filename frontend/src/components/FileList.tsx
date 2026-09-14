import { FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/date'
import type { FileItem } from '@/types'

export const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`)

export function FileList({ files }: { files: FileItem[] }) {
  return (
    <ul className="divide-y divide-divider">
      {files.map((file) => (
        <li key={file.id} className="flex items-center gap-3 px-5 py-3 text-[13px]">
          <FileText className="size-5 shrink-0 text-danger" strokeWidth={1.5} />
          <p className="min-w-0 flex-1 truncate">{file.name}</p>
          <span className="text-muted">{formatSize(file.size_bytes)}</span>
          <span className="w-[170px] text-right text-muted">{formatDateTime(file.uploaded_at)}</span>
        </li>
      ))}
    </ul>
  )
}
