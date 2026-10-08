export type SavedStorage = Pick<Storage, 'getItem' | 'setItem'>

export interface SavedStore {
  list(): string[]
  /** Adds or removes the id and returns the updated list. Throws if storage is unavailable. */
  toggle(id: string): string[]
  /** Forgets all locally saved ids (used after merging them into an account). */
  clear(): void
}

/**
 * Saved restaurants live on the device for now. Per-user, cross-device saving
 * needs authentication, which is out of scope. Each repository passes its own
 * key so ids from different data sources never mix.
 */
export function createLocalSavedStore(
  key: string,
  storage: SavedStorage | undefined,
): SavedStore {
  const read = (): string[] => {
    try {
      const raw = storage?.getItem(key)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === 'string')
        : []
    } catch {
      return []
    }
  }

  return {
    list: read,
    clear() {
      try {
        storage?.setItem(key, '[]')
      } catch {
        // Nothing useful to do if storage is unavailable.
      }
    },
    toggle(id) {
      const current = read()
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
      try {
        storage?.setItem(key, JSON.stringify(next))
      } catch {
        throw new Error('Could not save to this browser.')
      }
      return next
    },
  }
}
