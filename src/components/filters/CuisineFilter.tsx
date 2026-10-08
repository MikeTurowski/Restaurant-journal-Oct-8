import { useId } from 'react'

interface CuisineFilterProps {
  cuisines: readonly string[]
  value: string | null
  onChange: (value: string | null) => void
}

export function CuisineFilter({ cuisines, value, onChange }: CuisineFilterProps) {
  const id = useId()
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-muted">
        Cuisine
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="min-h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink"
      >
        <option value="">Any cuisine</option>
        {cuisines.map((cuisine) => (
          <option key={cuisine} value={cuisine}>
            {cuisine}
          </option>
        ))}
      </select>
    </div>
  )
}
