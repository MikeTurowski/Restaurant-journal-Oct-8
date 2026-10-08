import { ListIcon, MapIcon } from '@/components/ui/icons'
import { SegmentedControl, type SegmentOption } from '@/components/ui/SegmentedControl'
import type { DiscoverView } from '@/hooks/useDiscoverFilters'

const options: SegmentOption<DiscoverView>[] = [
  { value: 'list', label: 'List', icon: <ListIcon width={18} height={18} /> },
  { value: 'map', label: 'Map', icon: <MapIcon width={18} height={18} /> },
]

export function ViewToggle({
  value,
  onChange,
}: {
  value: DiscoverView
  onChange: (value: DiscoverView) => void
}) {
  return (
    <SegmentedControl legend="View" options={options} value={value} onChange={onChange} />
  )
}
