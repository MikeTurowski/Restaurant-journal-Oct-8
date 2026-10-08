import L from 'leaflet'
import type { RestaurantCategory } from '@/types/restaurant'

// Leaflet's default marker images break under bundlers, so markers are divIcons
// styled by category (see .vegan-marker in styles/index.css). Shape differs too,
// so category is never conveyed by color alone.
const LEAF =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
const SPROUT =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8Z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z"/></svg>'

const cache = new Map<string, L.DivIcon>()

export function categoryIcon(category: RestaurantCategory, active: boolean): L.DivIcon {
  const key = `${category}:${active}`
  const cached = cache.get(key)
  if (cached) return cached
  const icon = L.divIcon({
    className: `vegan-marker vegan-marker--${category}${active ? ' vegan-marker--active' : ''}`,
    html: `<div class="vegan-marker__pin"><span>${category === 'fully_vegan' ? LEAF : SPROUT}</span></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
  cache.set(key, icon)
  return icon
}
