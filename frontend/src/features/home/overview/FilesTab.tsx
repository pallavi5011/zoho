import { FolderOpen } from 'lucide-react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { FileList } from '@/components/FileList'
import type { ListResponse, SharedFile } from '@/types'

export function FilesTab() {
  const files = useApi<ListResponse<SharedFile>>('/files')

  return (
    <AsyncContent state={files}>
      {({ items }) => {
        const mine = items.filter((f) => f.scope === 'me')
        return (
          <Card>
            {mine.length === 0 ? (
              <EmptyState icon={FolderOpen} message="Personal uploads and files shared with you will be displayed here" className="text-[13px]" />
            ) : (
              <FileList files={mine} />
            )}
          </Card>
        )
      }}
    </AsyncContent>
  )
}
