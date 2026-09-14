import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { ComingSoonPage } from '@/components/ComingSoon'
import { AppLayout } from '@/layouts/AppLayout'
import { SubNavLayout } from '@/layouts/SubNavLayout'
import {
  attendanceMyDataTabs,
  attendanceTeamTabs,
  checklistTabs,
  myDataTabs,
  myFilesTabs,
  mySpaceTabs,
  organizationTabs,
  taskTabs,
  teamFilesTabs,
  teamTabs,
} from '@/navigation'

const redirect = (to: string) => <Navigate to={to} replace />
const OVERVIEW = '/home/myspace/overview/activities'
const LEAVE_SUMMARY = '/time-off/my-data/summary'
const ATTENDANCE_SUMMARY = '/attendance/my-data/summary'
const SHARED_WITH_ME = '/files/my-files/shared-with-me'

/*
 * Every page is loaded on demand (its own chunk), so opening one module
 * doesn't download the code for all the others.
 */
const catchAll: RouteObject = { path: '*', element: <ComingSoonPage /> }

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: redirect(OVERVIEW) },

      /* ---- Home ---- */
      { path: 'home', element: redirect(OVERVIEW) },
      {
        path: 'home/myspace',
        element: <SubNavLayout tabs={mySpaceTabs} />,
        children: [
          { index: true, element: redirect(OVERVIEW) },
          {
            path: 'overview',
            lazy: () => import('@/features/home/HomePage').then((m) => ({ Component: m.HomePage })),
            children: [
              { index: true, element: redirect(OVERVIEW) },
              { path: 'activities', lazy: () => import('@/features/home/overview/ActivitiesTab').then((m) => ({ Component: m.ActivitiesTab })) },
              { path: 'feeds', lazy: () => import('@/features/home/overview/FeedsTab').then((m) => ({ Component: m.FeedsTab })) },
              { path: 'profile', lazy: () => import('@/features/home/overview/ProfileTab').then((m) => ({ Component: m.ProfileTab })) },
              { path: 'approvals', lazy: () => import('@/features/home/overview/ApprovalsTab').then((m) => ({ Component: m.ApprovalsTab })) },
              { path: 'leave', lazy: () => import('@/features/home/overview/LeaveTab').then((m) => ({ Component: m.LeaveTab })) },
              { path: 'attendance', lazy: () => import('@/features/home/overview/AttendanceTab').then((m) => ({ Component: m.AttendanceTab })) },
              { path: 'files', lazy: () => import('@/features/home/overview/FilesTab').then((m) => ({ Component: m.FilesTab })) },
              { path: 'career-history', lazy: () => import('@/features/home/overview/CareerHistoryTab').then((m) => ({ Component: m.CareerHistoryTab })) },
              { path: 'related-data', lazy: () => import('@/features/home/overview/RelatedDataTab').then((m) => ({ Component: m.RelatedDataTab })) },
            ],
          },
          { path: 'dashboard', lazy: () => import('@/features/home/myspace/DashboardPage').then((m) => ({ Component: m.DashboardPage })) },
          { path: 'calendar', lazy: () => import('@/features/home/myspace/CalendarPage').then((m) => ({ Component: m.CalendarPage })) },
          { path: 'delegation', lazy: () => import('@/features/home/myspace/DelegationPage').then((m) => ({ Component: m.DelegationPage })) },
        ],
      },
      {
        path: 'home/team',
        element: <SubNavLayout tabs={teamTabs} />,
        children: [
          { index: true, element: redirect('/home/team/team-space') },
          { path: 'team-space', lazy: () => import('@/features/home/team/TeamSpacePage').then((m) => ({ Component: m.TeamSpacePage })) },
          { path: 'department', lazy: () => import('@/features/home/team/TeamDepartmentPage').then((m) => ({ Component: m.TeamDepartmentPage })) },
          { path: 'peers', lazy: () => import('@/features/home/team/TeamPeersPage').then((m) => ({ Component: m.TeamPeersPage })) },
          { path: 'approvals', lazy: () => import('@/features/home/team/TeamApprovalsPage').then((m) => ({ Component: m.TeamApprovalsPage })) },
          catchAll,
        ],
      },
      {
        path: 'home/organization',
        element: <SubNavLayout tabs={organizationTabs} />,
        children: [
          { index: true, element: redirect('/home/organization/overview') },
          { path: 'overview', lazy: () => import('@/features/home/organization/OrganizationOverviewPage').then((m) => ({ Component: m.OrganizationOverviewPage })) },
          { path: 'announcements', lazy: () => import('@/features/home/organization/AnnouncementsPage').then((m) => ({ Component: m.AnnouncementsPage })) },
          { path: 'policies', lazy: () => import('@/features/home/organization/PoliciesPage').then((m) => ({ Component: m.PoliciesPage })) },
          { path: 'employee-tree', lazy: () => import('@/features/home/organization/EmployeeTreePage').then((m) => ({ Component: m.EmployeeTreePage })) },
          { path: 'employee-list', lazy: () => import('@/features/home/organization/EmployeeListPage').then((m) => ({ Component: m.EmployeeListPage })) },
          { path: 'department-tree', lazy: () => import('@/features/home/organization/DepartmentTreePage').then((m) => ({ Component: m.DepartmentTreePage })) },
          { path: 'department-directory', lazy: () => import('@/features/home/organization/DepartmentDirectoryPage').then((m) => ({ Component: m.DepartmentDirectoryPage })) },
          { path: 'birthday-folks', lazy: () => import('@/features/home/organization/BirthdayFolksPage').then((m) => ({ Component: m.BirthdayFolksPage })) },
          { path: 'new-hires', lazy: () => import('@/features/home/organization/NewHiresPage').then((m) => ({ Component: m.NewHiresPage })) },
          catchAll,
        ],
      },

      /* ---- Time Off ---- */
      { path: 'time-off', element: redirect(LEAVE_SUMMARY) },
      {
        path: 'time-off/my-data',
        element: <SubNavLayout tabs={myDataTabs} />,
        children: [
          { index: true, element: redirect(LEAVE_SUMMARY) },
          { path: 'summary', lazy: () => import('@/features/time-off/LeaveSummaryPage').then((m) => ({ Component: m.LeaveSummaryPage })) },
          { path: 'requests', lazy: () => import('@/features/time-off/LeaveRequestsPage').then((m) => ({ Component: m.LeaveRequestsPage })) },
        ],
      },
      { path: 'time-off/team', lazy: () => import('@/features/time-off/TeamLeavePage').then((m) => ({ Component: m.TeamLeavePage })) },
      { path: 'time-off/holidays', lazy: () => import('@/features/time-off/HolidaysPage').then((m) => ({ Component: m.HolidaysPage })) },

      /* ---- Attendance ---- */
      { path: 'attendance', element: redirect(ATTENDANCE_SUMMARY) },
      {
        path: 'attendance/my-data',
        element: <SubNavLayout tabs={attendanceMyDataTabs} />,
        children: [
          { index: true, element: redirect(ATTENDANCE_SUMMARY) },
          { path: 'summary', lazy: () => import('@/features/attendance/AttendanceSummaryPage').then((m) => ({ Component: m.AttendanceSummaryPage })) },
          { path: 'regularization', lazy: () => import('@/features/attendance/RegularizationPage').then((m) => ({ Component: m.RegularizationPage })) },
        ],
      },
      {
        path: 'attendance/team',
        element: <SubNavLayout tabs={attendanceTeamTabs} />,
        children: [
          { index: true, element: redirect('/attendance/team/members') },
          { path: 'members', lazy: () => import('@/features/attendance/TeamMembersPage').then((m) => ({ Component: m.TeamMembersPage })) },
        ],
      },

      /* ---- Files ---- */
      { path: 'files', element: redirect(SHARED_WITH_ME) },
      {
        path: 'files/my-files',
        element: <SubNavLayout tabs={myFilesTabs} />,
        children: [
          { index: true, element: redirect(SHARED_WITH_ME) },
          { path: 'shared-with-me', lazy: () => import('@/features/files/SharedFilesView').then((m) => ({ element: <m.FilesPage scope="me" /> })) },
          { path: 'shared-with-my-role', lazy: () => import('@/features/files/SharedFilesView').then((m) => ({ element: <m.FilesPage scope="role" /> })) },
        ],
      },
      {
        path: 'files/team',
        element: <SubNavLayout tabs={teamFilesTabs} />,
        children: [
          { index: true, element: redirect('/files/team/department') },
          { path: 'department', lazy: () => import('@/features/files/SharedFilesView').then((m) => ({ element: <m.FilesPage scope="department" /> })) },
        ],
      },
      { path: 'files/organization', lazy: () => import('@/features/files/SharedFilesView').then((m) => ({ element: <m.FilesPage scope="organization" /> })) },

      /* ---- HR Letters ---- */
      { path: 'hr-letters', element: redirect('/hr-letters/address-proof') },
      {
        path: 'hr-letters/address-proof',
        lazy: () => import('@/features/hr-letters/HrLetterPage').then((m) => ({ element: <m.HrLetterPage key="address_proof" type="address_proof" /> })),
      },
      {
        path: 'hr-letters/bonafide-letter',
        lazy: () => import('@/features/hr-letters/HrLetterPage').then((m) => ({ element: <m.HrLetterPage key="bonafide_letter" type="bonafide_letter" /> })),
      },
      {
        path: 'hr-letters/experience-letter',
        lazy: () => import('@/features/hr-letters/HrLetterPage').then((m) => ({ element: <m.HrLetterPage key="experience_letter" type="experience_letter" /> })),
      },

      /* ---- Travel ---- */
      { path: 'travel', element: redirect('/travel/requests') },
      { path: 'travel/requests', lazy: () => import('@/features/travel/TravelRequestsPage').then((m) => ({ Component: m.TravelRequestsPage })) },
      { path: 'travel/expenses', lazy: () => import('@/features/travel/TravelExpensesPage').then((m) => ({ Component: m.TravelExpensesPage })) },

      /* ---- Tasks ---- */
      { path: 'tasks', element: redirect('/tasks/tasks/my-tasks') },
      {
        path: 'tasks/tasks',
        element: <SubNavLayout tabs={taskTabs} />,
        children: [
          { index: true, element: redirect('/tasks/tasks/my-tasks') },
          { path: 'my-tasks', lazy: () => import('@/features/tasks/TaskBoardPage').then((m) => ({ element: <m.TaskBoardPage key="mine" mode="mine" /> })) },
          { path: 'track-tasks', lazy: () => import('@/features/tasks/TaskBoardPage').then((m) => ({ element: <m.TaskBoardPage key="track" mode="track" /> })) },
          { path: 'form-view', lazy: () => import('@/features/tasks/TaskFormViewPage').then((m) => ({ Component: m.TaskFormViewPage })) },
        ],
      },
      {
        path: 'tasks/checklists',
        element: <SubNavLayout tabs={checklistTabs} />,
        children: [
          { index: true, element: redirect('/tasks/checklists/track') },
          { path: 'track', lazy: () => import('@/features/tasks/ChecklistsPage').then((m) => ({ element: <m.ChecklistsPage key="assigned" relation="assigned" /> })) },
          { path: 'related', lazy: () => import('@/features/tasks/ChecklistsPage').then((m) => ({ element: <m.ChecklistsPage key="related" relation="related" /> })) },
        ],
      },

      /* ---- Reports ---- */
      { path: 'reports', element: redirect('/reports/my') },
      { path: 'reports/my', lazy: () => import('@/features/reports/ReportsCatalogPage').then((m) => ({ element: <m.ReportsCatalogPage key="my" scope="my" /> })) },
      { path: 'reports/team', lazy: () => import('@/features/reports/ReportsCatalogPage').then((m) => ({ element: <m.ReportsCatalogPage key="team" scope="team" /> })) },
      { path: 'reports/:scope/:reportKey', lazy: () => import('@/features/reports/ReportViewPage').then((m) => ({ Component: m.ReportViewPage })) },

      /* ---- Exit management ---- */
      { path: 'exit-management', element: redirect('/exit-management/resignation') },
      { path: 'exit-management/resignation', lazy: () => import('@/features/exit/ResignationPage').then((m) => ({ Component: m.ResignationPage })) },
      { path: 'exit-management/exit-interview', lazy: () => import('@/features/exit/ExitInterviewPage').then((m) => ({ Component: m.ExitInterviewPage })) },

      catchAll,
    ],
  },
])
