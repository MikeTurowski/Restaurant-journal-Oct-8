import type { SupabaseClient } from '@supabase/supabase-js'
import type { Dish, Restaurant, RestaurantCategory } from '@/types/restaurant'
import { createLocalSavedStore, type SavedStorage } from './localSavedStore'
import type { RestaurantRepository } from './repository'

export const SUPABASE_SAVED_STORAGE_KEY = 'eugene-vegan-finder:saved:supabase'

/** Shape of the rows PostgREST returns for `restaurants` with embedded `dishes`. */
export interface DishRow {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  note: string | null
  sort_order: number
}

export interface RestaurantRow {
  id: string
  slug: string
  name: string
  category: string
  cuisines: string[]
  address: string
  lat: number
  lng: number
  phone: string | null
  website_url: string | null
  hours: string[] | null
  price_level: number | null
  last_checked: string | null
  verification_note: string | null
  dishes: DishRow[]
}

const SELECT = '*, dishes(*)'

function toCategory(value: string): RestaurantCategory {
  // Never guess: mislabeling a place as fully vegan would be worse than failing loudly.
  if (value === 'fully_vegan' || value === 'vegan_options') return value
  throw new Error(`Unknown restaurant category: ${value}`)
}

function toPriceLevel(value: number | null): Restaurant['priceLevel'] {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : undefined
}

function toDish(row: DishRow): Dish {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    description: row.description ?? undefined,
    note: row.note ?? undefined,
  }
}

/** Maps a database row (snake_case, nullable) to the app's `Restaurant` type. */
export function toRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: toCategory(row.category),
    cuisines: row.cuisines,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    phone: row.phone ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    hours: row.hours ?? undefined,
    priceLevel: toPriceLevel(row.price_level),
    veganDishes: [...row.dishes].sort((a, b) => a.sort_order - b.sort_order).map(toDish),
    lastChecked: row.last_checked ?? undefined,
    verificationNote: row.verification_note ?? undefined,
  }
}

export interface SupabaseRepositoryOptions {
  client: SupabaseClient
  /** Device storage used for saved restaurants while signed out. */
  storage?: SavedStorage
}

export function createSupabaseRestaurantRepository(
  options: SupabaseRepositoryOptions,
): RestaurantRepository {
  const {
    client,
    storage = typeof localStorage === 'undefined' ? undefined : localStorage,
  } = options
  const local = createLocalSavedStore(SUPABASE_SAVED_STORAGE_KEY, storage)

  const currentUserId = async (): Promise<string | null> => {
    const { data } = await client.auth.getSession()
    return data.session?.user.id ?? null
  }

  const fetchAccountSaved = async (): Promise<string[]> => {
    const { data, error } = await client
      .from('saved_restaurants')
      .select('restaurant_id')
      .order('created_at')
      .overrideTypes<{ restaurant_id: string }[], { merge: false }>()
    if (error) throw new Error('Could not load saved places.', { cause: error })
    return data.map((row) => row.restaurant_id)
  }

  /** Places saved on this device while signed out move into the account on sign-in. */
  const mergeLocalIntoAccount = async (userId: string): Promise<void> => {
    const ids = local.list()
    if (ids.length === 0) return
    const { error } = await client.from('saved_restaurants').upsert(
      ids.map((restaurant_id) => ({ user_id: userId, restaurant_id })),
      { onConflict: 'user_id,restaurant_id', ignoreDuplicates: true },
    )
    // On failure keep the local copy so nothing is lost; we'll retry next time.
    if (!error) local.clear()
  }

  return {
    async listRestaurants() {
      const { data, error } = await client
        .from('restaurants')
        .select(SELECT)
        .order('name')
        .overrideTypes<RestaurantRow[], { merge: false }>()
      if (error) throw new Error('Could not load restaurants.', { cause: error })
      return data.map(toRestaurant)
    },

    async getRestaurantBySlug(slug) {
      const { data, error } = await client
        .from('restaurants')
        .select(SELECT)
        .eq('slug', slug)
        .maybeSingle<RestaurantRow>()
      if (error) throw new Error('Could not load this restaurant.', { cause: error })
      return data ? toRestaurant(data) : null
    },

    // Signed in: saved places live in the account (RLS limits rows to the owner).
    // Signed out: they stay on this device.
    async listSavedRestaurantIds() {
      const userId = await currentUserId()
      if (!userId) return local.list()
      await mergeLocalIntoAccount(userId)
      return fetchAccountSaved()
    },

    async toggleSaved(id) {
      const userId = await currentUserId()
      if (!userId) return local.toggle(id)

      const { data: existing, error: lookupError } = await client
        .from('saved_restaurants')
        .select('restaurant_id')
        .eq('restaurant_id', id)
        .maybeSingle()
      if (lookupError)
        throw new Error('Could not update saved places.', { cause: lookupError })

      const { error } = existing
        ? await client.from('saved_restaurants').delete().eq('restaurant_id', id)
        : await client
            .from('saved_restaurants')
            .insert({ user_id: userId, restaurant_id: id })
      if (error) throw new Error('Could not update saved places.', { cause: error })

      return fetchAccountSaved()
    },
  }
}
