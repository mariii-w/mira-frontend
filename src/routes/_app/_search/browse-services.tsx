import { createFileRoute } from '@tanstack/react-router'
import { SearchServicesPage } from '../../../components/features/search/SearchServicesPage'
import { browseServicesSearchSchema } from '../../../components/features/search/searchSchemas'

export const Route = createFileRoute('/_app/_search/browse-services')({
  validateSearch: browseServicesSearchSchema,
  component: SearchServicesPage,
})
