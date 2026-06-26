import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ServiceCard } from '../features/listings/ServiceCard'
import type { ServiceTag } from '../api/model'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
  }: { children: React.ReactNode; to: string; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
}))

const tags: ServiceTag[] = [
  { tagId: 'wifi', name: 'Wi-Fi', isBarrierefrei: false, isActive: true },
]

const baseProps = {
  link: '/listings/1',
  location: 'Berlin',
  providerFirstName: 'Lena',
  providerLastName: 'Hoffmann',
  label: 'Friendly home cleaning in Berlin',
  description: 'Regular home cleaning for kitchens, bathrooms, and living spaces.',
  tags,
  hourRate: 28,
}

describe('<ServiceCard variant="compact" />', () => {
  it('renders a white, borderless container', () => {
    const { container } = render(<ServiceCard {...baseProps} variant="compact" />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('bg-surface')
    expect(root).not.toHaveClass('bg-linen')
    expect(root).not.toHaveClass('border')
    expect(root).not.toHaveClass('border-border')
  })

  it('renders "View Listing" without an underline', () => {
    render(<ServiceCard {...baseProps} variant="compact" />)
    const viewLink = screen.getByRole('link', { name: 'View Listing' })
    expect(viewLink).toHaveClass('no-underline')
  })

  it('always renders the avatar with the same green, regardless of provider name', () => {
    render(<ServiceCard {...baseProps} variant="compact" />)
    const avatarOne = screen.getByRole('img', { name: 'Lena Hoffmann avatar' })
    expect(avatarOne).toHaveClass('bg-forest')

    render(<ServiceCard {...baseProps} variant="compact" providerFirstName="Mira" providerLastName="Lilachofer" />)
    const avatarTwo = screen.getByRole('img', { name: 'Mira Lilachofer avatar' })
    expect(avatarTwo).toHaveClass('bg-forest')
  })
})

describe('<ServiceCard /> (default)', () => {
  it('renders "View service" without an underline', () => {
    render(<ServiceCard {...baseProps} />)
    const viewLink = screen.getByRole('link', { name: /view service/i })
    expect(viewLink).toHaveClass('no-underline')
  })
})
