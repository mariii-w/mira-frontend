import { createFileRoute } from '@tanstack/react-router'
import { SearchUsersPage } from '../../components/search/pages/SearchUsersPage.tsx'
import { browseUsersSearchSchema } from '../../components/search/searchSchemas'

export const Route = createFileRoute('/_search/browse-users')({
  validateSearch: browseUsersSearchSchema,
  component: SearchUsersPage,
})
