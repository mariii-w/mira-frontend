import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UserCard } from '../components/UserCard'

const baseProps = {
  userId: 'user-1',
  username: 'pat.s',
  firstName: 'Patrick',
  lastName: 'Smith',
  bio: 'Friendly help with everyday tasks.',
}

describe('<UserCard /> role palettes', () => {
  it('uses the violet Users palette for providers', () => {
    render(<UserCard {...baseProps} userType="PROVIDER" />)

    expect(screen.getByText('PS')).toHaveClass('bg-accent')
    expect(screen.getByText('Provider')).toHaveClass('bg-blush', 'text-accent')
    expect(screen.getByRole('link', { name: /view profile/i })).toHaveClass('bg-accent')
  })

  it('uses the green palette for consumers', () => {
    render(<UserCard {...baseProps} userType="CUSTOMER" />)

    expect(screen.getByText('PS')).toHaveClass('bg-forest')
    expect(screen.getByText('Consumer')).toHaveClass('bg-mint', 'text-forest')
    expect(screen.getByRole('link', { name: /view profile/i })).toHaveClass('bg-forest')
  })
})
