import { createContext, useContext, useMemo, type ReactNode } from 'react'
import {
  createMockRestaurantRepository,
  mockOptionsFromSearch,
} from './mockRestaurantRepository'
import type { RestaurantRepository } from './repository'

const RepositoryContext = createContext<RestaurantRepository | null>(null)

/**
 * Single place that chooses which repository the app uses.
 * To go live: build a SupabaseRestaurantRepository and return it here
 * (e.g. when import.meta.env.VITE_SUPABASE_URL is set).
 */
function createDefaultRepository(): RestaurantRepository {
  return createMockRestaurantRepository(mockOptionsFromSearch(window.location.search))
}

export function RepositoryProvider({
  repository,
  children,
}: {
  repository?: RestaurantRepository
  children: ReactNode
}) {
  const value = useMemo(() => repository ?? createDefaultRepository(), [repository])
  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRepository(): RestaurantRepository {
  const repo = useContext(RepositoryContext)
  if (!repo) throw new Error('useRepository must be used within a RepositoryProvider')
  return repo
}
