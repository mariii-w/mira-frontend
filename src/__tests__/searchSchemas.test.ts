import { describe, expect, it } from 'vitest'
import {
  browseServicesSearchSchema,
  browseUsersSearchSchema,
} from '../components/search/searchSchemas'

describe('search cursor validation', () => {
  it.each([
    ['services', browseServicesSearchSchema],
    ['users', browseUsersSearchSchema],
  ])('preserves an opaque cursor for %s search', (_name, schema) => {
    expect(schema.parse({ from: 'cursor-abc' }).from).toBe('cursor-abc')
  })

  it.each([
    ['services', browseServicesSearchSchema],
    ['users', browseUsersSearchSchema],
  ])('drops an empty cursor for %s search', (_name, schema) => {
    expect(schema.parse({ from: '' }).from).toBeUndefined()
  })
})
