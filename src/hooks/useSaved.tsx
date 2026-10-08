import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRepository } from '@/data/RepositoryContext'

interface SavedContextValue {
  savedIds: ReadonlySet<string>
  /** True until the initial saved list has been read. */
  loading: boolean
  /** Set when the last toggle failed (the change is rolled back). */
  error: string | null
  isSaved: (id: string) => boolean
  toggleSaved: (id: string) => void
  dismissError: () => void
}

const SavedContext = createContext<SavedContextValue | null>(null)

export function SavedProvider({ children }: { children: ReactNode }) {
  const repository = useRepository()
  const [ids, setIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    repository.listSavedRestaurantIds().then(
      (saved) => {
        if (cancelled) return
        setIds(saved)
        setLoading(false)
      },
      () => {
        if (cancelled) return
        setLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
  }, [repository])

  const toggleSaved = useCallback(
    (id: string) => {
      const previous = ids
      // Optimistic update, rolled back if the repository rejects.
      setIds(previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id])
      setError(null)
      repository.toggleSaved(id).then(setIds, (reason: unknown) => {
        setIds(previous)
        setError(
          reason instanceof Error ? reason.message : 'Could not update saved places.',
        )
      })
    },
    [ids, repository],
  )

  const value = useMemo<SavedContextValue>(() => {
    const set = new Set(ids)
    return {
      savedIds: set,
      loading,
      error,
      isSaved: (id) => set.has(id),
      toggleSaved,
      dismissError: () => setError(null),
    }
  }, [ids, loading, error, toggleSaved])

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSaved(): SavedContextValue {
  const value = useContext(SavedContext)
  if (!value) throw new Error('useSaved must be used within a SavedProvider')
  return value
}
