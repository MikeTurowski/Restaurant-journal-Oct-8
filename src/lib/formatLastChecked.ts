export const STALE_AFTER_DAYS = 90

export interface LastCheckedInfo {
  /** Short text such as "Checked 12 days ago". */
  label: string
  /** True when the info is old or was never checked. */
  stale: boolean
}

function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** `now` is injectable so tests stay deterministic. */
export function describeLastChecked(
  iso: string | undefined,
  now: Date = new Date(),
): LastCheckedInfo {
  const date = iso ? parseIsoDate(iso) : null
  if (!date) return { label: 'Not yet checked', stale: true }

  const days = Math.max(
    0,
    Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000),
  )
  const stale = days > STALE_AFTER_DAYS

  if (days === 0) return { label: 'Checked today', stale }
  if (days === 1) return { label: 'Checked yesterday', stale }
  if (days < 30) return { label: `Checked ${days} days ago`, stale }
  const months = Math.floor(days / 30)
  if (months < 12) {
    return { label: `Checked ${months} ${months === 1 ? 'month' : 'months'} ago`, stale }
  }
  const years = Math.floor(days / 365)
  return { label: `Checked ${years} ${years === 1 ? 'year' : 'years'} ago`, stale }
}

export function formatCheckedDate(iso: string | undefined): string | null {
  const date = iso ? parseIsoDate(iso) : null
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
