import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSupabaseClient } from '@/data/supabaseClient'
import type {
  AuthService,
  AuthUser,
  Profile,
  SignInInput,
  SignUpInput,
} from './authService'
import { createSupabaseAuthService } from './supabaseAuthService'

/** `unavailable` = Supabase isn't configured, so accounts are switched off. */
export type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'unavailable'

interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  /** `undefined` while loading, `null` if the user has no profile row. */
  profile: Profile | null | undefined
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>
  signIn: (input: SignInInput) => Promise<void>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  updateDisplayName: (displayName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function createDefaultService(): AuthService | null {
  const client = getSupabaseClient()
  return client ? createSupabaseAuthService(client) : null
}

interface AuthProviderProps {
  /** Pass `null` to run with accounts disabled (tests, no Supabase). Omit for the default. */
  service?: AuthService | null
  children: ReactNode
}

export function AuthProvider({ service: serviceProp, children }: AuthProviderProps) {
  const service = useMemo(
    () => (serviceProp === undefined ? createDefaultService() : serviceProp),
    [serviceProp],
  )

  // `undefined` = haven't heard from the auth service yet.
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [profileState, setProfileState] = useState<{
    userId: string
    profile: Profile | null
  } | null>(null)

  useEffect(() => {
    if (!service) return
    return service.subscribe((next) => {
      // Token refreshes re-deliver the same user; keep the old object to avoid re-renders.
      setUser((prev) =>
        prev && next && prev.id === next.id && prev.email === next.email ? prev : next,
      )
    })
  }, [service])

  const userId = user?.id
  useEffect(() => {
    if (!service || !userId) return
    let cancelled = false
    service.getProfile(userId).then(
      (profile) => {
        if (!cancelled) setProfileState({ userId, profile })
      },
      () => {
        if (!cancelled) setProfileState({ userId, profile: null })
      },
    )
    return () => {
      cancelled = true
    }
  }, [service, userId])

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      if (!service || !userId) throw new Error('Not signed in.')
      const profile = await service.updateProfile(userId, { displayName })
      setProfileState({ userId, profile })
    },
    [service, userId],
  )

  const value = useMemo<AuthContextValue>(() => {
    const status: AuthStatus = !service
      ? 'unavailable'
      : user === undefined
        ? 'loading'
        : user
          ? 'signedIn'
          : 'signedOut'

    const unavailable = () => Promise.reject(new Error('Accounts are not available.'))

    return {
      status,
      user: user ?? null,
      profile:
        user && profileState?.userId === user.id ? profileState.profile : undefined,
      signUp: service ? (input) => service.signUp(input) : unavailable,
      signIn: service ? (input) => service.signIn(input) : unavailable,
      signOut: service ? () => service.signOut() : unavailable,
      sendPasswordReset: service
        ? (email) => service.sendPasswordReset(email)
        : unavailable,
      updatePassword: service
        ? (password) => service.updatePassword(password)
        : unavailable,
      updateDisplayName,
    }
  }, [service, user, profileState, updateDisplayName])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within an AuthProvider')
  return value
}
