import type { ProviderServiceTagSummary } from '../../../lib/providerServiceSummary'

interface ProviderServicesSectionProps {
  serviceCount: number
  topTags: ProviderServiceTagSummary[]
}

export function ProviderServicesSection({ serviceCount, topTags }: ProviderServicesSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label font-bold uppercase tracking-wide text-muted">
        Offers {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
      </p>
      <div className="flex flex-wrap gap-2">
        {topTags.map(tag => (
          <span
            key={tag.tagId}
            className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-small font-medium text-center ${
              tag.isBarrierefrei ? 'bg-blush text-plum' : 'bg-mint text-forest'
            }`}
          >
            {tag.name} • {tag.minPrice}€
          </span>
        ))}
      </div>
    </div>
  )
}
