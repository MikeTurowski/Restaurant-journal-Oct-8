import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AuthProvider } from '@/auth/AuthContext'
import { createMockRestaurantRepository } from '@/data/mockRestaurantRepository'
import { mockRestaurants } from '@/data/mockRestaurants'
import { RepositoryProvider } from '@/data/RepositoryContext'
import { SavedProvider } from '@/hooks/useSaved'
import type { Restaurant } from '@/types/restaurant'
import { RestaurantCard } from './RestaurantCard'

function renderCard(restaurant: Restaurant) {
  const store = new Map<string, string>()
  const repository = createMockRestaurantRepository({
    delayMs: 0,
    storage: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
    },
  })
  return render(
    <MemoryRouter>
      <RepositoryProvider repository={repository}>
        <AuthProvider service={null}>
          <SavedProvider>
            <RestaurantCard restaurant={restaurant} />
          </SavedProvider>
        </AuthProvider>
      </RepositoryProvider>
    </MemoryRouter>,
  )
}

const bySlug = (slug: string) => {
  const found = mockRestaurants.find((r) => r.slug === slug)
  if (!found) throw new Error(`missing fixture ${slug}`)
  return found
}

describe('RestaurantCard', () => {
  it('shows name, category, cuisines and a dish preview', () => {
    renderCard(bySlug('moss-and-marrow'))
    expect(screen.getByRole('heading', { name: 'Moss & Marrow' })).toBeInTheDocument()
    expect(screen.getByText('Fully vegan')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Cuisines' })).toHaveTextContent(
      'Comfort food',
    )
    expect(screen.getByText(/Smoked Mushroom Melt/)).toBeInTheDocument()
  })

  it('labels vegan-options places differently from fully vegan ones', () => {
    renderCard(bySlug('the-gentle-fork'))
    expect(screen.getByText('Vegan options')).toBeInTheDocument()
    expect(screen.queryByText('Fully vegan')).not.toBeInTheDocument()
  })

  it('summarises dishes beyond the first three', () => {
    renderCard(bySlug('fairmount-fig-and-fennel')) // 4 dishes
    expect(screen.getByText(/\+1 more/)).toBeInTheDocument()
  })

  it('links to the detail page', () => {
    renderCard(bySlug('moss-and-marrow'))
    expect(screen.getByRole('link', { name: 'Moss & Marrow' })).toHaveAttribute(
      'href',
      '/restaurants/moss-and-marrow',
    )
  })

  it('toggles saved state', async () => {
    const user = userEvent.setup()
    renderCard(bySlug('moss-and-marrow'))
    const button = screen.getByRole('button', { name: 'Save Moss & Marrow' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    await user.click(button)
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'))
    await user.click(button)
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'))
  })
})
