import { mockRestaurants } from '@/data/mockRestaurants'
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  filterRestaurants,
  isCategoryFilter,
  listCuisines,
} from './filterRestaurants'

describe('filterRestaurants', () => {
  it('returns everything with default filters', () => {
    expect(filterRestaurants(mockRestaurants, DEFAULT_FILTERS)).toHaveLength(
      mockRestaurants.length,
    )
  })

  it('filters by category', () => {
    const result = filterRestaurants(mockRestaurants, {
      category: 'fully_vegan',
      cuisine: null,
    })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((r) => r.category === 'fully_vegan')).toBe(true)
  })

  it('filters by cuisine, ignoring case', () => {
    const result = filterRestaurants(mockRestaurants, {
      category: 'all',
      cuisine: 'thai',
    })
    expect(result.map((r) => r.slug)).toEqual(['south-hills-thai-kitchen'])
  })

  it('combines category and cuisine', () => {
    const none = filterRestaurants(mockRestaurants, {
      category: 'fully_vegan',
      cuisine: 'Thai',
    })
    expect(none).toEqual([])
    const some = filterRestaurants(mockRestaurants, {
      category: 'vegan_options',
      cuisine: 'American',
    })
    expect(some.map((r) => r.slug)).toContain('the-gentle-fork')
  })

  it('does not mutate its input', () => {
    const copy = [...mockRestaurants]
    filterRestaurants(mockRestaurants, { category: 'fully_vegan', cuisine: null })
    expect(mockRestaurants).toEqual(copy)
  })
})

describe('listCuisines', () => {
  it('returns unique, sorted cuisines', () => {
    const cuisines = listCuisines(mockRestaurants)
    expect(new Set(cuisines).size).toBe(cuisines.length)
    expect(cuisines).toEqual([...cuisines].sort((a, b) => a.localeCompare(b)))
  })
})

describe('helpers', () => {
  it('validates category values', () => {
    expect(isCategoryFilter('all')).toBe(true)
    expect(isCategoryFilter('fully_vegan')).toBe(true)
    expect(isCategoryFilter('nope')).toBe(false)
    expect(isCategoryFilter(null)).toBe(false)
  })

  it('counts active filters', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0)
    expect(countActiveFilters({ category: 'fully_vegan', cuisine: 'Thai' })).toBe(2)
  })
})
