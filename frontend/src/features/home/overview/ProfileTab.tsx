import {
  Armchair,
  Clock,
  Info,
  Mail,
  MapPin,
  Network,
  Pencil,
  Phone,
  Plus,
  Smartphone,
  Timer,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useApi } from '@/api/useApi'
import { AsyncContent } from '@/components/AsyncContent'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { inputClass } from '@/components/Field'
import { SectionTitle } from '@/components/SectionTitle'
import type { EmployeeProfile, ProfileSection } from '@/types'

const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  location: MapPin,
  department: Network,
  shift: Timer,
  time_zone: Clock,
  seating_location: Armchair,
  email: Mail,
  personal_mobile: Smartphone,
  work_phone: Phone,
}

// TODO: About Me and Tags edits are local only until the backend exists.
function AboutMeCard({ initial }: { initial: string | null }) {
  const [about, setAbout] = useState(initial ?? '')
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <Card className="p-5">
      <SectionTitle
        title="About Me"
        action={
          draft === null && (
            <button type="button" aria-label="Edit About Me" onClick={() => setDraft(about)} className="text-muted hover:text-brand">
              <Pencil className="size-4" strokeWidth={1.5} />
            </button>
          )
        }
      />
      {draft === null ? (
        <p className="mt-4 text-[13px]">{about || '-'}</p>
      ) : (
        <div className="mt-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            aria-label="About Me"
            className="w-full rounded border border-line p-3 text-[13px] outline-none focus:border-brand"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAbout(draft.trim())
                setDraft(null)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

function TagsCard({ initial }: { initial: string[] }) {
  const [tags, setTags] = useState(initial)
  const [draft, setDraft] = useState<string | null>(null)

  function add(e: FormEvent) {
    e.preventDefault()
    const tag = draft?.trim()
    if (tag && !tags.includes(tag)) setTags([...tags, tag])
    setDraft(null)
  }

  return (
    <Card className="p-5">
      <SectionTitle title="Tags" />
      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1.5 rounded-full bg-page px-3 py-1 text-[13px]">
              {tag}
              <button type="button" aria-label={`Remove ${tag}`} onClick={() => setTags(tags.filter((t) => t !== tag))}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {draft === null ? (
        <button type="button" onClick={() => setDraft('')} className="mx-auto mt-4 flex flex-col items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-full bg-page text-brand">
            <Plus className="size-4" />
          </span>
          Add Tags
        </button>
      ) : (
        <form onSubmit={add} className="mx-auto mt-4 flex max-w-xs gap-2">
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Enter a tag" aria-label="Tag" className={inputClass} />
          <Button type="submit">Add</Button>
        </form>
      )}
    </Card>
  )
}

function SectionCard({ section }: { section: ProfileSection }) {
  return (
    <Card className="p-5">
      <SectionTitle title={section.title} />
      {section.type === 'fields' ? (
        <dl className="mt-5 grid gap-x-10 md:grid-cols-2">
          {section.fields.map((field) => (
            <div key={field.label} className="flex gap-4 py-2 text-[15px]">
              <dt className="w-[190px] shrink-0 pt-1.5 text-muted">{field.label}</dt>
              <dd className="min-w-0 flex-1 whitespace-pre-line break-words border-b border-divider pb-2.5 pt-1.5">{field.value ?? '-'}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-divider text-muted">
                {section.columns.map((col) => (
                  <th key={col} className="whitespace-nowrap px-3 py-2.5 font-normal">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.length === 0 ? (
                <tr>
                  <td colSpan={section.columns.length} className="px-3 py-6 text-center text-muted">
                    No records found
                  </td>
                </tr>
              ) : (
                section.rows.map((row, i) => (
                  <tr key={i} className="border-b border-divider last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2.5">
                        {cell ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export function ProfileTab() {
  const profile = useApi<EmployeeProfile>('/myspace/profile')

  return (
    <AsyncContent state={profile}>
      {(data) => (
        <>
          <Card className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.highlights.map((item) => {
              const Icon = HIGHLIGHT_ICONS[item.key] ?? Info
              return (
                <div key={item.key} className="flex items-center gap-3 text-[13px]">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-muted">
                    <Icon className="size-4" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-muted">{item.label}</p>
                    <p className="truncate">{item.value ?? '-'}</p>
                  </div>
                </div>
              )
            })}
          </Card>

          <AboutMeCard initial={data.about_me} />

          <Card className="p-5">
            <SectionTitle title="Organization Structure" />
            {data.organization_structure.map((row) => (
              <div key={row.label} className="mt-5 flex items-center gap-3 text-[13px]">
                <span className="flex size-8 items-center justify-center rounded-md bg-[#f1ebfb] text-[#8e6bd8]">
                  <Network className="size-4" strokeWidth={1.5} />
                </span>
                <span className="w-[140px]">{row.label}</span>
                <span>{row.value ?? '-'}</span>
              </div>
            ))}
          </Card>

          <TagsCard initial={data.tags} />

          {data.sections.map((section) => (
            <SectionCard key={section.key} section={section} />
          ))}
        </>
      )}
    </AsyncContent>
  )
}
