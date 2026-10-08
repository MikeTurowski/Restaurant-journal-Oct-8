export function CuisineTags({ cuisines }: { cuisines: readonly string[] }) {
  if (cuisines.length === 0) return null
  return (
    <ul aria-label="Cuisines" className="flex flex-wrap gap-1.5">
      {cuisines.map((cuisine) => (
        <li
          key={cuisine}
          className="rounded-chip bg-surface-muted px-2.5 py-0.5 text-xs text-ink-muted"
        >
          {cuisine}
        </li>
      ))}
    </ul>
  )
}
