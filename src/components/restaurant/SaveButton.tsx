import { HeartIcon } from '@/components/ui/icons'
import { useSaved } from '@/hooks/useSaved'

interface SaveButtonProps {
  restaurantId: string
  restaurantName: string
  /** `icon` is a compact 44px button for cards; `full` shows a text label. */
  variant?: 'icon' | 'full'
}

export function SaveButton({
  restaurantId,
  restaurantName,
  variant = 'icon',
}: SaveButtonProps) {
  const { isSaved, toggleSaved } = useSaved()
  const saved = isSaved(restaurantId)

  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-control transition-colors duration-150'
  const tone = saved ? 'text-accent' : 'text-ink-muted hover:text-ink'

  if (variant === 'full') {
    return (
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => toggleSaved(restaurantId)}
        className={`${base} border border-line bg-surface px-4 text-sm font-semibold hover:bg-surface-muted ${saved ? 'text-accent' : 'text-ink'}`}
      >
        <HeartIcon filled={saved} />
        {saved ? 'Saved' : 'Save'}
        <span className="sr-only"> {restaurantName}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${restaurantName}`}
      onClick={() => toggleSaved(restaurantId)}
      className={`${base} w-11 hover:bg-surface-muted ${tone}`}
    >
      <HeartIcon filled={saved} />
    </button>
  )
}
