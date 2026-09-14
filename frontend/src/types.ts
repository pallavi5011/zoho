/* Shapes of the `data` field returned by each endpoint (see src/mocks/responses.json). */

export type AttendanceStatus = 'present' | 'absent' | 'weekend' | 'holiday' | 'on_leave' | 'on_duty' | 'yet_to_check_in'

/** Status of any request that goes through approval (leave, regularization …). */
export type RequestStatus = 'approved' | 'pending' | 'rejected' | 'cancelled'

export interface ListResponse<T> {
  items: T[]
  total: number
}

export interface Paginated<T> extends ListResponse<T> {
  page: number
  page_size: number
}

export interface KeyValue {
  label: string
  value: string | null
}

export interface EmployeeRef {
  id: string
  employee_id: string
  full_name: string
  designation: string | null
  photo_url: string | null
  status: AttendanceStatus | null
  status_label: string | null
}

/** GET /me */
export interface CurrentUser {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  full_name: string
  designation: string
  department_id: string
  department: string
  location: string
  email: string
  photo_url: string | null
  avatar_color: string
  notification_count: number
}

/** GET /myspace/overview */
export interface MySpaceOverview {
  profile: EmployeeRef & { avatar_color: string }
  attendance_today: {
    date: string
    checked_in: boolean
    check_in_time: string | null
    worked_seconds: number
  }
  reporting_manager: EmployeeRef | null
  department_members: EmployeeRef[]
}

export interface Shift {
  name: string
  /** HH:mm, 24h */
  start_time: string
  end_time: string
}

/** GET /attendance/entries?from=yyyy-mm-dd&to=yyyy-mm-dd → ListResponse<AttendanceEntry> (one per day) */
export interface AttendanceEntry {
  date: string
  shift: Shift | null
  status: AttendanceStatus | null
  status_label: string | null
  work_mode: 'office' | 'remote' | null
  /** HH:mm */
  check_in: string | null
  check_out: string | null
  worked_minutes: number
}

/** GET /attendance/regularizations → ListResponse<Regularization> */
export interface Regularization {
  id: string
  date: string
  check_in: string
  check_out: string
  reason: string | null
  status: RequestStatus
  requested_on: string
}

/** GET /attendance/team → ListResponse<TeamAttendance> */
export interface TeamAttendance {
  employee: EmployeeRef
  location: string
  shift: Shift
  check_in: string | null
}

/** GET /holidays/upcoming → ListResponse<Holiday> */
export interface Holiday {
  id: string
  name: string
  date: string
}

export type FeedType = 'status' | 'announcement' | 'approval' | 'mail_alert' | 'holiday' | 'reminder'

export interface FeedComment {
  id: string
  author_name: string
  message: string
  created_at: string
}

/** GET /myspace/feeds → Paginated<FeedItem> */
export interface FeedItem {
  id: string
  type: FeedType
  title: string
  message: string
  created_at: string
  comments: FeedComment[]
}

export type ProfileSection =
  | { key: string; title: string; type: 'fields'; fields: KeyValue[] }
  | { key: string; title: string; type: 'table'; columns: string[]; rows: (string | null)[][] }

/** GET /myspace/profile */
export interface EmployeeProfile {
  highlights: (KeyValue & { key: string })[]
  about_me: string | null
  organization_structure: KeyValue[]
  tags: string[]
  sections: ProfileSection[]
}

/** GET /myspace/approvals → ListResponse<ApprovalItem> */
export interface ApprovalItem {
  id: string
  module: string
  title: string
  requested_by: EmployeeRef
  requested_at: string
  status_label: string
}

/** GET /leave/balances → ListResponse<LeaveBalance> */
export interface LeaveBalance {
  id: string
  name: string
  code: string
  color: string
  available: number
  booked: number
}

/** GET /myspace/files → ListResponse<FileItem> */
export interface FileItem {
  id: string
  name: string
  file_type: string
  size_bytes: number
  uploaded_at: string
  shared_by: string | null
}

export interface CareerEvent {
  id: string
  date: string
  type: 'update' | 'joined'
  changes: KeyValue[]
  message: string | null
}

/** GET /myspace/career-history */
export interface CareerHistory {
  current_experience_months: number
  total_experience_months: number
  date_of_joining: string
  timeline: CareerEvent[]
}

/** GET /myspace/related-data → ListResponse<RelatedDataItem> */
export interface RelatedDataItem {
  key: string
  label: string
  count: number
}

/** GET /myspace/delegations → ListResponse<Delegation> */
export interface Delegation {
  id: string
  delegate: EmployeeRef
  from_date: string
  to_date: string
  reason: string | null
}

export interface QuickLink {
  id: string
  title: string
  url: string
}

/** GET /team/space */
export interface TeamSpace {
  department: { id: string; name: string; strength: number }
  availability: { status: AttendanceStatus; label: string; count: number }[]
  location_diversity: { location: string; count: number }[]
  wall: FeedItem[]
  groups: { id: string; name: string; member_count: number }[]
  work_anniversaries: EmployeeRef[]
  new_hires: EmployeeRef[]
  birthdays: EmployeeRef[]
  department_files: FileItem[]
}

/** GET /organization/overview */
export interface OrganizationOverview {
  organization: { name: string; country: string; logo_url: string | null }
  quick_links: QuickLink[]
  services: { key: string; label: string }[]
  locations: { id: string; name: string; address: string; employee_count: number }[]
}

/** GET /myspace/dashboard */
export interface Dashboard {
  birthdays: EmployeeRef[]
  new_hires: EmployeeRef[]
  favorites: EmployeeRef[]
  quick_links: QuickLink[]
  announcements: { id: string; title: string; created_at: string }[]
  leave_report: { key: string; name: string; count: number; available: number | null; color: string }[]
  upcoming_holidays: Holiday[]
  pending_tasks: { id: string; title: string; due_date: string | null; priority: 'low' | 'medium' | 'high' }[]
  my_files: { total: number; organization_files: FileItem[]; employee_files: FileItem[] }
  work_anniversaries: EmployeeRef[]
  wedding_anniversaries: EmployeeRef[]
  lop_summary: { pay_period: string; lop_days: number } | null
}

/** GET /organization/employees → ListResponse<EmployeeRecord> (also drives trees, peers, directory, birthdays, new hires) */
export interface EmployeeRecord extends EmployeeRef {
  first_name: string
  last_name: string
  preferred_name: string | null
  email: string
  mobile: string | null
  department_id: string
  department: string
  location: string
  reporting_manager_id: string | null
  date_of_joining: string
  /** MM-DD */
  birthday: string
  employment_type: string
}

/** GET /organization/departments → ListResponse<Department> */
export interface Department {
  id: string
  name: string
  parent_name: string | null
  head_id: string | null
  member_count: number
}

/** GET /organization/announcements → ListResponse<Announcement> */
export interface Announcement {
  id: string
  title: string
  body: string
  author_name: string
  created_at: string
  likes: number
  liked_by_me: boolean
  comments_count: number
}

export type FileScope = 'me' | 'role' | 'department' | 'organization'

/** GET /files → ListResponse<SharedFile> (every file visible to the user, tagged with where it was shared) */
export interface SharedFile extends FileItem {
  scope: FileScope
  folder: string
  shared_with: string
  updated_on: string
  download_url: string | null
}

/** GET /leave/requests (mine) and GET /leave/team → ListResponse<LeaveRequest> */
export interface LeaveRequest {
  id: string
  employee: EmployeeRef
  leave_type_id: string
  leave_type_name: string
  leave_type_code: string
  pay_type: 'Paid' | 'Unpaid'
  from_date: string
  to_date: string
  days: number
  session: 'full_day' | 'first_half' | 'second_half'
  reason: string | null
  status: RequestStatus
  requested_on: string
}

/** GET /leave/summary?year=yyyy */
export interface LeaveSummary {
  from_date: string
  to_date: string
  booked_days: number
  absent_days: number
}

/** GET /holidays → ListResponse<HolidayDetail> */
export interface HolidayDetail extends Holiday {
  location: string
  shift: string | null
  classification: string
}

export type HrLetterType = 'address_proof' | 'bonafide_letter' | 'experience_letter'

/** GET /hr-letters/types → ListResponse<HrLetterTypeConfig> (drives the tab, table columns and form) */
export interface HrLetterTypeConfig {
  key: HrLetterType
  name: string
  reasons: string[]
  asks_address_change: boolean
  show_department: boolean
  show_experience: boolean
}

/** GET /hr-letters/requests → ListResponse<HrLetterRequest> (all types; filter by letter_type) */
export interface HrLetterRequest {
  id: string
  letter_type: HrLetterType
  employee: EmployeeRef
  date_of_request: string
  reason: string
  /** Filled when reason is "Others". */
  other_reason: string | null
  /** Address proof only. */
  address_changed: boolean | null
  new_present_address: string | null
  status: RequestStatus
  is_draft: boolean
}

/** Audit fields Zoho shows on every form record. */
export interface RecordAudit {
  added_by: string
  added_time: string
  modified_by: string
  modified_time: string
}

/** GET /travel/requests → ListResponse<TravelRequest> */
export interface TravelRequest extends RecordAudit {
  id: string
  travel_id: string
  employee: EmployeeRef
  department: string | null
  place_of_visit: string | null
  departure_date: string | null
  arrival_date: string | null
  purpose: string | null
  duration_days: number | null
  is_billable: boolean | null
  customer_name: string | null
  status: RequestStatus
  is_draft: boolean
}

/** GET /travel/expenses → ListResponse<TravelExpense> */
export interface TravelExpense extends RecordAudit {
  id: string
  employee: EmployeeRef
  travel_id: string | null
  place_of_visit: string | null
  purpose: string | null
  status: RequestStatus
  is_draft: boolean
}

export type TaskPriority = 'low' | 'moderate' | 'high'
export type TaskStatus = 'open' | 'in_progress' | 'completed'

/** GET /tasks → ListResponse<Task> (tasks owned by or assigned by the user) */
export interface Task extends RecordAudit {
  id: string
  name: string
  description: string | null
  /** null = unassigned */
  owner: EmployeeRef | null
  assigned_by: EmployeeRef
  start_date: string | null
  due_date: string | null
  reminder_at: string | null
  priority: TaskPriority
  status: TaskStatus
}

export type ReportKey = 'career_history' | 'leave_balance' | 'early_late_checkin' | 'present_absent' | 'presence_hours' | 'distribution' | 'diversity'

/** GET /reports → ListResponse<ReportDefinition>; report data comes from the existing module endpoints. */
export interface ReportDefinition {
  key: ReportKey
  name: string
  category: string
  scope: 'my' | 'team'
  description: string
  is_favourite: boolean
}

export interface ChecklistItem {
  id: string
  title: string
  done: boolean
}

/** GET /checklists → ListResponse<Checklist>; `relation` splits Track vs Related Checklists */
export interface Checklist {
  id: string
  name: string
  related_to: string
  relation: 'assigned' | 'related'
  assigned_to: EmployeeRef
  due_date: string | null
  items: ChecklistItem[]
}

/** GET /exit/resignations → ListResponse<ResignationRequest> */
export interface ResignationRequest extends RecordAudit {
  id: string
  employee: EmployeeRef
  date_of_resignation: string | null
  reason: string | null
  /** Approval status */
  status: RequestStatus
  approver: string | null
  approval_time: string | null
  is_draft: boolean
}

export type ExitRatingKey = 'job_satisfaction' | 'roles' | 'pay' | 'benefits' | 'work_environment' | 'management'

/** GET /exit/interviews → ListResponse<ExitInterview> */
export interface ExitInterview extends RecordAudit {
  id: string
  employee: EmployeeRef
  primary_reason: string | null
  /** Filled when primary_reason is "Any other", else "NA". */
  other_reason: string | null
  stay_back: string | null
  /** 1–5 Likert scale, 5 being the highest. */
  ratings: Record<ExitRatingKey, number | null>
  would_recommend: boolean | null
  would_rejoin: boolean | null
  other_feedback: string | null
  notify_hr: boolean
  status: RequestStatus
  is_draft: boolean
}

/** GET /exit/interview-options */
export interface ExitInterviewOptions {
  company_name: string
  primary_reasons: string[]
}
