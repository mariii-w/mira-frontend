import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/Button'
import { AvatarIcon } from '../ui/AvatarIcon'
import { Row, LogoutRow, getAccountLinks } from './UserMenu'
import { signOut } from '../../../stores/auth'

interface MobileNavDrawerProps {
  navLinks: { label: string; to: string }[]
  firstName: string
  lastName: string
  isLoggedIn: boolean
  isProvider?: boolean
  pictureUrl?: string
}

export function MobileNavDrawer({
  navLinks,
  firstName,
  lastName,
  isLoggedIn,
  isProvider,
  pictureUrl,
}: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const fullName = `${firstName} ${lastName}`.trim()
  const navRoutes = new Set(navLinks.map((link) => link.to))
  const accountLinks = getAccountLinks(isProvider).filter((link) => !navRoutes.has(link.to))

  async function handleLogout() {
    await signOut()
    setOpen(false)
    navigate({ to: '/' })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="icon"
          aria-label="Open menu"
          className="flex lg:hidden border-cream/30 text-cream hover:bg-cream/10"
        >
          <Menu />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-background shadow-xl overflow-y-auto p-4 flex flex-col gap-2"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="flex justify-end">
            <Dialog.Close asChild>
              <Button variant="icon" aria-label="Close menu">
                <X />
              </Button>
            </Dialog.Close>
          </div>

          {isLoggedIn && (
            <div className="flex items-center gap-3 p-3">
              <AvatarIcon firstName={firstName} lastName={lastName} picture={pictureUrl} size={40} />
              <span className="text-body font-bold text-foreground">{fullName}</span>
            </div>
          )}

          <nav aria-label="Main navigation">
            <ul className="flex flex-col gap-1 list-none m-0 p-0">
              {navLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    search={{} as never}
                    onClick={() => setOpen(false)}
                    className="block p-3 rounded-lg text-body font-semibold text-foreground hover:bg-linen transition-colors no-underline"
                    activeProps={{ className: 'text-primary' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/"
                  hash="how-it-works"
                  onClick={() => setOpen(false)}
                  className="block p-3 rounded-lg text-body font-semibold text-foreground hover:bg-linen transition-colors no-underline"
                >
                  How it works
                </Link>
              </li>
            </ul>
          </nav>

          {isLoggedIn && (
            <>
              <div className="my-1 h-px bg-border/30" />
              {accountLinks.map((link) => (
                <Row key={link.to} {...link} />
              ))}
              <div className="my-1 h-px bg-border/30" />
              <LogoutRow onLogout={handleLogout} />
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
