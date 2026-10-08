import type { Restaurant } from '@/types/restaurant'

/** Opens turn-by-turn directions in the user's maps app / Google Maps on the web. */
export function buildDirectionsUrl(restaurant: Pick<Restaurant, 'lat' | 'lng'>): string {
  const destination = `${restaurant.lat},${restaurant.lng}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}
