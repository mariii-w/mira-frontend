import { createFileRoute } from '@tanstack/react-router'
import { SearchRootPage } from '../../../features/search/SearchRootPage'

export const Route = createFileRoute('/_app/_search')({
  component: SearchRootPage,
})
