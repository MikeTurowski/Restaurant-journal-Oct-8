import { SegmentedControl, type SegmentOption } from '@/components/ui/SegmentedControl'
import type { CategoryFilter as CategoryFilterValue } from '@/lib/filterRestaurants'

const options: SegmentOption<CategoryFilterValue>[] = [
  { value: 'all', label: 'All' },
  { value: 'fully_vegan', label: 'Fully vegan' },
  { value: 'vegan_options', label: 'Vegan options' },
]

interface CategoryFilterProps {
  value: CategoryFilterValue
  onChange: (value: CategoryFilterValue) => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <SegmentedControl
      legend="Category"
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
