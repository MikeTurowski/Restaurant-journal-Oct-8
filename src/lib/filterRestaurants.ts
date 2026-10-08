import type { Restaurant, RestaurantCategory } from '@/types/restaurant'

export type CategoryFilter = 'all' | RestaurantCategory

export interface RestaurantFilters {
  category: CategoryFilter
  /** Cuisine label as it appears in the data, or null for "any". */
  cuisine: string | null
}

export const DEFAULT_FILTERS: RestaurantFilters = { category: 'all', cuisine: null }

export const CATEGORY_LABELS: Record<RestaurantCategory, string> = {
  fully_vegan: 'Fully vegan',
  vegan_options: 'Vegan options',
}

export function isCategoryFilter(value: unknown): value is CategoryFilter {
  return value === 'all' || value === 'fully_vegan' || value === 'vegan_options'
}

export function filterRestaurants(
  restaurants: readonly Restaurant[],
  filters: RestaurantFilters,
): Restaurant[] {
  const cuisine = filters.cuisine?.toLowerCase() ?? null
  return restaurants.filter((r) => {
    if (filters.category !== 'all' && r.category !== filters.category) return false
    if (cuisine && !r.cuisines.some((c) => c.toLowerCase() === cuisine)) return false
    return true
  })
}

/** Unique cuisines across restaurants, sorted A→Z. */
export function listCuisines(restaurants: readonly Restaurant[]): string[] {
  return [...new Set(restaurants.flatMap((r) => r.cuisines))].sort((a, b) =>
    a.localeCompare(b),
  )
}

export function countActiveFilters(filters: RestaurantFilters): number {
  return (filters.category !== 'all' ? 1 : 0) + (filters.cuisine ? 1 : 0)
}
