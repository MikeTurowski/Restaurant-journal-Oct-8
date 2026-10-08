import {
  createMockRestaurantRepository,
  mockOptionsFromSearch,
  SAVED_STORAGE_KEY,
} from './mockRestaurantRepository'
import { mockRestaurants } from './mockRestaurants'

function memoryStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  }
}

const fast = { delayMs: 0 }

describe('mockRestaurantRepository', () => {
  it('lists restaurants', async () => {
    const repo = createMockRestaurantRepository({ ...fast, storage: memoryStorage() })
    const list = await repo.listRestaurants()
    expect(list).toHaveLength(mockRestaurants.length)
  })

  it('returns copies so callers cannot mutate the source data', async () => {
    const repo = createMockRestaurantRepository({ ...fast, storage: memoryStorage() })
    const [first] = await repo.listRestaurants()
    first!.name = 'Changed'
    const [again] = await repo.listRestaurants()
    expect(again!.name).not.toBe('Changed')
  })

  it('finds a restaurant by slug and returns null when missing', async () => {
    const repo = createMockRestaurantRepository({ ...fast, storage: memoryStorage() })
    const found = await repo.getRestaurantBySlug('moss-and-marrow')
    expect(found?.name).toBe('Moss & Marrow')
    expect(await repo.getRestaurantBySlug('does-not-exist')).toBeNull()
  })

  it('rejects reads when failReads is on', async () => {
    const repo = createMockRestaurantRepository({
      ...fast,
      failReads: true,
      storage: memoryStorage(),
    })
    await expect(repo.listRestaurants()).rejects.toThrow()
    await expect(repo.getRestaurantBySlug('moss-and-marrow')).rejects.toThrow()
  })

  it('toggles saved ids and persists them', async () => {
    const storage = memoryStorage()
    const repo = createMockRestaurantRepository({ ...fast, storage })
    expect(await repo.listSavedRestaurantIds()).toEqual([])
    expect(await repo.toggleSaved('r1')).toEqual(['r1'])
    expect(await repo.toggleSaved('r2')).toEqual(['r1', 'r2'])
    expect(JSON.parse(storage.getItem(SAVED_STORAGE_KEY)!)).toEqual(['r1', 'r2'])
    expect(await repo.toggleSaved('r1')).toEqual(['r2'])
    expect(await repo.listSavedRestaurantIds()).toEqual(['r2'])
  })

  it('ignores corrupted storage', async () => {
    const repo = createMockRestaurantRepository({
      ...fast,
      storage: memoryStorage({ [SAVED_STORAGE_KEY]: '{not json' }),
    })
    expect(await repo.listSavedRestaurantIds()).toEqual([])
  })
})

describe('mockOptionsFromSearch', () => {
  it('reads demo switches from the query string', () => {
    expect(mockOptionsFromSearch('?mockError=1&mockDelay=1500')).toEqual({
      failReads: true,
      delayMs: 1500,
    })
    expect(mockOptionsFromSearch('')).toEqual({})
  })
})
