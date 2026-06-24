import { createFileRoute } from '@tanstack/react-router'
import { SearchRootPage } from '../../components/search/pages/SearchRootPage.tsx'

export const Route = createFileRoute('/_search')({
  component: SearchRootPage,
})
