import type { ReactNode } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

/** Centered card shared by all sign-in / register / reset screens. */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  useDocumentTitle(title)
  return (
    <div className="mx-auto w-full max-w-md animate-rise space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl text-ink md:text-3xl">{title}</h1>
        {description && <p className="text-ink-muted">{description}</p>}
      </div>
      <div className="space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
        {children}
      </div>
      {footer && <div className="text-center text-sm text-ink-muted">{footer}</div>}
    </div>
  )
}
