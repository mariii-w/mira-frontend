import * as Popover from './Popover'
import { ChevronDown, LogOut, CalendarCheck, LayoutList, UserRound } from 'lucide-react'
import { Button } from './Button'
import { AvatarIcon } from './AvatarIcon'
import { useNavigate } from '@tanstack/react-router'

interface UserMenuProps {
  firstName: string
  lastName: string
  isProvider?: boolean
  onLogout?: () => void
}

export function UserMenu({ firstName, lastName, isProvider, onLogout }: UserMenuProps) {
  const navigate = useNavigate()
  const displayName = `${firstName} ${lastName[0]}.`

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="userBadge"
          leadingIcon={<AvatarIcon firstName={firstName} lastName={lastName} />}
          trailingIcon={<ChevronDown />}
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
          <Row icon={<UserRound size={15} />} title="View Profile" to="/profile" />
          <Row icon={<CalendarCheck size={15} />} title="My Bookings" to="/bookings" />
          {isProvider && (
            <Row icon={<LayoutList size={15} />} title="Meine Anzeigen" to="/listings" />
          )}
          <div className="my-1 h-px bg-border/30" />
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-body font-bold text-foreground hover:bg-muted/10 transition-colors"
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
    
      <a href={to}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/10 transition-colors no-underline"
    >
      <span className="text-muted shrink-0">{icon}</span>
      <span className="text-body font-bold text-foreground">{title}</span>
    </a>
  )
}