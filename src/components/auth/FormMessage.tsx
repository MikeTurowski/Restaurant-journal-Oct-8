import type { ReactNode } from 'react'
import { AlertIcon, CheckCircleIcon } from '@/components/ui/icons'

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-control border border-accent bg-accent-soft p-3 text-sm text-accent-soft-ink"
    >
      <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
      <p>{children}</p>
    </div>
  )
}

export function FormSuccess({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-control bg-brand-soft p-3 text-sm text-brand-soft-ink"
    >
      <CheckCircleIcon className="mt-0.5 shrink-0" width={18} height={18} />
      <p>{children}</p>
    </div>
  )
}
