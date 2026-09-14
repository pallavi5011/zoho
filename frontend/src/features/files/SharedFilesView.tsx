import { ChevronRight, Download, Eye, FileText, Folder, List, ListFilter } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { toolbarInputClass } from '@/components/Field'
import { formatSize } from '@/components/FileList'
import { IconButton } from '@/components/IconButton'
import { Modal } from '@/components/Modal'
import { nextSort, SortButton, type SortState } from '@/components/SortButton'
import { Tag } from '@/components/Tag'
import { cn } from '@/lib/cn'
import { formatDate, formatDateTime, parseDateKey } from '@/lib/date'
import type { FileScope, ListResponse, SharedFile } from '@/types'

const EMPTY_TEXT: Record<FileScope, { title: string; hint: string }> = {
  me: { title: 'No shared files to display', hint: 'Files shared to you by other employees will be listed here' },
  role: { title: 'No shared files to display', hint: 'Files shared to you by other employees will be listed here' },
  department: {
    title: 'No department files are shared yet',
    hint: 'Use this space to share department specific files such as training and process documents.',
  },
  organization: { title: 'No organization files are shared yet', hint: 'Policies and documents shared with everyone will be listed here.' },
}

type SortKey = 'name' | 'updated_on'

function FilesTable({ files, onView }: { files: SharedFile[]; onView: (file: SharedFile) => void }) {
  const [sort, setSort] = useState<SortState<SortKey>>({ key: 'name', dir: 1 })
  const sorted = [...files].sort((a, b) => a[sort.key].localeCompare(b[sort.key]) * sort.dir)

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full min-w-[860px] whitespace-nowrap text-left text-[13px]">
        <thead className="bg-[#eef1f5]">
          <tr>
            <th className="px-4 py-3 font-normal">
              <SortButton label="Name" active={sort.key === 'name'} dir={sort.dir} onClick={() => setSort(nextSort(sort, 'name'))} />
            </th>
            <th className="px-4 py-3 font-normal">Shared with</th>
            <th className="px-4 py-3 font-normal">Folder</th>
            <th className="px-4 py-3 font-normal">
              <SortButton label="Updated on" active={sort.key === 'updated_on'} dir={sort.dir} onClick={() => setSort(nextSort(sort, 'updated_on'))} />
            </th>
            <th className="px-4 py-3 font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((file) => (
            <tr key={file.id} className="border-b border-divider last:border-0">
              <td className="px-4 py-3">
                <span className="flex items-center gap-2">
                  <FileText className="size-5 shrink-0 text-danger" strokeWidth={1.5} />
                  {file.name}
                </span>
              </td>
              <td className="px-4">
                <Tag>{file.shared_with}</Tag>
              </td>
              <td className="px-4">
                <Tag>{file.folder}</Tag>
              </td>
              <td className="px-4">{formatDate(parseDateKey(file.updated_on))}</td>
              <td className="px-4">
                <span className="flex items-center gap-3 text-muted">
                  <button type="button" aria-label={`View details of ${file.name}`} onClick={() => onView(file)} className="hover:text-brand">
                    <Eye className="size-4" strokeWidth={1.5} />
                  </button>
                  {file.download_url ? (
                    <a href={file.download_url} download aria-label={`Download ${file.name}`} className="hover:text-brand">
                      <Download className="size-4" strokeWidth={1.5} />
                    </a>
                  ) : (
                    <span title="Download not available yet" className="opacity-40">
                      <Download className="size-4" strokeWidth={1.5} />
                    </span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FileDetailsModal({ file, onClose }: { file: SharedFile; onClose: () => void }) {
  const rows: [string, string][] = [
    ['Folder', file.folder],
    ['Shared with', file.shared_with],
    ['Shared by', file.shared_by ?? '-'],
    ['Size', formatSize(file.size_bytes)],
    ['Uploaded on', formatDateTime(file.uploaded_at)],
    ['Updated on', formatDate(parseDateKey(file.updated_on))],
  ]
  return (
    <Modal title={file.name} onClose={onClose}>
      <dl className="grid grid-cols-[120px_1fr] gap-y-3 px-5 py-4 text-[13px]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  )
}

/** List / folder view of the files shared in one scope (Shared with Me, Department, Organization …). */
export function SharedFilesView({ scope }: { scope: FileScope }) {
  const files = useApi<ListResponse<SharedFile>>('/files')
  const [view, setView] = useState<'list' | 'folder'>('list')
  const [openFolder, setOpenFolder] = useState<string | null>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [details, setDetails] = useState<SharedFile | null>(null)

  return (
    <>
      <div className="mb-3 flex justify-end gap-2">
        {query !== null && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files"
            aria-label="Search files"
            className={cn(toolbarInputClass, 'w-64')}
          />
        )}
        <div className="flex gap-1">
          <IconButton label="List View" active={view === 'list'} aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <List className="size-4" />
          </IconButton>
          <IconButton
            label="Folder view"
            active={view === 'folder'}
            aria-pressed={view === 'folder'}
            onClick={() => {
              setView('folder')
              setOpenFolder(null)
            }}
          >
            <Folder className="size-4" />
          </IconButton>
        </div>
        <IconButton label="Filter" active={query !== null} onClick={() => setQuery((q) => (q === null ? '' : null))}>
          <ListFilter className="size-4" />
        </IconButton>
      </div>

      <AsyncContent state={files}>
        {({ items }) => {
          const q = query?.trim().toLowerCase() ?? ''
          const inScope = items.filter((f) => f.scope === scope)
          const visible = inScope.filter((f) => !q || f.name.toLowerCase().includes(q))

          if (visible.length === 0) {
            const empty = EMPTY_TEXT[scope]
            return (
              <Card>
                <EmptyState icon={FileText} message={inScope.length ? 'No files match your search' : empty.title}>
                  {!inScope.length && <p className="mt-2 max-w-[460px] text-[13px] text-muted">{empty.hint}</p>}
                </EmptyState>
              </Card>
            )
          }

          if (view === 'list') return <FilesTable files={visible} onView={setDetails} />

          const folders = new Map<string, SharedFile[]>()
          for (const file of visible) folders.set(file.folder, [...(folders.get(file.folder) ?? []), file])

          if (openFolder && folders.has(openFolder)) {
            return (
              <>
                <nav aria-label="Folder path" className="mb-3 flex items-center gap-1.5 text-[13px]">
                  <button type="button" onClick={() => setOpenFolder(null)} className="text-brand hover:underline">
                    All folders
                  </button>
                  <ChevronRight className="size-4 text-muted" />
                  <span className="font-bold">{openFolder}</span>
                </nav>
                <FilesTable files={folders.get(openFolder)!} onView={setDetails} />
              </>
            )
          }

          return (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {[...folders].map(([name, folderFiles]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setOpenFolder(name)}
                  className="flex items-center gap-3 rounded-lg border border-line bg-white p-4 text-left text-[13px] transition-colors hover:border-brand"
                >
                  <Folder className="size-8 shrink-0 fill-[#f7cd73] text-[#e8b24a]" strokeWidth={1.25} />
                  <span>
                    <span className="block font-bold">{name}</span>
                    <span className="text-muted">
                      {folderFiles.length} file{folderFiles.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )
        }}
      </AsyncContent>

      {details && <FileDetailsModal file={details} onClose={() => setDetails(null)} />}
    </>
  )
}

export function FilesPage({ scope }: { scope: FileScope }) {
  return (
    <div className="px-5 py-3">
      <SharedFilesView scope={scope} />
    </div>
  )
}
