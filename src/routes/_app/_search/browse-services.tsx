import { createFileRoute } from '@tanstack/react-router'
import { SearchServicesPage } from '../../../components/search/pages/SearchServicesPage.tsx'
import { browseServicesSearchSchema } from '../../../components/search/searchSchemas'

export const Route = createFileRoute('/_app/_search/browse-services')({
  validateSearch: browseServicesSearchSchema,
  component: SearchServicesPage,
})
