import { Link } from '@tanstack/react-router'
import { Badge } from "./Badge"
import { AvatarIcon } from "./AvatarIcon"
import { MapPin, Dot, ArrowRight } from 'lucide-react'
import { useId } from 'react'
import type { AccessibilityGenerationStatus, ServiceTag } from '../api/model'

export interface ServiceCardProps{
    variant?: 'default' | 'compact'
    link: string
    pictureLink?: string
    pictureAltText?: string | null
    pictureAltTextStatus?: AccessibilityGenerationStatus
    location: string
    providerFirstName: string
    providerLastName: string
    varified?: boolean
    label: string
    description?: string
    tags: ServiceTag[]
    hourRate : number
}

export function ServiceCard(
    {variant = 'default',
        link,
        pictureLink,
        pictureAltText,
        pictureAltTextStatus,
        location,
        label,
        description,
        tags,
        hourRate,
        providerFirstName,
        providerLastName,
        varified
    }: ServiceCardProps
)
{
    const titleId = useId()
    const providerId = useId()
    const locationId = useId()
    const priceId = useId()
    const descriptionId = useId()
    const describedBy = [
        providerId,
        locationId,
        priceId,
        description ? descriptionId : null,
    ].filter(Boolean).join(' ')

    if (variant === 'compact') {
        return (
            <div
                role="group"
                aria-labelledby={titleId}
                aria-describedby={describedBy}
                className="bg-surface rounded-2xl flex flex-col p-4 gap-3 w-full h-full"
            >
                <div className="flex items-center gap-3">
                    <AvatarIcon firstName={providerFirstName} lastName={providerLastName} picture="" size={56} bgColorClassName="bg-forest" />
                    <div className="flex flex-col min-w-0">
                        <span id={providerId} className="sr-only">by {providerFirstName} {providerLastName}</span>
                        <span aria-hidden="true" className="text-body font-bold text-foreground truncate">
                            {providerFirstName} {providerLastName[0]}.
                        </span>
                        <span id={locationId} className="text-small text-muted truncate">
                            {location}
                            {varified && ' • Verified'}
                        </span>
                    </div>
                </div>
                <div className="border-t border-border" />
                <h3 id={titleId} className="text-body font-bold text-foreground line-clamp-2">{label}</h3>
                {description && (
                    <p id={descriptionId} className="text-small text-foreground/80 line-clamp-3">{description}</p>
                )}
                <div className="mt-auto flex flex-col gap-2">
                    <span id={priceId} className="self-end text-body font-bold text-primary">from {hourRate}€/hr</span>
                    <Link
                        to={link}
                        aria-label={`View listing for ${label}`}
                        className="relative inline-flex items-center justify-center font-medium rounded-full cursor-pointer transition-colors duration-150 h-11 w-full px-4 text-body bg-primary text-primary-foreground no-underline hover:bg-primary-hover active:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    >
                        View Listing
                    </Link>
                </div>
            </div>
        )
    }

    return(
        <div
            role="group"
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            className="bg-linen rounded-2xl flex flex-col p-3 gap-3 border border-border w-full"
        >
            <div className='flex flex-col lg:flex-row gap-3'>
                {pictureLink && (
                    <div className='shrink-0 lg:self-stretch'>
                        <img
                            src={pictureLink}
                            alt={pictureAltTextStatus === 'COMPLETED' && pictureAltText ? pictureAltText : label}
                            className="w-full h-48 lg:w-48 lg:h-full rounded-lg object-cover"
                        />
                    </div>
                )}
                <div className='grid gap-2 flex-1 min-w-0'>
                    <div className="flex gap-8">
                        <h2 id={titleId} className='text-h2'>{label}</h2>

                        <div id={priceId} className='flex gap-2 ml-auto shrink-0'>
                            <p className='ml-auto text-primary font-bold'>{hourRate}€</p>
                            <p className='ml-auto'> per hour</p>
                        </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <div id={providerId} className='flex gap-1'>
                            <p>by</p>
                            <p className='font-bold'>{providerFirstName} {providerLastName}</p>
                        </div>
                        {varified && (
                            <>
                                <Dot />
                                <p className="text-primary font-bold">Verified</p>
                            </>
                        )}
                        <Dot />
                        <MapPin size={14} className='shrink-0 self-center text-foreground/70' />
                        <p id={locationId} className='font-bold'>{location}</p>
                    </div>
                    {description && (
                        <div>
                            <p id={descriptionId}>{description}</p>
                        </div>
                    )}
                    <div className="flex gap-2 flex-wrap items-center">
                        {tags.map((tag) => (
                            <Badge key={tag.tagId} text={tag.name} variant={tag.isBarrierefrei ? 'accent' : 'primary'} />
                        ))}
                        <div className='ml-auto shrink-0 flex items-center gap-3'>
                            <Link
                                to={link}
                                aria-label={`View service for ${label}`}
                                className="relative inline-flex items-center justify-center gap-2 font-medium rounded-full cursor-pointer transition-colors duration-150 h-11 px-5 text-body bg-primary text-primary-foreground no-underline hover:bg-primary-hover active:bg-primary-hover [&_svg]:size-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                            >
                                View service
                                <ArrowRight aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}
