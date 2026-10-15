import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'action' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** Disables the button and announces the busy state. */
  pending?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-brand-on hover:bg-brand-strong border border-transparent',
  action: 'bg-action text-action-on hover:bg-action-strong border border-transparent',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-muted',
}

export function Button({
  variant = 'primary',
  pending = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
