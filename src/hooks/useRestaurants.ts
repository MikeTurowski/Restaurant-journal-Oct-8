import { useCallback } from 'react'
import { useRepository } from '@/data/RepositoryContext'
import { useAsync } from './useAsync'

export function useRestaurants() {
  const repository = useRepository()
  const load = useCallback(() => repository.listRestaurants(), [repository])
  return useAsync(load)
}
