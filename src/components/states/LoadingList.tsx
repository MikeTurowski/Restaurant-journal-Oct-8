export function LoadingList({
  count = 6,
  label = 'Loading restaurants',
}: {
  count?: number
  label?: string
}) {
  return (
    <div role="status" aria-live="polite" className="contents">
      <span className="sr-only">{label}…</span>
      <ul aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <li
            key={i}
            className="animate-shimmer space-y-3 rounded-card border border-line bg-surface p-4"
          >
            <div className="h-5 w-24 rounded-chip bg-surface-muted" />
            <div className="h-6 w-3/4 rounded-md bg-surface-muted" />
            <div className="h-4 w-1/2 rounded-md bg-surface-muted" />
            <div className="h-4 w-full rounded-md bg-surface-muted" />
            <div className="h-3 w-1/3 rounded-md bg-surface-muted" />
          </li>
        ))}
      </ul>
    </div>
  )
}
