import { ClockIcon } from '@/components/ui/icons'
import { describeLastChecked } from '@/lib/formatLastChecked'

interface LastCheckedProps {
  lastChecked: string | undefined
  /** Injectable for tests/stories. */
  now?: Date
}

export function LastChecked({ lastChecked, now }: LastCheckedProps) {
  const { label, stale } = describeLastChecked(lastChecked, now)
  const content = (
    <>
      <ClockIcon width={14} height={14} />
      <span>{label}</span>
      {stale && <span className="sr-only"> — this information may be out of date</span>}
    </>
  )
  const className = `inline-flex items-center gap-1 text-xs ${stale ? 'text-warn-ink' : 'text-ink-muted'}`
  return lastChecked ? (
    <time dateTime={lastChecked} className={className}>
      {content}
    </time>
  ) : (
    <span className={className}>{content}</span>
  )
}
