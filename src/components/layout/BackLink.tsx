import { useLocation, useNavigate } from 'react-router'
import { ArrowLeftIcon } from '@/components/ui/icons'

/** Goes back in history when there is some (keeps filters/map view), else to Discover. */
export function BackLink({
  fallbackTo = '/',
  children,
}: {
  fallbackTo?: string
  children: string
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const hasHistory = location.key !== 'default'
  return (
    <button
      type="button"
      onClick={() => (hasHistory ? navigate(-1) : navigate(fallbackTo))}
      className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-sm font-medium text-ink-muted hover:text-ink"
    >
      <ArrowLeftIcon width={18} height={18} />
      {children}
    </button>
  )
}
