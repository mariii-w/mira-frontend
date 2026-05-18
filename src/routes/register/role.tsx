import { createFileRoute } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { Search, Heart } from 'lucide-react'
import { useAuthStore } from '../../stores/auth'
import type { UserType } from '../../lib/patchUser'

export const Route = createFileRoute('/register/role')({
  component: RegisterRole,
})

// eslint-disable-next-line react-refresh/only-export-components
function RegisterRole() {
  const currentUserType = useAuthStore((s) => s.user?.userType ?? null)
  const [selected, setSelected] = useState<UserType | null>(currentUserType)

  return (
    <section className="flex flex-col gap-6" aria-labelledby="register-step-heading">
      <h2 id="register-step-heading" className="font-heading text-3xl font-bold text-foreground">
        How will you use Mira?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-labelledby="register-step-heading">
        <RoleCard
          icon={<Search aria-hidden="true" />}
          title="I need help"
          description="Find people to help with computers, phones, chores, tutoring and other."
          selected={selected === 'CUSTOMER'}
          onClick={() => setSelected('CUSTOMER')}
        />
        <RoleCard
          icon={<Heart aria-hidden="true" />}
          title="I can help"
          description="Offer services, set your own hours, and get paid for helping others."
          selected={selected === 'PROVIDER'}
          onClick={() => setSelected('PROVIDER')}
        />
      </div>

      <p className="text-small text-muted text-center">
        Click an option to continue →
      </p>
    </section>
  )
}

interface RoleCardProps {
  icon: ReactNode
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
function RoleCard({ icon, title, description, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={
        'flex flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-colors duration-150 cursor-pointer ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ' +
        (selected
          ? 'border-primary bg-mint'
          : 'border-border bg-surface hover:border-primary/40 hover:bg-mint/30')
      }
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:size-5">
        {icon}
      </span>
      <span className="font-bold text-body text-foreground">{title}</span>
      <span className="text-small text-muted">{description}</span>
    </button>
  )
}