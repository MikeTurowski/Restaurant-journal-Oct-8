# Eugene Vegan Finder

A mobile-first web app that helps vegan diners in Eugene, OR find (1) fully vegan restaurants, (2) restaurants with vegan options, and (3) the specific dishes that are vegan.

> The app reads restaurants from **Supabase** when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, and falls back to built-in **mock data** when they aren't. All restaurants are fictional placeholders for now.

## Features

- **Discover**: browse as a list or a map (toggle). Filter by category (All / Fully vegan / Vegan options) and cuisine. Filters and view live in the URL, so refresh, back/forward and shared links work.
- **Restaurant detail**: address, hours, phone/website, category, known vegan dishes (with tips like "ask for no butter"), a verification note, and a "last checked" date. Actions: get directions (opens maps) and save.
- **Saved**: your saved restaurants. Signed out they live on this device; signed in they sync to your account.
- **Accounts**: register, sign in, forgot/reset password, and an Account page (edit display name, change password, sign out). Email + password via Supabase Auth.
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

## Data layer and Supabase

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

### Supabase

`createDefaultRepository()` picks the implementation:

- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set → [`supabaseRestaurantRepository.ts`](src/data/supabaseRestaurantRepository.ts)
- otherwise (or with `?data=mock` in the URL) → the mock repository

**Setup**

1. Copy `.env.example` to `.env.local` and fill in your project URL and **publishable (anon) key**. `.env.local` is git-ignored. Restart `npm run dev` after changing it.
2. Never put a `service_role` / secret key in a `VITE_` variable: those are bundled into the browser.

**Schema** (migration `create_restaurants_and_dishes`)

| Table         | Notes                                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `restaurants` | One row per place: `slug` (unique), `category` (`fully_vegan` / `vegan_options`, checked), `cuisines text[]`, `lat`/`lng`, `hours text[]`, `price_level` 1-4 (checked), `last_checked date`, `verification_note`, … |
| `dishes`      | `restaurant_id` → `restaurants` (cascade delete), `name`, `description`, `note`, `sort_order`                                                                                                                       |

Row Level Security is enabled on both tables with **read-only** policies for `anon` and `authenticated`. There are no write policies, so edits go through the Supabase dashboard / service role until admin tooling exists. The repository fetches everything in one request (`select('*, dishes(*)')`) and maps snake_case rows to the app's types in `toRestaurant()`.

The 12 placeholder restaurants were seeded into the database from `src/data/mockRestaurants.ts`. Replace them with hand-verified real restaurants before real use.

### Accounts

Accounts use Supabase Auth (email + password) and only appear when Supabase is configured; without it the Sign in tab is hidden and the auth routes explain that accounts are unavailable.

Routes: `/login`, `/register`, `/forgot-password`, `/reset-password` (the emailed link lands here; also used for "change password"), `/account` (requires sign-in; redirects to `/login?next=/account`). `?next=` is validated so it can only point inside the app.

Code map: `src/auth/` (`AuthService` interface, Supabase implementation, `AuthProvider` / `useAuth`), `src/components/auth/` (form fields), `src/lib/validateAuth.ts` (pure validation). UI code talks to `AuthService`, not to `supabase-js`, so it stays testable with a fake (`src/test/fakeAuthService.ts`).

**Schema** (migration `add_profiles_and_saved_restaurants`)

| Table               | Notes                                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`          | `id` → `auth.users` (cascade), `display_name` (≤ 60). Created automatically by the `on_auth_user_created` trigger from the sign-up form's display name. RLS: users read/insert/update only their own row. |
| `saved_restaurants` | Primary key `(user_id, restaurant_id)`. RLS: users read/insert/delete only their own rows.                                                                                                                |

**Saved restaurants:** signed out → `localStorage`; signed in → `saved_restaurants`. On sign-in, anything saved on the device is merged into the account (then cleared from the device). Signing out leaves the device list empty.

**Supabase dashboard settings you must configure** (Authentication → URL Configuration):

- **Site URL**: your deployed URL (default is `http://localhost:3000`, which is wrong for this app).
- **Redirect URLs**: add `http://localhost:5173/**` and your deployed origin `/**`. Confirmation and password-reset emails send people back to `/login` and `/reset-password`; Supabase rejects redirects that aren't on this list.
- **Confirm email** (Authentication → Providers → Email) is on by default: new users must click the emailed link before signing in, and the app handles both cases. The built-in email sender is heavily rate-limited; use custom SMTP before real traffic.

Not built yet: deleting an account (needs a server-side function with the service role), social login, and MFA.

Filtering currently happens client-side in the pure `filterRestaurants` function. If the dataset grows, push category/cuisine filters into the query.

## Placeholder data

Everything in [`src/data/mockRestaurants.ts`] (and the matching rows seeded into Supabase)(src/data/mockRestaurants.ts) is fictional: business names, dishes, phone numbers (`555-01xx`) and URLs (`example.com`). Neighborhoods and street names are real; street numbers and coordinates are approximate. The app shows a "Demo data" strip so nobody mistakes it for real listings. Replace it with hand-verified restaurants before real use.

## Accessibility notes

- Semantic landmarks, a skip link, visible focus rings, 44px minimum touch targets.
- Category is never conveyed by color alone (label + icon + marker shape).
- Filters are native radio groups / `<select>`; the map has a text alternative (the List view) and keyboard-focusable markers; `Esc` closes the map preview.
- Honors `prefers-reduced-motion` and `prefers-color-scheme`.
- Forms: every input has a visible label, errors are tied to fields with `aria-describedby`/`aria-invalid`, focus moves to the first invalid field, server errors are announced via `role="alert"`, and password fields have correct `autocomplete` values plus a show/hide toggle.

## Out of scope (for now)

User reviews, submitting or editing restaurants, account deletion, social login, and server code.
