# Eugene Vegan Finder

A mobile-first web app that helps vegan diners in Eugene, OR find (1) fully vegan restaurants, (2) restaurants with vegan options, and (3) the specific dishes that are vegan.

> **Front end only.** All data is fictional placeholder data served by a mock repository. No back end, no Supabase client yet.

## Features

- **Discover**: browse as a list or a map (toggle). Filter by category (All / Fully vegan / Vegan options) and cuisine. Filters and view live in the URL, so refresh, back/forward and shared links work.
- **Restaurant detail**: address, hours, phone/website, category, known vegan dishes (with tips like "ask for no butter"), a verification note, and a "last checked" date. Actions: get directions (opens maps) and save.
- **Saved**: your saved restaurants, persisted to `localStorage`.
- Loading, empty and error states on every data-driven screen; light and dark mode; reduced-motion support; keyboard and screen-reader friendly.

## Setup

Requires Node 20+.

```bash
npm install
npm run dev
```

| Script              | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                         |
| `npm run build`     | Type-check (`tsc -b`) and build for production    |
| `npm run preview`   | Serve the production build locally                |
| `npm run typecheck` | Type-check only                                   |
| `npm run lint`      | ESLint (typescript-eslint, react-hooks, jsx-a11y) |
| `npm run format`    | Format with Prettier                              |
| `npm test`          | Run Vitest once (`test:watch` to watch)           |

### Demo switches

The mock repository reads two optional query params so you can show off the non-happy paths:

- `/?mockError=1` makes every read fail, to see the error state and the "Try again" button.
- `/?mockDelay=3000` sets simulated latency (ms), to linger on loading states.

## Tech stack

React 19 · TypeScript (strict, `noUncheckedIndexedAccess`) · Vite · React Router · Tailwind CSS v4 · react-leaflet + OpenStreetMap tiles (no API key) · Vitest + React Testing Library · ESLint + Prettier.

Design tokens (colors, type scale, radii, shadows, motion, dark-mode values) are defined in [`src/styles/index.css`](src/styles/index.css) using Tailwind v4's CSS-first `@theme`.

## Project structure

```
src/
  types/        Restaurant, Dish, RestaurantCategory
  data/         RestaurantRepository interface, mock implementation, mock data, React context
  hooks/        useRestaurants, useRestaurant, useSaved, useDiscoverFilters, useAsync, …
  lib/          Pure helpers: filterRestaurants, formatLastChecked, directions
  components/
    layout/     AppShell, MainNav (bottom bar on mobile, header nav on md+), BackLink
    restaurant/ RestaurantCard, CategoryBadge, DishList, SaveButton, …
    filters/    CategoryFilter, CuisineFilter, ViewToggle
    map/        RestaurantMap (lazy-loaded), category markers, preview card
    states/     LoadingList, EmptyState, ErrorState
    ui/         Icons, SegmentedControl, LinkButton
  pages/        DiscoverPage, RestaurantDetailPage, SavedPage, NotFoundPage
```

## Data layer and the plan for Supabase

Components never import mock data. They go through a `RestaurantRepository` ([`src/data/repository.ts`](src/data/repository.ts)):

```ts
interface RestaurantRepository {
  listRestaurants(): Promise<Restaurant[]>
  getRestaurantBySlug(slug: string): Promise<Restaurant | null>
  listSavedRestaurantIds(): Promise<string[]>
  toggleSaved(id: string): Promise<string[]>
}
```

`RepositoryProvider` ([`src/data/RepositoryContext.tsx`](src/data/RepositoryContext.tsx)) is the **only** place that decides which implementation the app uses; hooks reach it via `useRepository()`.

To connect Supabase later:

1. `npm install @supabase/supabase-js`, copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
2. Create `src/data/supabaseRestaurantRepository.ts` implementing `RestaurantRepository`. Map database rows (snake_case) to the `Restaurant` / `Dish` types in one place.
3. Suggested schema: a `restaurants` table (matching the `Restaurant` fields; `cuisines text[]`, `hours text[]`) and a `dishes` table with a `restaurant_id` foreign key. Add read-only Row Level Security policies for anonymous users.
4. In `createDefaultRepository()` return the Supabase repository when `import.meta.env.VITE_SUPABASE_URL` is set, otherwise the mock one.
5. Replace the placeholder data in `src/data/mockRestaurants.ts` (kept as the offline/demo fallback and test fixture) with hand-verified real restaurants in the database.

**Saved restaurants:** these are per-user, so syncing them across devices needs authentication, which is out of scope for now. Until auth exists, keep `toggleSaved` / `listSavedRestaurantIds` on `localStorage` (the Supabase repository can delegate those two methods to the existing local implementation), then move them to a `saved_restaurants` table keyed by user id.

Filtering currently happens client-side in the pure `filterRestaurants` function. If the dataset grows, push category/cuisine filters into the repository query.

## Placeholder data

Everything in [`src/data/mockRestaurants.ts`](src/data/mockRestaurants.ts) is fictional: business names, dishes, phone numbers (`555-01xx`) and URLs (`example.com`). Neighborhoods and street names are real; street numbers and coordinates are approximate. The app shows a "Demo data" strip so nobody mistakes it for real listings. Replace it with hand-verified restaurants before real use.

## Accessibility notes

- Semantic landmarks, a skip link, visible focus rings, 44px minimum touch targets.
- Category is never conveyed by color alone (label + icon + marker shape).
- Filters are native radio groups / `<select>`; the map has a text alternative (the List view) and keyboard-focusable markers; `Esc` closes the map preview.
- Honors `prefers-reduced-motion` and `prefers-color-scheme`.

## Out of scope (for now)

Authentication, user reviews, submitting or editing restaurants, server code, and any Supabase integration.
