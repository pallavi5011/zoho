import {
  CalendarCheck,
  ChartPie,
  ClipboardCheck,
  DoorOpen,
  Folder,
  House,
  Plane,
  Star,
  Umbrella,
  type LucideIcon,
} from 'lucide-react'

export interface TabItem {
  to: string
  label: string
}

export interface ModuleItem extends TabItem {
  icon: LucideIcon
}

export const sidebarModules: ModuleItem[] = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/time-off', label: 'Time Off', icon: Umbrella },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/files', label: 'Files', icon: Folder },
  { to: '/hr-letters', label: 'HR Letters', icon: Star },
  { to: '/travel', label: 'Travel', icon: Plane },
]

export const reportsModule: ModuleItem = { to: '/reports', label: 'Reports', icon: ChartPie }

/**
 * Services that share the sidebar's last slot, as in Zoho: the one in use (or used last)
 * sits above "More", the rest are listed in the More panel. The first is shown by default.
 */
export const moreServices: ModuleItem[] = [
  { to: '/tasks', label: 'Tasks', icon: ClipboardCheck },
  { to: '/exit-management', label: 'Exit management', icon: DoorOpen },
]

/* ---- Home ---- */

export const homeTabs: TabItem[] = [
  { to: '/home/myspace', label: 'My Space' },
  { to: '/home/team', label: 'Team' },
  { to: '/home/organization', label: 'Organization' },
]

export const mySpaceTabs: TabItem[] = [
  { to: '/home/myspace/overview', label: 'Overview' },
  { to: '/home/myspace/dashboard', label: 'Dashboard' },
  { to: '/home/myspace/calendar', label: 'Calendar' },
  { to: '/home/myspace/delegation', label: 'Delegation' },
]

export const overviewTabs: TabItem[] = [
  { to: '/home/myspace/overview/activities', label: 'Activities' },
  { to: '/home/myspace/overview/feeds', label: 'Feeds' },
  { to: '/home/myspace/overview/profile', label: 'Profile' },
  { to: '/home/myspace/overview/approvals', label: 'Approvals' },
  { to: '/home/myspace/overview/leave', label: 'Leave' },
  { to: '/home/myspace/overview/attendance', label: 'Attendance' },
  { to: '/home/myspace/overview/files', label: 'Files' },
  { to: '/home/myspace/overview/career-history', label: 'Career History' },
  { to: '/home/myspace/overview/related-data', label: 'Related Data' },
]

export const teamTabs: TabItem[] = [
  { to: '/home/team/team-space', label: 'Team Space' },
  { to: '/home/team/department', label: 'Department' },
  { to: '/home/team/peers', label: 'Peers' },
  { to: '/home/team/approvals', label: 'Approvals' },
]

export const organizationTabs: TabItem[] = [
  { to: '/home/organization/overview', label: 'Overview' },
  { to: '/home/organization/announcements', label: 'Announcements' },
  { to: '/home/organization/policies', label: 'Policies' },
  { to: '/home/organization/employee-tree', label: 'Employee Tree' },
  { to: '/home/organization/employee-list', label: 'Employee List' },
  { to: '/home/organization/department-tree', label: 'Department Tree' },
  { to: '/home/organization/department-directory', label: 'Department Directory' },
  { to: '/home/organization/birthday-folks', label: 'Birthday Folks' },
  { to: '/home/organization/new-hires', label: 'New Hires' },
]

/* ---- Time Off ---- */

export const timeOffTabs: TabItem[] = [
  { to: '/time-off/my-data', label: 'My Data' },
  { to: '/time-off/team', label: 'Team' },
  { to: '/time-off/holidays', label: 'Holidays' },
]

export const myDataTabs: TabItem[] = [
  { to: '/time-off/my-data/summary', label: 'Leave Summary' },
  { to: '/time-off/my-data/requests', label: 'Leave Requests' },
]

/* ---- Attendance ---- */

export const attendanceTabs: TabItem[] = [
  { to: '/attendance/my-data', label: 'My Data' },
  { to: '/attendance/team', label: 'Team' },
]

export const attendanceMyDataTabs: TabItem[] = [
  { to: '/attendance/my-data/summary', label: 'Attendance Summary' },
  { to: '/attendance/my-data/regularization', label: 'Regularization' },
]

export const attendanceTeamTabs: TabItem[] = [{ to: '/attendance/team/members', label: 'Team Members' }]

/* ---- Files ---- */

export const filesTabs: TabItem[] = [
  { to: '/files/my-files', label: 'My Files' },
  { to: '/files/team', label: 'Team' },
  { to: '/files/organization', label: 'Organization' },
]

export const myFilesTabs: TabItem[] = [
  { to: '/files/my-files/shared-with-me', label: 'Shared with Me' },
  { to: '/files/my-files/shared-with-my-role', label: 'Shared with My Role' },
]

export const teamFilesTabs: TabItem[] = [{ to: '/files/team/department', label: 'Department Files' }]

/* ---- HR Letters ---- */

export const hrLettersTabs: TabItem[] = [
  { to: '/hr-letters/address-proof', label: 'Address Proof' },
  { to: '/hr-letters/bonafide-letter', label: 'Bonafide Letter' },
  { to: '/hr-letters/experience-letter', label: 'Experience Letter' },
]

/* ---- Travel ---- */

export const travelTabs: TabItem[] = [
  { to: '/travel/requests', label: 'Travel Request' },
  { to: '/travel/expenses', label: 'Travel Expense' },
]

/* ---- Tasks ---- */

export const tasksModuleTabs: TabItem[] = [
  { to: '/tasks/tasks', label: 'Tasks' },
  { to: '/tasks/checklists', label: 'Checklists' },
]

export const taskTabs: TabItem[] = [
  { to: '/tasks/tasks/my-tasks', label: 'My Tasks' },
  { to: '/tasks/tasks/track-tasks', label: 'Track Tasks' },
  { to: '/tasks/tasks/form-view', label: 'Form View' },
]

export const checklistTabs: TabItem[] = [
  { to: '/tasks/checklists/track', label: 'Track Checklists' },
  { to: '/tasks/checklists/related', label: 'Related Checklists' },
]

/* ---- Reports ---- */

export const reportsTabs: TabItem[] = [
  { to: '/reports/my', label: 'My Reports' },
  { to: '/reports/team', label: 'Team Reports' },
]

/* ---- Exit management ---- */

export const exitTabs: TabItem[] = [
  { to: '/exit-management/resignation', label: 'Resignation Request' },
  { to: '/exit-management/exit-interview', label: 'Exit Interview' },
]

/** Dark top-bar tabs per module; modules without an entry show their name instead. */
export const moduleTabs: Record<string, TabItem[]> = {
  '/home': homeTabs,
  '/time-off': timeOffTabs,
  '/attendance': attendanceTabs,
  '/files': filesTabs,
  '/hr-letters': hrLettersTabs,
  '/travel': travelTabs,
  '/tasks': tasksModuleTabs,
  '/reports': reportsTabs,
  '/exit-management': exitTabs,
}
