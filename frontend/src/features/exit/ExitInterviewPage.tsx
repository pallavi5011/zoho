import { useState } from 'react'
import { useApi } from '@/api/useApi'
import { EmployeeDetailRows } from '@/components/EmployeeDetailRows'
import { inputClass, textareaClass } from '@/components/Field'
import { RatingInput } from '@/components/RatingInput'
import { EmployeeField, FormRow, RecordFormModal, toEmployeeRef, type SaveMode } from '@/components/RecordForm'
import { auditColumns, RecordsView, type RecordColumn } from '@/components/RecordsView'
import { Tag } from '@/components/Tag'
import { useExitInterviews, useExitInterviewStore } from '@/store/requests'
import type { CurrentUser, ExitInterview, ExitInterviewOptions, ExitRatingKey } from '@/types'

const RATINGS: { key: ExitRatingKey; label: string }[] = [
  { key: 'job_satisfaction', label: 'Job Satisfaction' },
  { key: 'roles', label: 'Roles and Responsibilities' },
  { key: 'pay', label: 'Pay' },
  { key: 'benefits', label: 'Benefits' },
  { key: 'work_environment', label: 'Work Environment' },
  { key: 'management', label: 'Management' },
]

const ANY_OTHER = 'Any other'
const yesNo = (v: boolean | null) => (v === null ? '-' : v ? 'Yes' : 'No')

/** Question labels mention the company, which comes from the backend options. */
const labels = (company: string) => ({
  otherReason: "If you have selected 'Any other' then please specify the reason , else put in NA",
  primaryReason: `Primary reasons for leaving ${company}`,
  stayBack: `What could have made you stay back with ${company} ?`,
  recommend: `Would you recommend ${company} as an employer to your friends and connections`,
  rejoin: `Would you be willing to join ${company} again in future`,
  feedback: 'Any other feedback',
  notifyHr: 'Notify HR of the exit interview completion in Zoho People',
})

function columnsFor(company: string): RecordColumn<ExitInterview>[] {
  const l = labels(company)
  return [
    ...auditColumns<ExitInterview>(),
    {
      label: 'Emp Name',
      sortValue: (r) => r.employee.full_name,
      render: (r) => (
        <>
          {r.employee.employee_id} - <strong className="font-bold">{r.employee.full_name}</strong>
        </>
      ),
    },
    { label: l.otherReason, render: (r) => r.other_reason ?? '-' },
    { label: l.primaryReason, sortValue: (r) => r.primary_reason ?? '', render: (r) => r.primary_reason ?? '-' },
    { label: l.stayBack, render: (r) => r.stay_back ?? '-' },
    ...RATINGS.map((rating) => ({ label: rating.label, render: (r: ExitInterview) => r.ratings[rating.key] ?? '-' })),
    { label: l.recommend, render: (r) => yesNo(r.would_recommend) },
    { label: l.rejoin, render: (r) => yesNo(r.would_rejoin) },
    { label: l.feedback, render: (r) => r.other_feedback ?? '-' },
    { label: l.notifyHr, render: (r) => (r.notify_hr ? 'Yes' : 'No') },
    { label: 'Status', render: (r) => <Tag>{r.is_draft ? 'Draft' : 'Submitted'}</Tag> },
  ]
}

const emptyRatings = (): Record<ExitRatingKey, number | null> => ({
  job_satisfaction: null,
  roles: null,
  pay: null,
  benefits: null,
  work_environment: null,
  management: null,
})

const emptyForm = () => ({ primaryReason: '', otherReason: 'NA', stayBack: '', recommend: '', rejoin: '', feedback: '', notifyHr: true })

function YesNoSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="">Select</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
  )
}

// TODO: POST /exit/interviews once the backend exists; interviews are kept locally for now.
function ExitInterviewFormModal({ options, onClose }: { options: ExitInterviewOptions; onClose: () => void }) {
  const me = useApi<CurrentUser>('/me')
  const add = useExitInterviewStore((s) => s.add)
  const [form, setForm] = useState(emptyForm)
  const [ratings, setRatings] = useState(emptyRatings)
  const [error, setError] = useState<string | null>(null)
  const user = me.data
  const l = labels(options.company_name)
  const update = <K extends keyof ReturnType<typeof emptyForm>>(key: K, value: ReturnType<typeof emptyForm>[K]) => setForm((f) => ({ ...f, [key]: value }))
  const answer = (v: string) => (v ? v === 'yes' : null)

  function save(mode: SaveMode) {
    if (!user) return
    if (mode !== 'draft') {
      if (!form.primaryReason) return setError('Please select your primary reason for leaving.')
      if (form.primaryReason === ANY_OTHER && (!form.otherReason.trim() || form.otherReason.trim() === 'NA')) {
        return setError('Please specify the reason.')
      }
    }

    const now = new Date().toISOString()
    add({
      id: `local-${Date.now()}`,
      employee: toEmployeeRef(user),
      primary_reason: form.primaryReason || null,
      other_reason: form.otherReason.trim() || null,
      stay_back: form.stayBack.trim() || null,
      ratings,
      would_recommend: answer(form.recommend),
      would_rejoin: answer(form.rejoin),
      other_feedback: form.feedback.trim() || null,
      notify_hr: form.notifyHr,
      status: 'pending',
      is_draft: mode === 'draft',
      added_by: user.full_name,
      added_time: now,
      modified_by: user.full_name,
      modified_time: now,
    })
    onClose()
  }

  return (
    <RecordFormModal
      title="Add Exit Interview"
      section="Resignation Request Details"
      error={error}
      onSave={save}
      onClose={onClose}
      columns={1}
      allowNew={false}
      extraSections={[
        {
          title: 'Please rate below parameters on a Likert Scale (5 being the highest)',
          content: RATINGS.map((rating) => (
            <FormRow key={rating.key} label={rating.label}>
              <RatingInput label={rating.label} value={ratings[rating.key]} onChange={(value) => setRatings((r) => ({ ...r, [rating.key]: value }))} />
            </FormRow>
          )),
        },
        {
          title: 'Feedback',
          content: (
            <>
              <FormRow label={l.recommend}>
                <YesNoSelect value={form.recommend} onChange={(v) => update('recommend', v)} />
              </FormRow>
              <FormRow label={l.rejoin}>
                <YesNoSelect value={form.rejoin} onChange={(v) => update('rejoin', v)} />
              </FormRow>
              <FormRow label={l.feedback}>
                <textarea rows={3} value={form.feedback} onChange={(e) => update('feedback', e.target.value)} className={textareaClass} />
              </FormRow>
              <FormRow label={l.notifyHr}>
                <input type="checkbox" checked={form.notifyHr} onChange={(e) => update('notifyHr', e.target.checked)} className="size-4" />
              </FormRow>
            </>
          ),
        },
      ]}
    >
      <EmployeeField user={user} label="Emp Name" />
      <EmployeeDetailRows fields={['joining', 'department', 'designation', 'manager']} />
      <FormRow label={l.primaryReason} required>
        <select value={form.primaryReason} onChange={(e) => update('primaryReason', e.target.value)} className={inputClass}>
          <option value="">Select</option>
          {options.primary_reasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </FormRow>
      <FormRow label={l.otherReason} required={form.primaryReason === ANY_OTHER}>
        <input value={form.otherReason} onChange={(e) => update('otherReason', e.target.value)} className={inputClass} />
      </FormRow>
      <FormRow label={l.stayBack}>
        <textarea rows={3} value={form.stayBack} onChange={(e) => update('stayBack', e.target.value)} className={textareaClass} />
      </FormRow>
    </RecordFormModal>
  )
}

export function ExitInterviewPage() {
  const interviews = useExitInterviews()
  const options = useApi<ExitInterviewOptions>('/exit/interview-options')
  const [formOpen, setFormOpen] = useState(false)
  const company = options.data?.company_name ?? 'the company'

  return (
    <>
      <RecordsView
        viewName="Resignation Request View"
        state={interviews}
        columns={columnsFor(company)}
        searchText={(r) => `${r.employee.full_name} ${r.primary_reason ?? ''} ${r.other_feedback ?? ''}`}
        onAdd={() => setFormOpen(true)}
      />
      {formOpen && options.data && <ExitInterviewFormModal options={options.data} onClose={() => setFormOpen(false)} />}
    </>
  )
}
