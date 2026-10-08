import { Link } from 'react-router'
import { CategoryBadge } from '@/components/restaurant/CategoryBadge'
import { CuisineTags } from '@/components/restaurant/CuisineTags'
import { LastChecked } from '@/components/restaurant/LastChecked'
import { CloseIcon } from '@/components/ui/icons'
import type { Restaurant } from '@/types/restaurant'

interface MapPreviewCardProps {
  restaurant: Restaurant
  onClose: () => void
}

export function MapPreviewCard({ restaurant, onClose }: MapPreviewCardProps) {
  const dishes = restaurant.veganDishes.slice(0, 2).map((d) => d.name)
  return (
    <section
      aria-label={`${restaurant.name} preview`}
      className="absolute inset-x-3 bottom-3 z-[1000] mx-auto max-w-md animate-rise rounded-card border border-line bg-surface p-4 shadow-pop"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1.5">
          <CategoryBadge category={restaurant.category} />
          <h2 className="text-lg text-ink">{restaurant.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-control text-ink-muted hover:bg-surface-muted"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="mt-2 space-y-2">
        <CuisineTags cuisines={restaurant.cuisines} />
        {dishes.length > 0 && (
          <p className="text-sm text-ink-muted">Vegan: {dishes.join(' · ')}</p>
        )}
        <div className="flex items-center justify-between gap-3 pt-1">
          <LastChecked lastChecked={restaurant.lastChecked} />
          <Link
            to={`/restaurants/${restaurant.slug}`}
            className="inline-flex min-h-11 items-center rounded-control bg-brand px-4 text-sm font-semibold text-brand-on hover:bg-brand-strong"
          >
            View details
          </Link>
        </div>
      </div>
    </section>
  )
}
