import { Link } from '@tanstack/react-router'
import { Badge } from "./Badge"
import { Button } from "./Button"
import { MapPin, Dot, ArrowRight } from 'lucide-react'

export interface ServiceCardTag {
  tagId: string
  name: string
  isBarrierefrei: boolean
}

interface ServiceCardProps{
    link: string
    pictureLink?: string
    location: string
    providerFirstName: string
    providerLastName: string
    varified?: boolean
    label: string
    description?: string
    tags: ServiceCardTag[]
    hourRate : number
}

export function ServiceCard(
    {link, 
        pictureLink, 
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
    return(
        <div className="bg-linen rounded-2xl flex flex-col p-3 gap-3 border border-border w-full">
            <div className='flex flex-col lg:flex-row gap-3'>
                {pictureLink && (
                    <div className='shrink-0 lg:self-stretch'>
                        <img src={pictureLink} className="w-full h-48 lg:w-48 lg:h-full rounded-lg object-cover" alt="" />
                    </div>
                )}
                <div className='grid gap-2 flex-1 min-w-0'>
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
                        <MapPin size={14} className='shrink-0 self-center text-foreground/70' />
                        <p className='font-bold'>{location}</p>
                    </div>
                    {description && (
                        <div>
                            <p>{description}</p>
                        </div>
                    )}
                    <div className="flex gap-2 flex-wrap items-center">
                        {tags.map((tag) => (
                            <Badge key={tag.tagId} text={tag.name} variant={tag.isBarrierefrei ? 'accent' : 'primary'} />
                        ))}
                        <div className='ml-auto shrink-0 flex items-center gap-3'>
                            <Button variant="primary" trailingIcon={<ArrowRight />}><Link to={link} className='text-white decoration-0'>View service</Link></Button>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}