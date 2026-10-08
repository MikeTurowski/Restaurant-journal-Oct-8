import { useId, type ReactNode } from 'react'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  legend: string
  /** Hide the legend visually but keep it for screen readers. */
  hideLegend?: boolean
  options: readonly SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}

/** Native radio inputs under the hood, so arrow-key navigation and semantics are free. */
export function SegmentedControl<T extends string>({
  legend,
  hideLegend,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const name = useId()
  return (
    <fieldset className="min-w-0">
      <legend
        className={hideLegend ? 'sr-only' : 'mb-1.5 text-xs font-medium text-ink-muted'}
      >
        {legend}
      </legend>
      <div className="flex w-full rounded-control border border-line bg-surface-muted p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="relative flex min-h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[0.6rem] px-2 text-sm font-medium text-ink-muted transition-colors duration-150 has-checked:bg-raised has-checked:text-ink has-checked:shadow-card has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus sm:px-3"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {option.icon}
            <span className="text-center leading-tight">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
