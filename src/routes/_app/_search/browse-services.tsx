import { createFileRoute } from '@tanstack/react-router'
import { SearchServicesPage } from '../../../features/search/SearchServicesPage'
import { browseServicesSearchSchema } from '../../../features/search/searchSchemas'

export const Route = createFileRoute('/_app/_search/browse-services')({
  validateSearch: browseServicesSearchSchema,
  component: SearchServicesPage,
})
