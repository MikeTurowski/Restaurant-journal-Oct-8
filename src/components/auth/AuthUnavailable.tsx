import { EmptyState } from '@/components/states/EmptyState'
import { LinkButton } from '@/components/ui/LinkButton'

export function AuthUnavailable() {
  return (
    <EmptyState
      title="Accounts aren’t available"
      description="This copy of the app isn’t connected to a back end, so sign-in is switched off. Saved places still work on this device."
      action={<LinkButton to="/">Back to Discover</LinkButton>}
    />
  )
}
