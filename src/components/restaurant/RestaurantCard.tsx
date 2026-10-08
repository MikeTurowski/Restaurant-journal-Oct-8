import { Link } from 'react-router'
import type { Restaurant } from '@/types/restaurant'
import { CategoryBadge } from './CategoryBadge'
import { CuisineTags } from './CuisineTags'
import { LastChecked } from './LastChecked'
import { PriceLevel } from './PriceLevel'
import { SaveButton } from './SaveButton'

const PREVIEW_COUNT = 3

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const preview = restaurant.veganDishes.slice(0, PREVIEW_COUNT)
  const extra = restaurant.veganDishes.length - preview.length

  return (
    <article className="group relative flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card transition-shadow duration-200 focus-within:shadow-pop hover:shadow-pop">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-2">
          <CategoryBadge category={restaurant.category} />
          <h2 className="text-xl text-ink">
            {/* Stretched link: the whole card is clickable, the save button sits above it. */}
            <Link
              to={`/restaurants/${restaurant.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4"
            >
              {restaurant.name}
            </Link>
          </h2>
        </div>
        <div className="relative z-10 -mt-1 -mr-2">
          <SaveButton restaurantId={restaurant.id} restaurantName={restaurant.name} />
        </div>
      </div>

      <CuisineTags cuisines={restaurant.cuisines} />

      {preview.length > 0 && (
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-ink">Vegan: </span>
          {preview.map((d) => d.name).join(' · ')}
          {extra > 0 && ` · +${extra} more`}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <LastChecked lastChecked={restaurant.lastChecked} />
        <PriceLevel level={restaurant.priceLevel} />
      </div>
    </article>
  )
}
