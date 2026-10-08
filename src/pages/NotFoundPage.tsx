import { EmptyState } from '@/components/states/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <EmptyState
      title="Page not found"
      description="We couldn’t find what you were looking for."
      action={<LinkButton to="/">Back to Discover</LinkButton>}
    />
  )
}
