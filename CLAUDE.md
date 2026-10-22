# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Eugene Vegan Finder: a mobile-first React SPA for finding vegan-friendly restaurants in Eugene, OR. Vite + React 19 + TypeScript (strict, `noUncheckedIndexedAccess`) + React Router + Tailwind CSS v4 + react-leaflet, backed by Supabase (with a mock fallback). Deployed on Vercel as a static SPA (`vercel.json` rewrites all paths to `index.html`). README.md has the full feature list, schema and Supabase dashboard setup.

## Commands

```bash
npm run dev            # Vite dev server on http://localhost:5173
npm run build          # tsc -b && vite build
npm run typecheck      # tsc -b only
npm run lint           # ESLint (typescript-eslint, react-hooks, jsx-a11y)
npm run format         # Prettier write (format:check to verify)
npm test               # Vitest, single run
npm run test:watch     # Vitest watch mode
npx vitest run src/lib/filterRestaurants.test.ts   # single test file
npx vitest run -t "test name"                      # tests matching a name
```

Tests use jsdom, globals, and `src/test/setup.ts`; CSS is not processed in tests. The `@/` import alias maps to `src/`.

## Architecture

**Provider stack** (`src/App.tsx`): `RepositoryProvider` → `AuthProvider` → `SavedProvider` → `RouterProvider`. Routes are in `src/router.tsx`, all nested under `AppShell`.

**Data access goes through interfaces, never directly to Supabase or mock data:**
- `RestaurantRepository` (`src/data/repository.ts`) is the only way UI reads restaurants and saved IDs. Components and hooks get it via `useRepository()`.
- `createDefaultRepository()` in `src/data/RepositoryContext.tsx` is the single place that picks the implementation: Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, otherwise the mock repository. `?data=mock` forces mock. Tests inject a repository via the `repository` prop.
- The Supabase repository fetches everything in one query (`select('*, dishes(*)')`) and maps snake_case rows to app types in `toRestaurant()`.
- Auth follows the same pattern: UI talks to the `AuthService` interface (`src/auth/authService.ts`) through `useAuth()`, not to `supabase-js`. Tests use `src/test/fakeAuthService.ts`. When Supabase isn't configured, auth UI is hidden and auth routes render `AuthUnavailable`.

**Saved restaurants** (`src/hooks/useSaved.tsx`): signed out → `localStorage` (`src/data/localSavedStore.ts`); signed in → `saved_restaurants` table. On sign-in, device saves merge into the account and are then cleared from the device. `SavedProvider` tags loaded IDs with their owner so a user switch never shows another user's list, and rolls back optimistic toggles on failure.

**Discover filters** live in the URL (`useDiscoverFilters`), so refresh, back/forward and shared links preserve them. Filtering is client-side in the pure `src/lib/filterRestaurants.ts`.

**Map** (`src/components/map/RestaurantMap.tsx`) is lazy-loaded; uses OpenStreetMap tiles (no API key).

**Styling**: design tokens (colors, type, radii, shadows, motion, dark mode) are defined in `src/styles/index.css` via Tailwind v4's CSS-first `@theme`. No `tailwind.config` file.

## Conventions and gotchas

- Mock-repository demo switches: `?mockError=1` makes all reads fail; `?mockDelay=3000` sets simulated latency (ms).
- Every data-driven screen has loading, empty and error states (`src/components/states/`).
- Accessibility is a requirement: category is never conveyed by color alone (label + icon + marker shape), 44px minimum touch targets, form errors wired with `aria-describedby`/`aria-invalid`, focus moves to the first invalid field. Respect `prefers-reduced-motion`.
- `?next=` on auth routes must be validated to stay inside the app.
- Only the publishable (anon) key may go in `VITE_` env vars; they ship to the browser. Restart the dev server after editing `.env.local`.
- RLS allows read-only access to `restaurants`/`dishes`; there are no write policies. `profiles` and `saved_restaurants` are scoped to the owning user.
- All restaurant data (`src/data/mockRestaurants.ts` and the matching Supabase seed rows) is fictional placeholder data; the UI shows a "Demo data" strip.
