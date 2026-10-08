import { Link, Outlet, ScrollRestoration } from 'react-router'
import { LeafIcon } from '@/components/ui/icons'
import { useSaved } from '@/hooks/useSaved'
import { MainNav } from './MainNav'

function SavedErrorBanner() {
  const { error, dismissError } = useSaved()
  if (!error) return null
  return (
    <div
      role="alert"
      className="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-control bg-accent-soft-ink px-4 py-2 text-sm text-accent-soft shadow-pop md:bottom-6"
    >
      <span>{error}</span>
      <button
        type="button"
        onClick={dismissError}
        className="min-h-11 shrink-0 px-2 font-semibold underline"
      >
        Dismiss
      </button>
    </div>
  )
}

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      <p className="bg-brand-soft px-4 py-1.5 text-center text-xs text-brand-soft-ink">
        Demo data: all restaurants shown are fictional placeholders.
      </p>

      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex min-h-11 items-center gap-2 font-display text-lg font-semibold"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-on">
              <LeafIcon width={18} height={18} />
            </span>
            Eugene Vegan Finder
          </Link>
          <MainNav />
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-24 sm:px-6 md:pt-8 md:pb-12"
      >
        <Outlet />
      </main>

      <SavedErrorBanner />
      <ScrollRestoration />
    </div>
  )
}
