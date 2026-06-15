import { ArrowRight } from 'lucide-react'

interface UserCardProps {
  userId: string
  username: string
  firstName: string | null
  lastName: string | null
  userType: string | null
  bio?: string
  selfSummary?: string
  profileMediaUrl?: string
}

function getInitials(firstName: string | null, lastName: string | null, username: string): string {
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase()
  if (firstName) return firstName[0].toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

export function UserCard({
  userId,
  username,
  firstName,
  lastName,
  userType,
  bio,
  selfSummary,
  profileMediaUrl,
}: UserCardProps) {
  const isProvider = userType === 'PROVIDER'
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || username
  const initials = getInitials(firstName, lastName, username)

  const avatarBg = isProvider ? 'bg-primary' : 'bg-green-500'
  const badgeBg = isProvider ? 'bg-primary text-primary-foreground' : 'bg-green-500 text-white'

  return (
    <div className="bg-linen rounded-2xl flex flex-col p-3 gap-3 border border-border w-full">
      <div className="flex gap-3">
        <div className="shrink-0">
          {profileMediaUrl ? (
            <img
              src={profileMediaUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className={`w-16 h-16 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-lg select-none`}>
              {initials}
            </div>
          )}
        </div>

        <div className="grid gap-2 flex-1 min-w-0">
          <div className="flex gap-4 items-start">
            <div className="min-w-0">
              <h2 className="text-h2">{displayName}</h2>
              <p className="text-small text-muted">@{username}</p>
            </div>
            <span className={`shrink-0 ml-auto text-label font-medium px-2.5 py-0.5 rounded-full ${badgeBg}`}>
              {isProvider ? 'Provider' : 'User'}
            </span>
          </div>

          {selfSummary && (
            <p className="text-small text-muted italic">{selfSummary}</p>
          )}

          {bio && (
            <p className="text-small text-foreground line-clamp-2">{bio}</p>
          )}

          <div className="flex items-center justify-end">
            <a
              href={`#profile-${userId}`}
              className="relative inline-flex items-center justify-center gap-2 font-medium rounded-full cursor-pointer transition-colors duration-150 h-11 px-5 text-body bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover [&_svg]:size-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            >
              View profile
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
