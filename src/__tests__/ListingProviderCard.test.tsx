import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ListingProviderCard } from '../components/ListingProviderCard'

const tags = [
  { tagId: 'tag-1', name: 'PC & Laptop', isBarrierefrei: false, isActive: true },
  { tagId: 'tag-2', name: 'Wheelchair accessible', isBarrierefrei: true, isActive: true },
]

describe('<ListingProviderCard />', () => {
  it('renders the author name, price, location, and tags', () => {
    render(
      <ListingProviderCard
        authorName="Klaus"
        authorSurname="Mueller"
        price={20}
        city="Berlin"
        tags={tags}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByText('Klaus M.')).toBeInTheDocument()
    expect(screen.getByText('20€')).toBeInTheDocument()
    expect(screen.getByText('Berlin')).toBeInTheDocument()
    expect(screen.getByText('PC & Laptop')).toBeInTheDocument()
    expect(screen.getByText('Wheelchair accessible')).toBeInTheDocument()
  })

  it('renders barrierefrei tags in accent and other tags in primary', () => {
    render(
      <ListingProviderCard
        authorName="Klaus"
        authorSurname="Mueller"
        price={20}
        city="Berlin"
        tags={tags}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByText('PC & Laptop').parentElement).toHaveClass('bg-primary')
    expect(screen.getByText('Wheelchair accessible').parentElement).toHaveClass('bg-accent')
  })

  it('shows a Verified badge', () => {
    render(
      <ListingProviderCard
        authorName="Klaus"
        authorSurname="Mueller"
        price={20}
        city="Berlin"
        tags={tags}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('shows "Today" when available today, otherwise "See calendar"', () => {
    const { rerender } = render(
      <ListingProviderCard
        authorName="Klaus"
        authorSurname="Mueller"
        price={20}
        city="Berlin"
        tags={tags}
        availableToday
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByText('Today')).toBeInTheDocument()

    rerender(
      <ListingProviderCard
        authorName="Klaus"
        authorSurname="Mueller"
        price={20}
        city="Berlin"
        tags={tags}
        availableToday={false}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByText('See calendar')).toBeInTheDocument()
  })

  it('calls onBookNow when Book Now is clicked', () => {
    const onBookNow = vi.fn()
    render(
      <ListingProviderCard
        authorName="Klaus"
        authorSurname="Mueller"
        price={20}
        city="Berlin"
        tags={tags}
        onBookNow={onBookNow}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }))
    expect(onBookNow).toHaveBeenCalledTimes(1)
  })

  it('renders an inert Message button', () => {
    render(
      <ListingProviderCard
        authorName="Klaus"
        authorSurname="Mueller"
        price={20}
        city="Berlin"
        tags={tags}
        onBookNow={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Message Klaus' })).toBeInTheDocument()
  })
})
