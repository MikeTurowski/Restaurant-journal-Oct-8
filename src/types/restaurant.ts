export type RestaurantCategory = 'fully_vegan' | 'vegan_options'

export interface Dish {
  id: string
  restaurantId: string
  name: string
  description?: string
  /** e.g. "Ask for no butter" */
  note?: string
}

export interface Restaurant {
  id: string
  slug: string
  name: string
  category: RestaurantCategory
  cuisines: string[]
  address: string
  lat: number
  lng: number
  phone?: string
  websiteUrl?: string
  /** Simple display strings, e.g. "Mon–Fri 11am–9pm" */
  hours?: string[]
  priceLevel?: 1 | 2 | 3 | 4
  veganDishes: Dish[]
  /** ISO date, e.g. "2026-09-14" */
  lastChecked?: string
  /** e.g. "Confirmed with staff" or "From menu, not confirmed" */
  verificationNote?: string
}
