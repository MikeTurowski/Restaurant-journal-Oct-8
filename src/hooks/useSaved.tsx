import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/auth/AuthContext'
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
  const { status, user } = useAuth()
  // `undefined` while we don't yet know whether someone is signed in.
  const userId = status === 'loading' ? undefined : (user?.id ?? null)

  // Ids are tagged with the account they belong to, so a different user (or signing
  // out) never briefly sees someone else's list while the new one loads.
  const [loaded, setLoaded] = useState<{ owner: string | null; ids: string[] } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId === undefined) return
    let cancelled = false
    repository.listSavedRestaurantIds().then(
      (ids) => {
        if (!cancelled) setLoaded({ owner: userId, ids })
      },
      () => {
        if (!cancelled) setLoaded({ owner: userId, ids: [] })
      },
    )
    return () => {
      cancelled = true
    }
  }, [repository, userId])

  const ready = userId !== undefined && loaded?.owner === userId
  const ids = useMemo(() => (ready ? loaded.ids : []), [ready, loaded])

  const toggleSaved = useCallback(
    (id: string) => {
      if (userId === undefined || !ready) return
      const previous = ids
      // Optimistic update, rolled back if the repository rejects.
      setLoaded({
        owner: userId,
        ids: previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id],
      })
      setError(null)
      repository.toggleSaved(id).then(
        (next) => setLoaded({ owner: userId, ids: next }),
        (reason: unknown) => {
          setLoaded({ owner: userId, ids: previous })
          setError(
            reason instanceof Error ? reason.message : 'Could not update saved places.',
          )
        },
      )
    },
    [ids, ready, repository, userId],
  )

  const value = useMemo<SavedContextValue>(() => {
    const set = new Set(ids)
    return {
      savedIds: set,
      loading: !ready,
      error,
      isSaved: (id) => set.has(id),
      toggleSaved,
      dismissError: () => setError(null),
    }
  }, [ids, ready, error, toggleSaved])

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSaved(): SavedContextValue {
  const value = useContext(SavedContext)
  if (!value) throw new Error('useSaved must be used within a SavedProvider')
  return value
}
