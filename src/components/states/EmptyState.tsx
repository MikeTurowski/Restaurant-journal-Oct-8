import type { ReactNode } from 'react'
import { LeafIcon } from '@/components/ui/icons'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand-soft-ink">
        <LeafIcon width={24} height={24} />
      </span>
      <h2 className="text-xl">{title}</h2>
      {description && <p className="text-ink-muted">{description}</p>}
      {action}
    </div>
  )
}
