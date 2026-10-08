import type { Restaurant } from '@/types/restaurant'

export function PriceLevel({ level }: { level: Restaurant['priceLevel'] }) {
  if (!level) return null
  return (
    <span className="text-xs font-medium tabular-nums">
      <span className="sr-only">Price level {level} of 4</span>
      <span aria-hidden="true">
        <span className="text-ink">{'$'.repeat(level)}</span>
        <span className="text-line">{'$'.repeat(4 - level)}</span>
      </span>
    </span>
  )
}
