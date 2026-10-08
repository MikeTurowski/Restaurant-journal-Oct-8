import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
  DEFAULT_FILTERS,
  isCategoryFilter,
  type RestaurantFilters,
} from '@/lib/filterRestaurants'

export type DiscoverView = 'list' | 'map'

/**
 * Filters and view mode live in the URL (?view=map&category=fully_vegan&cuisine=Thai)
 * so refresh, back/forward and shared links all restore the same screen.
 * Unrelated params (like ?mockError=1) are preserved.
 */
export function useDiscoverFilters() {
  const [params, setParams] = useSearchParams()

  const categoryParam = params.get('category')
  const cuisineParam = params.get('cuisine')
  const viewParam = params.get('view')

  const filters = useMemo<RestaurantFilters>(
    () => ({
      category: isCategoryFilter(categoryParam)
        ? categoryParam
        : DEFAULT_FILTERS.category,
      cuisine: cuisineParam || null,
    }),
    [categoryParam, cuisineParam],
  )
  const view: DiscoverView = viewParam === 'map' ? 'map' : 'list'

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(changes)) {
            if (
              value === null ||
              value === '' ||
              value === 'all' ||
              (key === 'view' && value === 'list')
            ) {
              next.delete(key)
            } else {
              next.set(key, value)
            }
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return {
    filters,
    view,
    setCategory: (category: RestaurantFilters['category']) => update({ category }),
    setCuisine: (cuisine: string | null) => update({ cuisine }),
    setView: (next: DiscoverView) => update({ view: next }),
    clearFilters: () => update({ category: null, cuisine: null }),
  }
}
