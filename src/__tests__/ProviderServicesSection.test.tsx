import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProviderServicesSection } from '../features/search/ProviderServicesSection'

const tags = [
  { tagId: 'wifi', name: 'Wi-Fi Setup', usageCount: 2, isBarrierefrei: false, minPrice: 22 },
  { tagId: 'a11y', name: 'Accessible help', usageCount: 1, isBarrierefrei: true, minPrice: 28 },
]

describe('<ProviderServicesSection />', () => {
  it('shows the service count heading', () => {
    render(<ProviderServicesSection serviceCount={4} topTags={tags} />)
    expect(screen.getByText('Offers 4 services')).toBeInTheDocument()
  })

  it('uses singular wording for one service', () => {
    render(<ProviderServicesSection serviceCount={1} topTags={tags} />)
    expect(screen.getByText('Offers 1 service')).toBeInTheDocument()
  })

  it('renders each tag name with its minimum price', () => {
    render(<ProviderServicesSection serviceCount={2} topTags={tags} />)
    expect(screen.getByText('Wi-Fi Setup • 22€')).toBeInTheDocument()
    expect(screen.getByText('Accessible help • 28€')).toBeInTheDocument()
  })

  it('colors accessible tags with the plum/blush palette', () => {
    render(<ProviderServicesSection serviceCount={2} topTags={tags} />)
    expect(screen.getByText('Accessible help • 28€')).toHaveClass('bg-blush', 'text-plum')
  })

  it('colors regular tags with the forest/mint palette', () => {
    render(<ProviderServicesSection serviceCount={2} topTags={tags} />)
    expect(screen.getByText('Wi-Fi Setup • 22€')).toHaveClass('bg-mint', 'text-forest')
  })
})
