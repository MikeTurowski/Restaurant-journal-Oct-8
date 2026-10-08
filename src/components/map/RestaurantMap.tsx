import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, type KeyboardEvent } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Restaurant } from '@/types/restaurant'
import { categoryIcon } from './categoryIcon'
import { MapPreviewCard } from './MapPreviewCard'

const EUGENE_CENTER: [number, number] = [44.0521, -123.0868]

interface RestaurantMapProps {
  restaurants: readonly Restaurant[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

function FitToRestaurants({ restaurants }: { restaurants: readonly Restaurant[] }) {
  const map = useMap()
  useEffect(() => {
    if (restaurants.length === 0) return
    const bounds = L.latLngBounds(
      restaurants.map((r) => [r.lat, r.lng] as [number, number]),
    )
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15, animate: false })
  }, [map, restaurants])
  return null
}

function ClearOnMapClick({ onClear }: { onClear: () => void }) {
  useMapEvents({ click: onClear })
  return null
}

export default function RestaurantMap({
  restaurants,
  selectedId,
  onSelect,
}: RestaurantMapProps) {
  const selected = useMemo(
    () => restaurants.find((r) => r.id === selectedId) ?? null,
    [restaurants, selectedId],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && selected) onSelect(null)
  }

  return (
    // The wrapper creates its own stacking context so Leaflet's high z-indexes
    // can't overlap the app header or bottom navigation.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role="region"
      aria-label="Map of restaurants in Eugene"
      className="relative isolate h-[62dvh] min-h-[380px] overflow-hidden rounded-card border border-line md:h-[calc(100dvh-16rem)]"
      onKeyDown={handleKeyDown}
    >
      <MapContainer
        center={EUGENE_CENTER}
        zoom={13}
        scrollWheelZoom
        className="size-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FitToRestaurants restaurants={restaurants} />
        <ClearOnMapClick onClear={() => onSelect(null)} />
        {restaurants.map((r) => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={categoryIcon(r.category, r.id === selectedId)}
            title={r.name}
            alt={`${r.name}, ${r.category === 'fully_vegan' ? 'fully vegan' : 'vegan options'}`}
            keyboard
            eventHandlers={{ click: () => onSelect(r.id) }}
          />
        ))}
      </MapContainer>

      <p className="sr-only">
        {restaurants.length} restaurants shown on the map. Use the List view for a text
        version.
      </p>

      {selected && (
        <MapPreviewCard restaurant={selected} onClose={() => onSelect(null)} />
      )}
    </div>
  )
}
