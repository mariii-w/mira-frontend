import * as Popover from './Popover'
import { ChevronDown } from 'lucide-react'
import { Button } from './Button'
import { AvatarIcon } from './AvatarIcon'

interface UserBadgeProps{
    firstName?: string
    lastName?: string
    isProvider?: boolean

}

export function UserBadge({firstName, lastName, isProvider} : UserBadgeProps){
    var name = firstName + " " + lastName[0] +".";
    if(isProvider)
    {
        return (
            <Popover.Root>
            <Popover.Trigger asChild>
                <Button
                variant="userBadge"
                leadingIcon={<AvatarIcon firstName={firstName} lastName={lastName} />}
                trailingIcon={<ChevronDown />}
                >
                {name}
                </Button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                align="end"
                sideOffset={8}
                className="z-50 w-80 rounded-xl border border-border bg-surface p-2 shadow-lg"
                >
                <Row
                    id="a11y-profile"
                    title="Profil"
                    description=""
                    link=""
                />
                <div className="my-1 h-px bg-border/30" />
                <Row
                    id="a11y-chat"
                    title="Chat"
                    description=""
                    link=""
                />
                <Row
                    id="a11y-my-listings"
                    title="Meine Anzeigen"
                    description=""
                    link=""
                />
                </Popover.Content>
            </Popover.Portal>
            </Popover.Root>
        )
    }
    return (
        <Popover.Root>
        <Popover.Trigger asChild>
            <Button
            variant="userBadge"
            leadingIcon={<AvatarIcon firstName={firstName} lastName={lastName} />}
            trailingIcon={<ChevronDown />}
            >
            {name}
            </Button>
        </Popover.Trigger>

        <Popover.Portal>
            <Popover.Content
            align="end"
            sideOffset={8}
            className="z-50 w-80 rounded-xl border border-border bg-surface p-2 shadow-lg"
            >
            <Row
                    id="a11y-profile"
                    title="Profil"
                    description=""
                    link=""
                />
                <div className="my-1 h-px bg-border/30" />
                <Row
                    id="a11y-chat"
                    title="Chat"
                    description=""
                    link=""
                />
            </Popover.Content>
        </Popover.Portal>
        </Popover.Root>
    )
}

interface RowProps {
  id: string
  title: string
  description: string
  link: string
}

function Row({ id, title, description,link}: RowProps) {
  return (
    <a href={link} className="flex items-center justify-between gap-4 p-3 hover:bg-muted/10 rounded-lg">
      <div className="flex flex-col">
        <span className="text-body font-bold text-foreground">
          {title}
        </span>
        <span id={`${id}-desc`} className="text-small text-muted">{description}</span>
      </div>
    </a>
  )
}