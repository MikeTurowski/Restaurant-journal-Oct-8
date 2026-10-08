import { lazy, Suspense, useMemo, useState } from 'react'
import { CategoryFilter } from '@/components/filters/CategoryFilter'
import { CuisineFilter } from '@/components/filters/CuisineFilter'
import { ViewToggle } from '@/components/filters/ViewToggle'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { LoadingList } from '@/components/states/LoadingList'
import { useDiscoverFilters } from '@/hooks/useDiscoverFilters'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRestaurants } from '@/hooks/useRestaurants'
import {
  countActiveFilters,
  filterRestaurants,
  listCuisines,
} from '@/lib/filterRestaurants'

// Leaflet is only needed for the map view, so keep it out of the main bundle.
const RestaurantMap = lazy(() => import('@/components/map/RestaurantMap'))

function MapFallback() {
  return (
    <div
      role="status"
      className="grid h-[62dvh] min-h-[380px] animate-shimmer place-items-center rounded-card border border-line bg-surface-muted text-sm text-ink-muted"
    >
      Loading map…
    </div>
  )
}

export function DiscoverPage() {
  useDocumentTitle()
  const { filters, view, setCategory, setCuisine, setView, clearFilters } =
    useDiscoverFilters()
  const state = useRestaurants()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const all = state.status === 'success' ? state.data : null
  const cuisines = useMemo(() => (all ? listCuisines(all) : []), [all])
  const visible = useMemo(
    () => (all ? filterRestaurants(all, filters) : []),
    [all, filters],
  )

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl text-ink md:text-3xl">Eat well in Eugene</h1>
        <p className="text-ink-muted">
          Find fully vegan spots, places with vegan options, and the dishes to order.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_14rem_12rem]">
        <div className="col-span-2 lg:col-span-1">
          <CategoryFilter value={filters.category} onChange={setCategory} />
        </div>
        <CuisineFilter
          cuisines={cuisines}
          value={filters.cuisine}
          onChange={setCuisine}
        />
        <ViewToggle value={view} onChange={setView} />
      </div>

      {state.status === 'loading' && (view === 'map' ? <MapFallback /> : <LoadingList />)}

      {state.status === 'error' && (
        <ErrorState
          title="Couldn’t load restaurants"
          message={state.error.message}
          onRetry={state.retry}
        />
      )}

      {state.status === 'success' && (
        <>
          <p aria-live="polite" className="text-sm text-ink-muted">
            Showing {visible.length} of {state.data.length} places
          </p>

          {visible.length === 0 ? (
            <EmptyState
              title="No matches yet"
              description={
                state.data.length === 0
                  ? 'There are no restaurants to show right now.'
                  : 'Try a different category or cuisine.'
              }
              action={
                countActiveFilters(filters) > 0 ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-11 rounded-control bg-brand px-5 text-sm font-semibold text-brand-on hover:bg-brand-strong"
                  >
                    Clear filters
                  </button>
                ) : undefined
              }
            />
          ) : view === 'map' ? (
            <Suspense fallback={<MapFallback />}>
              <RestaurantMap
                restaurants={visible}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </Suspense>
          ) : (
            <ul className="grid animate-rise gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((restaurant) => (
                <li key={restaurant.id} className="flex">
                  <div className="w-full">
                    <RestaurantCard restaurant={restaurant} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
