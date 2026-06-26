import * as Popover from '../ui/Popover'
import { ChevronDown, LogOut, CalendarCheck, LayoutList, UserRound, BadgeCheck } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/Button'
import { AvatarIcon } from '../ui/AvatarIcon'
import { signOut, useAuthStore } from '../../../stores/auth'

interface UserMenuProps {
    firstName: string
    lastName: string
    isProvider?: boolean
    pictureUrl?: string
}

export function UserMenu({ firstName, lastName, isProvider, pictureUrl }: UserMenuProps) {
    const navigate = useNavigate()
    const displayName = lastName ? `${firstName} ${lastName[0]}.` : firstName

    const user = useAuthStore((s) => s.user)
    const userId = user?.userId
    const profilePath = userId ? `/profile/${userId}` : '/'

    async function handleLogout() {
        await signOut()
        navigate({ to: '/' })
    }

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <Button
                    variant="userBadge"
                    leadingIcon={<AvatarIcon firstName={firstName} lastName={lastName} picture={pictureUrl} size={32} />}
                    trailingIcon={<ChevronDown size={16} />}
                >
                    {displayName}
                </Button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    aria-label="User menu"
                    align="end"
                    sideOffset={8}
                    className="z-50 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg"
                >
                    {getAccountLinks(isProvider, profilePath).map((link) => (
                        <Row key={link.to} {...link} />
                    ))}

                    <div className="my-1 h-px bg-border/30" />

                    <LogoutRow onLogout={handleLogout} />
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

export function Row({ icon, title, to }: RowProps) {
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

// eslint-disable-next-line react-refresh/only-export-components
export function getAccountLinks(isProvider?: boolean, profilePath = '/'): RowProps[] {
    return [
        { icon: <UserRound size={15} />, title: 'View Profile', to: profilePath },
        { icon: <CalendarCheck size={15} />, title: 'My Bookings', to: '/my-bookings' },
        ...(isProvider
            ? [{ icon: <LayoutList size={15} />, title: 'My Services', to: '/my-listings' }]
            : []),
        ...(isProvider
            ? [{ icon: <BadgeCheck size={15} />, title: 'My Credentials', to: '/my-credentials' }]
            : []),
    ]
}

export function LogoutRow({ onLogout }: { onLogout: () => void }) {
    return (
        <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-small font-semibold text-foreground hover:bg-linen transition-colors cursor-pointer"
        >
            <LogOut size={15} className="text-muted shrink-0" />
            Logout
        </button>
    )
}