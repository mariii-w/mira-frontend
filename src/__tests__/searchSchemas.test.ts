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

describe('users role validation', () => {
  it('defaults to everyone', () => {
    expect(browseUsersSearchSchema.parse({}).role).toBe('everyone')
  })

  it.each(['providers', 'consumers'] as const)('accepts %s', (role) => {
    expect(browseUsersSearchSchema.parse({ role }).role).toBe(role)
  })

  it('falls back to everyone for an invalid role', () => {
    expect(browseUsersSearchSchema.parse({ role: 'admins' }).role).toBe('everyone')
  })
})
