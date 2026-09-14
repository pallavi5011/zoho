import { FilesPage } from '@/features/files/SharedFilesView'

/** Home → Organization → Policies shows the same list as Files → Shared with Me. */
export function PoliciesPage() {
  return <FilesPage scope="me" />
}
