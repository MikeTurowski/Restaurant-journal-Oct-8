import type { Restaurant } from '@/types/restaurant'
import { createLocalSavedStore, type SavedStorage } from './localSavedStore'
import { mockRestaurants } from './mockRestaurants'
import type { RestaurantRepository } from './repository'

export const SAVED_STORAGE_KEY = 'eugene-vegan-finder:saved'

export interface MockRepositoryOptions {
  /** Simulated network latency in ms. */
  delayMs?: number
  /** When true, every read rejects. Handy for demoing error states. */
  failReads?: boolean
  data?: Restaurant[]
  storage?: SavedStorage
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function createMockRestaurantRepository(
  options: MockRepositoryOptions = {},
): RestaurantRepository {
  const {
    delayMs = 450,
    failReads = false,
    data = mockRestaurants,
    storage = typeof localStorage === 'undefined' ? undefined : localStorage,
  } = options

  const saved = createLocalSavedStore(SAVED_STORAGE_KEY, storage)

  const simulate = async () => {
    await wait(delayMs)
    if (failReads) throw new Error('Could not reach the restaurant service.')
  }

  return {
    async listRestaurants() {
      await simulate()
      return structuredClone(data)
    },
    async getRestaurantBySlug(slug) {
      await simulate()
      const found = data.find((r) => r.slug === slug)
      return found ? structuredClone(found) : null
    },
    async listSavedRestaurantIds() {
      await wait(Math.min(delayMs, 120))
      return saved.list()
    },
    async toggleSaved(id) {
      return saved.toggle(id)
    },
  }
}

/** Dev/demo switches: ?mockError=1 and ?mockDelay=2000 */
export function mockOptionsFromSearch(search: string): MockRepositoryOptions {
  const params = new URLSearchParams(search)
  const options: MockRepositoryOptions = {}
  if (params.get('mockError') === '1') options.failReads = true
  const delay = Number(params.get('mockDelay'))
  if (params.has('mockDelay') && Number.isFinite(delay) && delay >= 0) {
    options.delayMs = Math.min(delay, 10_000)
  }
  return options
}
