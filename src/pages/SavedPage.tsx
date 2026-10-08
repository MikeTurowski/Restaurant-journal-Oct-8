import { useMemo } from 'react'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { LoadingList } from '@/components/states/LoadingList'
import { LinkButton } from '@/components/ui/LinkButton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRestaurants } from '@/hooks/useRestaurants'
import { useSaved } from '@/hooks/useSaved'

export function SavedPage() {
  useDocumentTitle('Saved')
  const state = useRestaurants()
  const { savedIds, loading: savedLoading } = useSaved()

  const saved = useMemo(
    () =>
      state.status === 'success' ? state.data.filter((r) => savedIds.has(r.id)) : [],
    [state, savedIds],
  )

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl text-ink md:text-3xl">Saved places</h1>
        <p className="text-ink-muted">
          Restaurants you want to try. Stored on this device.
        </p>
      </div>

      {(state.status === 'loading' || savedLoading) && (
        <LoadingList count={3} label="Loading saved places" />
      )}

      {state.status === 'error' && (
        <ErrorState
          title="Couldn’t load saved places"
          message={state.error.message}
          onRetry={state.retry}
        />
      )}

      {state.status === 'success' &&
        !savedLoading &&
        (saved.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description="Tap the heart on any restaurant to keep it here."
            action={<LinkButton to="/">Discover restaurants</LinkButton>}
          />
        ) : (
          <>
            <p aria-live="polite" className="text-sm text-ink-muted">
              {saved.length} saved {saved.length === 1 ? 'place' : 'places'}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((restaurant) => (
                <li key={restaurant.id} className="flex">
                  <div className="w-full">
                    <RestaurantCard restaurant={restaurant} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        ))}
    </div>
  )
}
