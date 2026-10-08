import { ExternalLinkIcon, NavigationIcon } from '@/components/ui/icons'
import { buildDirectionsUrl } from '@/lib/directions'
import type { Restaurant } from '@/types/restaurant'

export function DirectionsButton({ restaurant }: { restaurant: Restaurant }) {
  return (
    <a
      href={buildDirectionsUrl(restaurant)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-brand px-4 text-sm font-semibold text-brand-on transition-colors duration-150 hover:bg-brand-strong"
    >
      <NavigationIcon />
      Get directions
      <span className="sr-only">to {restaurant.name} (opens in a new tab)</span>
      <ExternalLinkIcon width={14} height={14} />
    </a>
  )
}
