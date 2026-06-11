import { Link } from '@tanstack/react-router'
import { Badge, type BadgeProps } from "./Badge"
import { Button } from "./Button"
import { MapPin, Dot, ArrowRight } from 'lucide-react'

interface ServiceCardProps{
    link: string
    pictureLink?: string
    location: string
    providerFirstName: string
    providerLastName: string
    varified?: boolean
    label: string
    description?: string
    badges: BadgeProps[]
    hourRate : number
    distance?: number
}

export function ServiceCard(
    {link, 
        pictureLink, 
        location, 
        label, 
        description, 
        badges, 
        hourRate, 
        distance, 
        providerFirstName, 
        providerLastName,
        varified
    }: ServiceCardProps  
)
{
    return(
        <div className="bg-linen rounded-2xl flex flex-col p-5 gap-4 border border-border w-full">
            <div className='flex col-2 gap-4'>
                {pictureLink && (
                    <div className='m-3 shrink-0'>
                        <img src={pictureLink} className="w-48 h-36 rounded-xl object-cover" alt="" />
                    </div>
                )}
                <div className='grid gap-2 my-3 flex-1 min-w-0'>
                    <div className="flex gap-8">
                        <label className='text-h2'>{label}</label>

                        <div className='flex gap-2 ml-auto shrink-0'>
                            <p className='ml-auto text-primary font-bold'>{hourRate}€</p>
                            <p className='ml-auto'> per hour</p>
                        </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <div className='flex gap-1'>
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
                        <p className='font-bold'>{location}</p>
                    </div>
                    {description && (
                        <div>
                            <p>{description}</p>
                        </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                        {badges.map((badge) => (
                            <Badge key={badge.text} {...badge} />
                        ))}
                    </div>
                    <div className='flex'>
                        {distance !== undefined && (
                            <p><MapPin className='inline'/> {distance} km away</p>
                        )}
                        <div className='ml-auto mt-auto'>
                            <Button variant="primary" trailingIcon={<ArrowRight />} ><Link to={link} className='text-white decoration-0 '>View service</Link></Button>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}