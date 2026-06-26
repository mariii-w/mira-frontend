import { z } from 'zod'

export const browseServicesSearchSchema = z.object({
  q: z.string().catch(''),
  city: z.string().catch(''),
  radiusKm: z.coerce.number().int().min(1).max(100).optional().catch(undefined),
  tagIds: z.array(z.string().uuid()).catch([]),
  minPrice: z.coerce.number().min(0).optional().catch(undefined),
  maxPrice: z.coerce.number().min(0).optional().catch(undefined),
  from: z.string().min(1).optional().catch(undefined),
})

export type BrowseServicesSearch = z.infer<typeof browseServicesSearchSchema>

export const browseUsersSearchSchema = z.object({
  q: z.string().catch(''),
  from: z.string().min(1).optional().catch(undefined),
  role: z.enum(['everyone', 'providers', 'consumers']).catch('everyone'),
})

export type BrowseUsersSearch = z.infer<typeof browseUsersSearchSchema>
export type UserRoleFilter = BrowseUsersSearch['role']
