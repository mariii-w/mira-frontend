import { Link } from '@tanstack/react-router'
import { Badge } from "../../common/ui/Badge"
import { Button } from "../../common/ui/Button"
import { ArrowRight } from 'lucide-react'

export interface ServiceCardTag {
  tagId: string
  name: string
  isBarrierefrei: boolean
}

interface ServiceCardChatProps{
    link: string
    pictureLink?: string
    varified?: boolean
    label: string
    tags: ServiceCardTag[]
    hourRate : number
}

export function ServiceCardChat(
    {link, 
        pictureLink, 
        label, 
        tags,
        hourRate, 
        varified
    }: ServiceCardChatProps  
)
{
    return(
        <div className="bg-cream rounded-2xl flex flex-col gap-3 border border-border w-full">
            <div className='flex flex-col lg:flex-col gap-3'>
                {pictureLink && (
                    <div className='w-full border-b border-border'>
                        <img src={pictureLink} className="w-full h-32 rounded-t-2xl object-cover" alt={`Photo for ${label}`} />
                    </div>
                )}
                
                <div className='grid gap-2 p-3 flex-1 min-w-0'>
                    <div className="flex gap-8">
                        <h2 className='text-lg'>{label}</h2>

                        
                    </div>
                    <div className='flex flex-wrap gap-2 pb-2'>
                        {tags.map((tag) => (
                            <Badge key={tag.tagId} text={tag.name} variant={tag.isBarrierefrei ? 'accent' : 'primary'} />
                        ))}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                        <div className='flex gap-1'>
                            <div className='flex gap-2 ml-auto shrink-0'>
                                <p className='ml-auto text-primary text-2 font-bold'>{hourRate}€</p>
                                <p className='ml-auto'> per hour</p>
                            </div>
                        </div>
                        {varified && (
                            <>
                                <p className="text-primary font-bold">Verified</p>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <div className='mx-auto shrink-0 flex items-center gap-3'>
                            {link ? (
                                <Link
                                    to={link}
                                    className="relative inline-flex items-center justify-center gap-2 font-medium rounded-full cursor-pointer transition-colors duration-150 h-11 px-5 text-body bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover [&_svg]:size-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                                >
                                    View Listing
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            ) : (
                                <Button
                                    disabled
                                    trailingIcon={<ArrowRight />}
                                    aria-label="View listing (unavailable)"
                                >
                                    View Listing
                                </Button>
                            )}
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}