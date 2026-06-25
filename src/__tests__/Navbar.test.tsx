import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Navbar } from '../components/Navbar'
import { useAuthStore, type User } from '../stores/auth'

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({
      children,
      to,
      className,
      activeProps,
      inactiveProps,
      onClick,
    }: {
      children: ReactNode
      to: string
      className?: string
      activeProps?: { className?: string }
      inactiveProps?: { className?: string }
      onClick?: () => void
    }) => (
      <a href={to} className={className ?? inactiveProps?.className ?? activeProps?.className} onClick={onClick}>
        {children}
      </a>
    ),
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../api/mira', () => ({
  logout: vi.fn().mockResolvedValue({ status: 204, data: undefined }),
}))

const providerUser = {
  userId: 'user-1',
  username: 'mira',
  firstName: 'Mira',
  lastName: 'Muster',
  userType: 'PROVIDER',
  bio: null,
  simplifiedBio: null,
  selfSummary: null,
  accessibilityPreferences: [],
  profileMedia: null,
  registrationComplete: true,
  isPublic: true,
  privateAddress: null,
} as unknown as User

const consumerUser = { ...providerUser, userType: 'CONSUMER' } as unknown as User

afterEach(() => {
  useAuthStore.getState().clear()
})

describe('<Navbar />', () => {
  it('renders the hamburger trigger, closed, with no drawer in the document', () => {
    render(<Navbar />)
    const trigger = screen.getByRole('button', { name: /open menu/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the drawer and flips aria-expanded when the hamburger is clicked', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // Radix marks background content aria-hidden while the modal is open, so the
    // trigger itself drops out of the accessible tree — query with hidden:true to
    // confirm it's still in the DOM (just correctly inert) rather than unmounted.
    expect(screen.getByRole('button', { name: /open menu/i, hidden: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('logged out: drawer shows nav links but no account rows or logout', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByRole('link', { name: /browse services/i })).toBeInTheDocument()
    expect(dialog.getByRole('link', { name: /find users/i })).toBeInTheDocument()
    expect(dialog.getByRole('link', { name: /how it works/i })).toBeInTheDocument()
    // Calendar and Chat require an account, so logged-out visitors shouldn't see them.
    expect(dialog.queryByRole('link', { name: /calendar/i })).not.toBeInTheDocument()
    expect(dialog.queryByRole('link', { name: /chat/i })).not.toBeInTheDocument()
    expect(dialog.queryByRole('link', { name: /view profile/i })).not.toBeInTheDocument()
    expect(dialog.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument()
  })

  it('logged in: drawer shows Calendar and Chat links', () => {
    useAuthStore.getState().setUser(providerUser)
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByRole('link', { name: /calendar/i })).toBeInTheDocument()
    expect(dialog.getByRole('link', { name: /chat/i })).toBeInTheDocument()
  })

  it('logged out: Login stays in the header (not moved into the drawer) while it is open', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    // Still in the DOM behind the modal (correctly aria-hidden, not unmounted) —
    // confirms Login wasn't duplicated/moved into the drawer's markup.
    expect(screen.getByRole('button', { name: /^login$/i, hidden: true })).toBeInTheDocument()
  })

  it('logged in (provider): drawer shows account rows and logout, scoped to the dialog', () => {
    useAuthStore.getState().setUser(providerUser)
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByRole('link', { name: /view profile/i })).toBeInTheDocument()
    expect(dialog.getByRole('link', { name: /my bookings/i })).toBeInTheDocument()
    expect(dialog.getByRole('link', { name: /my services/i })).toBeInTheDocument()
    expect(dialog.getByRole('link', { name: /my credentials/i })).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('logged in (non-provider): drawer omits My Services and My Credentials', () => {
    useAuthStore.getState().setUser(consumerUser)
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.queryByRole('link', { name: /my services/i })).not.toBeInTheDocument()
    expect(dialog.queryByRole('link', { name: /my credentials/i })).not.toBeInTheDocument()
  })

  it('logged in: the drawer trigger does not duplicate the desktop user-menu trigger', () => {
    useAuthStore.getState().setUser(providerUser)
    render(<Navbar />)
    expect(screen.getAllByRole('button', { name: /mira m\./i })).toHaveLength(1)
  })

  it('drawer has an accessible name and a labeled navigation landmark for the nav links', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = screen.getByRole('dialog', { name: /menu/i })
    expect(within(dialog).getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
  })

  it('closes the drawer when the close button is clicked and returns focus to the trigger', async () => {
    render(<Navbar />)
    const trigger = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: /close menu/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    // Radix restores focus asynchronously after the close animation/microtask.
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('closes the drawer on Escape', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the drawer after clicking a nav link inside it', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: /browse services/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps the Accessibility trigger reachable regardless of auth state', () => {
    const { rerender } = render(<Navbar />)
    expect(screen.getByRole('button', { name: /accessibility/i })).toBeInTheDocument()

    act(() => {
      useAuthStore.getState().setUser(providerUser)
    })
    rerender(<Navbar />)
    expect(screen.getByRole('button', { name: /accessibility/i })).toBeInTheDocument()
  })
})
