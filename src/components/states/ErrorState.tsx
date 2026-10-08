import { AlertIcon } from '@/components/ui/icons'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn’t load this right now.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-card border border-accent bg-accent-soft px-6 py-12 text-center text-accent-soft-ink"
    >
      <AlertIcon width={28} height={28} />
      <h2 className="text-xl">{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-control bg-accent-soft-ink px-5 text-sm font-semibold text-accent-soft transition-opacity duration-150 hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  )
}
