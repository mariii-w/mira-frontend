import type { UserRoleFilter } from './searchSchemas'

type UserTypeFilterProps = {
  selected: UserRoleFilter
  providerCount: number
  consumerCount: number
  onChange: (role: UserRoleFilter) => void
}

const options: Array<{
  role: UserRoleFilter
  label: string
  singular: string
  dotClassName?: string
}> = [
  { role: 'everyone', label: 'Everyone', singular: 'user' },
  { role: 'providers', label: 'Providers', singular: 'provider', dotClassName: 'bg-forest' },
  { role: 'consumers', label: 'Consumers', singular: 'consumer', dotClassName: 'bg-accent' },
]

export function UserTypeFilter({
  selected,
  providerCount,
  consumerCount,
  onChange,
}: UserTypeFilterProps) {
  const counts: Record<UserRoleFilter, number> = {
    everyone: providerCount + consumerCount,
    providers: providerCount,
    consumers: consumerCount,
  }
  const selectedOption = options.find(option => option.role === selected) ?? options[0]
  const selectedCount = counts[selected]
  const heading = `${selectedCount} ${selectedOption.singular}${selectedCount === 1 ? '' : 's'}`

  return (
    <section aria-labelledby="user-results-heading" className="flex flex-col gap-3">
      <div>
        <h1 id="user-results-heading" className="font-heading text-h1 font-bold text-foreground">
          {heading}
        </h1>
        <p className="text-body text-foreground mt-1">Showing public profiles</p>
      </div>

      <div role="group" aria-label="Filter users by role" className="flex flex-wrap gap-3">
        {options.map(option => {
          const active = option.role === selected
          return (
            <button
              key={option.role}
              type="button"
              aria-label={`${option.label} ${counts[option.role]}`}
              aria-pressed={active}
              onClick={() => onChange(option.role)}
              className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-2 px-5 text-body font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                active
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-charcoal bg-background text-foreground hover:bg-linen'
              }`}
            >
              {option.dotClassName && (
                <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${option.dotClassName}`} />
              )}
              <span>{option.label}</span>
              <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-muted px-1.5 text-label text-cream">
                {counts[option.role]}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
