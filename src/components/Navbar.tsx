// src/components/Navbar.tsx
//
// Logged-out navbar variant
// Logged-in variant 

import { Link } from '@tanstack/react-router'
import { Logo } from './Logo'
import { Button } from './Button'
import { AccessibilityPanel } from './AccessibilityPanel'
import { UserMenu } from './UserMenu'
import { useAuthStore } from '../stores/auth'

const NAV_LINKS = [
  { label: 'Browse Services', to: '/' },
  { label: 'Find providers',  to: '/' },
] as const

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.firstName ?? ''
  const lastName = user?.lastName ?? ''
  const isProvider = user?.userType === 'PROVIDER'

  function handleGoogleLogin() {
    window.location.href = 'http://localhost:8080/auth/login/google'
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-charcoal">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link to="/" aria-label="Mira home" className="shrink-0">
          <Logo variant="primary" height={36} />
        </Link>

        {/* Nav links */}
        <ul className="flex items-center gap-6 list-none m-0 p-0">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                className="text-cream/80 text-small font-medium no-underline hover:text-cream transition-colors duration-150"
                activeProps={{ className: 'text-cream font-bold no-underline' }}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            
              <a href="#how-it-works"
              className="text-cream/80 text-small font-medium no-underline hover:text-cream transition-colors duration-150"
            >
              How it works
            </a>
          </li>
        </ul>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <AccessibilityPanel />

          {/* Divider */}
          <div className="h-6 w-px bg-cream/20" aria-hidden="true" />

          {user ? (
            <UserMenu
              firstName={firstName}
              lastName={lastName}
              isProvider={isProvider}
            />
          ) : (
            <>
              <Button
                variant="secondary"
                size="md"
                className="border-cream/30 text-cream hover:bg-cream/10"
                onClick={handleGoogleLogin}
              >
                Login
              </Button>
              <Button variant="primary" size="md" onClick={handleGoogleLogin}>
                Register
                </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}