import { toRestaurant, type RestaurantRow } from './supabaseRestaurantRepository'

const row: RestaurantRow = {
  id: 'abc',
  slug: 'moss-and-marrow',
  name: 'Moss & Marrow',
  category: 'fully_vegan',
  cuisines: ['American'],
  address: '420 Willamette St',
  lat: 44.05,
  lng: -123.09,
  phone: null,
  website_url: 'https://example.com',
  hours: null,
  price_level: 2,
  last_checked: '2026-09-20',
  verification_note: null,
  dishes: [
    {
      id: 'd2',
      restaurant_id: 'abc',
      name: 'Second',
      description: null,
      note: 'Ask nicely',
      sort_order: 1,
    },
    {
      id: 'd1',
      restaurant_id: 'abc',
      name: 'First',
      description: 'Tasty',
      note: null,
      sort_order: 0,
    },
  ],
}

describe('toRestaurant', () => {
  it('maps snake_case columns to the Restaurant type', () => {
    const r = toRestaurant(row)
    expect(r).toMatchObject({
      id: 'abc',
      websiteUrl: 'https://example.com',
      priceLevel: 2,
      lastChecked: '2026-09-20',
      category: 'fully_vegan',
    })
  })

  it('turns null columns into omitted optional fields', () => {
    const r = toRestaurant(row)
    expect(r.phone).toBeUndefined()
    expect(r.hours).toBeUndefined()
    expect(r.verificationNote).toBeUndefined()
  })

  it('orders dishes by sort_order and maps their fields', () => {
    const { veganDishes } = toRestaurant(row)
    expect(veganDishes.map((d) => d.name)).toEqual(['First', 'Second'])
    expect(veganDishes[0]).toEqual({
      id: 'd1',
      restaurantId: 'abc',
      name: 'First',
      description: 'Tasty',
      note: undefined,
    })
  })

  it('drops out-of-range price levels', () => {
    expect(toRestaurant({ ...row, price_level: 9 }).priceLevel).toBeUndefined()
    expect(toRestaurant({ ...row, price_level: null }).priceLevel).toBeUndefined()
  })

  it('refuses unknown categories instead of guessing', () => {
    expect(() => toRestaurant({ ...row, category: 'mostly_vegan' })).toThrow(/category/)
  })
})
