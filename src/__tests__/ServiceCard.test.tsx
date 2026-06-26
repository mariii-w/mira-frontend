import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { computeAccessibleDescription } from 'dom-accessibility-api'
import { describe, expect, it, vi } from 'vitest'
import { ServiceCard } from '../components/features/listings/ServiceCard'
import type { ServiceTag } from '../api/model'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode; to: string }) => (
    <a href={to} className={className} {...props}>{children}</a>
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
    const viewLink = screen.getByRole('link', { name: `View listing for ${baseProps.label}` })
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

  it('puts the full listing context on the card group, without exposing a duplicate article', () => {
    render(<ServiceCard {...baseProps} variant="compact" />)
    expect(screen.queryByRole('article')).not.toBeInTheDocument()

    const group = screen.getByRole('group', { name: baseProps.label })
    const description = computeAccessibleDescription(group)
    expect(description).toContain('by Lena Hoffmann')
    expect(description).toContain('Berlin')
    expect(description).toContain('from 28€/hr')
    expect(description).toContain('Regular home cleaning for kitchens, bathrooms, and living spaces.')
  })
})

describe('<ServiceCard /> (default)', () => {
  it('puts the full listing context on the card group, without exposing a duplicate article', () => {
    render(<ServiceCard {...baseProps} />)
    expect(screen.queryByRole('article')).not.toBeInTheDocument()

    const group = screen.getByRole('group', { name: baseProps.label })
    const description = computeAccessibleDescription(group)
    expect(description).toContain('by Lena Hoffmann')
    expect(description).toContain('Berlin')
    expect(description).toContain('28€ per hour')
    expect(description).toContain('Regular home cleaning for kitchens, bathrooms, and living spaces.')
  })

  it('renders "View service" without an underline', () => {
    render(<ServiceCard {...baseProps} />)
    const viewLink = screen.getByRole('link', { name: `View service for ${baseProps.label}` })
    expect(viewLink).toHaveClass('no-underline')
  })
})
