import { Link } from '@tanstack/react-router'
import { Badge, type BadgeProps } from "./Badge"
import { Button } from "./Button"

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
            <div className="flex gap-8">
                <label>{label}</label>
                <p>{hourRate}€ pro Stunde</p>
            </div>
            <div className="flex gap-4">
                <p> von {providerFirstName} {providerLastName}</p>
                {varified? <p className="text-primary">Verifiziert</p> : <p></p>}
                <p>{location}</p>
            </div>
            <div>
                <p>{description}</p>
            </div>
            <div className="flex gap-2">
                {badges.map((badge) => (
                    <Badge key={badge.text} {...badge} />
                ))}
            </div>
            <div>
                <p>{distance} km entfernt</p>
            </div>
            <div>
                <Button variant="primary" ><Link to={link} className='text-white decoration-0 '>Zum Angebot</Link></Button>
            </div>
        </div>
    )
}