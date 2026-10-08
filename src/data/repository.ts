import type { Restaurant } from '@/types/restaurant'

/**
 * The only way the UI talks to data. Swap the implementation (mock → Supabase)
 * without touching any component.
 */
export interface RestaurantRepository {
  listRestaurants(): Promise<Restaurant[]>
  /** Resolves to `null` when no restaurant has that slug. */
  getRestaurantBySlug(slug: string): Promise<Restaurant | null>
  listSavedRestaurantIds(): Promise<string[]>
  /** Adds or removes the id and resolves to the updated list of saved ids. */
  toggleSaved(id: string): Promise<string[]>
}
