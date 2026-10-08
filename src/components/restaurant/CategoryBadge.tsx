import { CATEGORY_LABELS } from '@/lib/filterRestaurants'
import { LeafIcon, SproutIcon } from '@/components/ui/icons'
import type { RestaurantCategory } from '@/types/restaurant'

const styles: Record<RestaurantCategory, string> = {
  fully_vegan: 'bg-brand text-brand-on border-brand',
  vegan_options: 'bg-accent-soft text-accent-soft-ink border-accent',
}

export function CategoryBadge({ category }: { category: RestaurantCategory }) {
  const Icon = category === 'fully_vegan' ? LeafIcon : SproutIcon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-chip border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${styles[category]}`}
    >
      <Icon width={14} height={14} />
      {CATEGORY_LABELS[category]}
    </span>
  )
}
