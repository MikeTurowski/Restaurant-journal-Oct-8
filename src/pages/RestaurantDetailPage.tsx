import { useParams } from 'react-router'
import { BackLink } from '@/components/layout/BackLink'
import { CategoryBadge } from '@/components/restaurant/CategoryBadge'
import { CuisineTags } from '@/components/restaurant/CuisineTags'
import { DirectionsButton } from '@/components/restaurant/DirectionsButton'
import { DishList } from '@/components/restaurant/DishList'
import { LastChecked } from '@/components/restaurant/LastChecked'
import { PriceLevel } from '@/components/restaurant/PriceLevel'
import { SaveButton } from '@/components/restaurant/SaveButton'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import {
  CheckCircleIcon,
  ClockIcon,
  GlobeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@/components/ui/icons'
import { LinkButton } from '@/components/ui/LinkButton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRestaurant } from '@/hooks/useRestaurant'
import { formatCheckedDate } from '@/lib/formatLastChecked'
import type { Restaurant } from '@/types/restaurant'

function DetailSkeleton() {
  return (
    <div role="status" className="animate-shimmer space-y-4">
      <span className="sr-only">Loading restaurant…</span>
      <div className="h-5 w-28 rounded-chip bg-surface-muted" />
      <div className="h-9 w-2/3 rounded-md bg-surface-muted" />
      <div className="h-5 w-1/2 rounded-md bg-surface-muted" />
      <div className="h-44 rounded-card bg-surface-muted" />
    </div>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-ink-muted">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-ink-muted">{label}</dt>
        <dd className="text-ink">{children}</dd>
      </div>
    </div>
  )
}

function RestaurantDetail({ restaurant }: { restaurant: Restaurant }) {
  const checkedOn = formatCheckedDate(restaurant.lastChecked)
  const website = restaurant.websiteUrl ? new URL(restaurant.websiteUrl) : null

  return (
    <article className="animate-rise space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryBadge category={restaurant.category} />
          <PriceLevel level={restaurant.priceLevel} />
        </div>
        <h1 className="text-3xl text-ink">{restaurant.name}</h1>
        <CuisineTags cuisines={restaurant.cuisines} />
        <div className="flex flex-wrap gap-3 pt-1">
          <DirectionsButton restaurant={restaurant} />
          <SaveButton
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            variant="full"
          />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_20rem] md:items-start">
        <section aria-labelledby="dishes-heading" className="space-y-3">
          <h2 id="dishes-heading" className="text-xl">
            Known vegan dishes
          </h2>
          {restaurant.veganDishes.length > 0 ? (
            <DishList dishes={restaurant.veganDishes} />
          ) : (
            <p className="text-ink-muted">No specific dishes have been recorded yet.</p>
          )}
          <p className="text-sm text-ink-muted">
            Menus and kitchen practices change. When in doubt, confirm with staff.
          </p>
        </section>

        <div className="space-y-4">
          <section
            aria-labelledby="info-heading"
            className="space-y-4 rounded-card border border-line bg-surface p-4"
          >
            <h2 id="info-heading" className="text-lg">
              Details
            </h2>
            <dl className="space-y-4">
              <InfoRow icon={<MapPinIcon />} label="Address">
                {restaurant.address}
              </InfoRow>
              {restaurant.hours && restaurant.hours.length > 0 && (
                <InfoRow icon={<ClockIcon />} label="Hours">
                  <ul>
                    {restaurant.hours.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </InfoRow>
              )}
              {restaurant.phone && (
                <InfoRow icon={<PhoneIcon />} label="Phone">
                  <a
                    className="underline underline-offset-2"
                    href={`tel:${restaurant.phone.replace(/[^\d+]/g, '')}`}
                  >
                    {restaurant.phone}
                  </a>
                </InfoRow>
              )}
              {website && (
                <InfoRow icon={<GlobeIcon />} label="Website">
                  <a
                    className="inline-flex min-h-11 items-center underline underline-offset-2"
                    href={website.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {website.hostname.replace(/^www\./, '')}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </InfoRow>
              )}
            </dl>
          </section>

          <section
            aria-labelledby="verification-heading"
            className="space-y-2 rounded-card border border-line bg-brand-soft p-4 text-brand-soft-ink"
          >
            <h2 id="verification-heading" className="flex items-center gap-2 text-lg">
              <CheckCircleIcon />
              Verification
            </h2>
            <p className="text-sm">
              {restaurant.verificationNote ?? 'Not yet verified.'}
            </p>
            <p className="text-sm">
              <LastChecked lastChecked={restaurant.lastChecked} />
              {checkedOn && <span> · {checkedOn}</span>}
            </p>
          </section>
        </div>
      </div>
    </article>
  )
}

export function RestaurantDetailPage() {
  const { slug = '' } = useParams()
  const state = useRestaurant(slug)
  const title = state.status === 'success' && state.data ? state.data.name : undefined
  useDocumentTitle(title)

  return (
    <div className="space-y-4">
      <BackLink>Back</BackLink>

      {state.status === 'loading' && <DetailSkeleton />}

      {state.status === 'error' && (
        <ErrorState
          title="Couldn’t load this restaurant"
          message={state.error.message}
          onRetry={state.retry}
        />
      )}

      {state.status === 'success' &&
        (state.data ? (
          <RestaurantDetail restaurant={state.data} />
        ) : (
          <EmptyState
            title="Restaurant not found"
            description="That link may be out of date, or the restaurant has been removed."
            action={<LinkButton to="/">Browse all restaurants</LinkButton>}
          />
        ))}
    </div>
  )
}
