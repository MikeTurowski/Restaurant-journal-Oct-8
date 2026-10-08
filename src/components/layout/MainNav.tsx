import { NavLink } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { CompassIcon, HeartIcon, UserIcon } from '@/components/ui/icons'
import { useSaved } from '@/hooks/useSaved'

const linkBase =
  'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-4 text-xs font-medium transition-colors duration-150 md:min-h-11 md:flex-none md:flex-row md:gap-2 md:rounded-control md:text-sm'

function navClass({ isActive }: { isActive: boolean }) {
  return `${linkBase} ${
    isActive
      ? 'text-brand md:bg-brand-soft md:text-brand-soft-ink'
      : 'text-ink-muted hover:text-ink md:hover:bg-surface-muted'
  }`
}

/** Bottom tab bar on phones; sits in the header on md+ screens. */
export function MainNav() {
  const { savedIds } = useSaved()
  const { status } = useAuth()
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:static md:inset-auto md:border-0 md:bg-transparent md:pb-0"
    >
      <NavLink to="/" end className={navClass}>
        <CompassIcon width={22} height={22} />
        Discover
      </NavLink>
      <NavLink to="/saved" className={navClass}>
        <HeartIcon width={22} height={22} />
        <span>
          Saved
          {savedIds.size > 0 && (
            <span className="ml-1.5 rounded-chip bg-accent-soft px-1.5 py-0.5 text-[0.7rem] text-accent-soft-ink">
              {savedIds.size}
              <span className="sr-only"> saved</span>
            </span>
          )}
        </span>
      </NavLink>
      {status !== 'unavailable' &&
        (status === 'signedIn' ? (
          <NavLink to="/account" className={navClass}>
            <UserIcon width={22} height={22} />
            Account
          </NavLink>
        ) : (
          <NavLink to="/login" className={navClass}>
            <UserIcon width={22} height={22} />
            Sign in
          </NavLink>
        ))}
    </nav>
  )
}
