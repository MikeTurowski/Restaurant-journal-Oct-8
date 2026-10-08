import { useCallback } from 'react'
import { useRepository } from '@/data/RepositoryContext'
import { useAsync } from './useAsync'

/** Resolves to `null` data when the slug doesn't exist (render a not-found state). */
export function useRestaurant(slug: string) {
  const repository = useRepository()
  const load = useCallback(() => repository.getRestaurantBySlug(slug), [repository, slug])
  return useAsync(load)
}
