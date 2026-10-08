import { Link, type LinkProps } from 'react-router'

export function LinkButton({ className = '', ...props }: LinkProps) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center rounded-control bg-brand px-5 text-sm font-semibold text-brand-on transition-colors duration-150 hover:bg-brand-strong ${className}`}
      {...props}
    />
  )
}
