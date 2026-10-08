import type { Dish } from '@/types/restaurant'

export function DishList({ dishes }: { dishes: readonly Dish[] }) {
  return (
    <ul className="divide-y divide-line rounded-card border border-line bg-surface">
      {dishes.map((dish) => (
        <li key={dish.id} className="px-4 py-3">
          <p className="font-medium text-ink">{dish.name}</p>
          {dish.description && (
            <p className="text-sm text-ink-muted">{dish.description}</p>
          )}
          {dish.note && (
            <p className="mt-1 inline-block rounded-md bg-accent-soft px-2 py-0.5 text-xs text-accent-soft-ink">
              <span className="font-semibold">Tip:</span> {dish.note}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
