import { describe, it, expect } from 'vitest'
import { mediaUrl } from '../lib/mediaUrl'

describe('mediaUrl', () => {
  it('prefixes a relative API path with the API origin', () => {
    expect(mediaUrl('/v1/listing-media/abc/content')).toBe(
      'http://localhost:8081/v1/listing-media/abc/content',
    )
  })

  it('prefixes a relative profile-picture path with the API origin', () => {
    expect(mediaUrl('/v1/public-profile-pictures/abc/content')).toBe(
      'http://localhost:8081/v1/public-profile-pictures/abc/content',
    )
  })

  it('passes absolute http(s) URLs through unchanged', () => {
    expect(mediaUrl('https://cdn.example.com/img.jpg')).toBe(
      'https://cdn.example.com/img.jpg',
    )
    expect(mediaUrl('http://cdn.example.com/img.jpg')).toBe(
      'http://cdn.example.com/img.jpg',
    )
  })
})
