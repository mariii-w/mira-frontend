import { Link } from '@tanstack/react-router'
import { Button } from "./Button"
import { ClipboardPen, CircleCheck, CircleOff, FileText } from 'lucide-react'

type ServiceStatus = 'active' | 'inactive' | 'draft'

export interface ServiceCardEditProps {
    link: string
    pictureLink?: string
    label: string
    description: string
    status: ServiceStatus
}

const statusConfig: Record<ServiceStatus, {
    label: string
    icon: React.ReactNode
    className: string
}> = {
    active: {
        label: 'Aktiv',
        icon: <CircleCheck size={12} />,
        className: 'bg-mint text-primary border border-primary',
    },
    inactive: {
        label: 'Inaktiv',
        icon: <CircleOff size={12} />,
        className: 'bg-gray-100 text-gray-500 border border-gray-200',
    },
    draft: {
        label: 'Entwurf',
        icon: <FileText size={12} />,
        className: 'bg-amber-100 text-amber-700 border border-amber-200',
    },
}

export function ServiceCardEdit({
    link,
    pictureLink,
    label,
    description,
    status,
}: ServiceCardEditProps) {
    const { label: statusLabel, icon, className } = statusConfig[status]

    return (
        <div className="bg-cream rounded-2xl flex flex-col p-5 gap-4 border border-border w-full">
            <div className='flex gap-4 items-stretch'>
                {pictureLink && (
                  <div className='m-1 shrink-0'>
                    <img src={pictureLink} alt={label} className="w-50 h-40 rounded-xl object-cover" />
                  </div>
                )}
                <div className='flex flex-col gap-2 my-3 flex-1'>
                    <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-md font-medium ${className}`}>
                            {icon}
                            {statusLabel}
                        </span>
                    </div>
                    <label className='text-h2'>{label}</label>
                    <article className='flex-1'>{description}</article>
                    <div className='flex'>
                        <div className='ml-auto mt-auto'>
                            <Button variant="primary" trailingIcon={<ClipboardPen />}>
                                <Link to={link} className='text-white decoration-0'>Bearbeiten</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}