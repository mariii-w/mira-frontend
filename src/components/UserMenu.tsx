import * as Popover from './Popover'
import { ChevronDown, LogOut, CalendarCheck, LayoutList, UserRound } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from './Button'
import { AvatarIcon } from './AvatarIcon'

interface UserMenuProps {
  firstName: string
  lastName: string
  isProvider?: boolean
  onLogout?: () => void
}

export function UserMenu({ firstName, lastName, isProvider, onLogout }: UserMenuProps) {
  const displayName = `${firstName} ${lastName[0]}.`

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="userBadge"
          leadingIcon={<AvatarIcon firstName={firstName} lastName={lastName} size={32} />}
          trailingIcon={<ChevronDown size={16} />}
        >
          {displayName}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg"
        >
          <Row icon={<UserRound size={15} />} title="View Profile" to="/" />
          <Row icon={<CalendarCheck size={15} />} title="My Bookings" to="/" />
          {isProvider && (
            <Row icon={<LayoutList size={15} />} title="Meine Anzeigen" to="/" />
          )}
          <div className="my-1 h-px bg-border/30" />
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-small font-semibold text-foreground hover:bg-linen transition-colors"
          >
            <LogOut size={15} className="text-muted shrink-0" />
            Logout
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

interface RowProps {
  icon: React.ReactNode
  title: string
  to: string
}

function Row({ icon, title, to }: RowProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-linen transition-colors no-underline"
    >
      <span className="text-muted shrink-0">{icon}</span>
      <span className="text-small font-semibold text-foreground">{title}</span>
    </Link>
  )
}