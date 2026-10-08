import { createContext, useContext, useMemo, type ReactNode } from 'react'
import {
  createMockRestaurantRepository,
  mockOptionsFromSearch,
} from './mockRestaurantRepository'
import type { RestaurantRepository } from './repository'
import { getSupabaseClient } from './supabaseClient'
import { createSupabaseRestaurantRepository } from './supabaseRestaurantRepository'

const RepositoryContext = createContext<RestaurantRepository | null>(null)

/**
 * Single place that chooses which repository the app uses.
 * Supabase when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set, otherwise the
 * mock data. Add `?data=mock` to the URL to force the mock repository (demo/offline).
 */
function createDefaultRepository(): RestaurantRepository {
  const { search } = window.location
  const client = getSupabaseClient()
  const forceMock = new URLSearchParams(search).get('data') === 'mock'

  if (client && !forceMock) {
    return createSupabaseRestaurantRepository({ client })
  }
  return createMockRestaurantRepository(mockOptionsFromSearch(search))
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
