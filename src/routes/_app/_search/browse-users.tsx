import { createFileRoute } from '@tanstack/react-router'
import { SearchUsersPage } from '../../../features/search/SearchUsersPage'
import { browseUsersSearchSchema } from '../../../features/search/searchSchemas'

export const Route = createFileRoute('/_app/_search/browse-users')({
  validateSearch: browseUsersSearchSchema,
  component: SearchUsersPage,
})
