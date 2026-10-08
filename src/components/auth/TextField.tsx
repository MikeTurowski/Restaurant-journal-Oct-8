import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id'
> {
  label: string
  error?: string
  hint?: string
  /** Extra control rendered inside the field's right edge (e.g. show/hide password). */
  trailing?: ReactNode
}

export function TextField({
  label,
  error,
  hint,
  trailing,
  className = '',
  ...input
}: TextFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`min-h-11 w-full rounded-control border bg-surface px-3 text-base text-ink placeholder:text-ink-muted ${
            error ? 'border-accent' : 'border-line'
          } ${trailing ? 'pr-12' : ''} ${className}`}
          {...input}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center">{trailing}</div>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-accent-soft-ink">
          {error}
        </p>
      )}
    </div>
  )
}
