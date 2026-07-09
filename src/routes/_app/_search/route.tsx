import { createFileRoute } from '@tanstack/react-router'
import { SearchRootPage } from '../../../components/features/search/SearchRootPage.tsx'

export const Route = createFileRoute('/_app/_search')({
  component: SearchRootPage,
})
