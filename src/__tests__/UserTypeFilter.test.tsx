import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UserTypeFilter } from '../features/search/UserTypeFilter'

describe('<UserTypeFilter />', () => {
  it('shows current-page counts and marks Everyone as selected', () => {
    render(
      <UserTypeFilter selected="everyone" providerCount={2} consumerCount={3} onChange={vi.fn()} />,
    )

    expect(screen.getByRole('heading', { name: '5 users' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Filter users by role' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Everyone 5' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Providers 2' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Consumers 3' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('uses the selected role count and correct singular wording', () => {
    render(
      <UserTypeFilter selected="providers" providerCount={1} consumerCount={4} onChange={vi.fn()} />,
    )

    expect(screen.getByRole('heading', { name: '1 provider' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Providers 1' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onChange with the selected role', () => {
    const onChange = vi.fn()
    render(
      <UserTypeFilter selected="everyone" providerCount={2} consumerCount={3} onChange={onChange} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Consumers 3' }))

    expect(onChange).toHaveBeenCalledWith('consumers')
  })

  it('shows a pointer cursor for every role button', () => {
    render(
      <UserTypeFilter selected="everyone" providerCount={2} consumerCount={3} onChange={vi.fn()} />,
    )

    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveClass('cursor-pointer')
    }
  })
})
