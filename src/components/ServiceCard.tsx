import { Link } from '@tanstack/react-router'
import { Badge, type BadgeProps } from "./Badge"
import { MapPin, Dot, ArrowRight } from 'lucide-react'

interface ServiceCardProps{
    link: string
    pictureLink: string
    location: string
    providerFirstName: string
    providerLastName: string
    varified: boolean
    label: string
    description: string
    badges: BadgeProps[]
    hourRate : number
    distance: number
    
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
                <div className='m-3'>
                    <img src={pictureLink} alt={label} className="w-150 h-auto rounded-xl object-cover" />
                </div>
                <div className='grid gap-2 my-3'>
                    <div className="flex gap-8">
                        <label className='text-h2'>{label}</label>
                        
                        <div className='flex gap-2 ml-auto'>
                            <p className='ml-auto text-primary font-bold'>{hourRate}€</p>
                            <p className='ml-auto'> pro Stunde</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className='flex gap-1'>
                            <p>von</p>
                            <p className='font-bold'>{providerFirstName} {providerLastName}</p>
                        </div>
                        <Dot />
                        {varified? <p className="text-primary font-bold">Verifiziert</p> : <p></p>}
                        <Dot />
                        <p className='font-bold'>{location}</p>
                    </div>
                    <div>
                        <p>{description}</p>
                    </div>
                    <div className="flex gap-2">
                        {badges.map((badge) => (
                            <Badge key={badge.text} {...badge} />
                        ))}
                    </div>
                    <div className='flex'>
                        <p><MapPin className='inline'/> {distance} km entfernt</p>
                        <div className='ml-auto mt-auto'>
                            <Link
                                to={link}
                                className="relative inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-body font-medium text-primary-foreground no-underline transition-colors duration-150 hover:bg-primary-hover active:bg-primary-hover"
                            >
                                Zum Angebot
                                <ArrowRight size={18} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                    
                </div>

            </div>
            
        </div>
    )
}
