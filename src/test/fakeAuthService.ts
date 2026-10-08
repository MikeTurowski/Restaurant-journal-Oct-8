import { vi } from 'vitest'
import { AuthServiceError, type AuthService, type AuthUser } from '@/auth/authService'

/** In-memory AuthService for tests. Call `emit(user)` to simulate auth state changes. */
export function createFakeAuthService(initial: AuthUser | null = null) {
  const listeners = new Set<(user: AuthUser | null) => void>()
  let current = initial

  const emit = (user: AuthUser | null) => {
    current = user
    listeners.forEach((l) => l(user))
  }

  const service = {
    subscribe: vi.fn((listener: (user: AuthUser | null) => void) => {
      listeners.add(listener)
      listener(current)
      return () => listeners.delete(listener)
    }),
    signUp: vi.fn<AuthService['signUp']>(async () => ({ needsEmailConfirmation: true })),
    signIn: vi.fn<AuthService['signIn']>(async ({ email }) => {
      emit({ id: 'user-1', email })
    }),
    signOut: vi.fn<AuthService['signOut']>(async () => emit(null)),
    sendPasswordReset: vi.fn<AuthService['sendPasswordReset']>(async () => undefined),
    updatePassword: vi.fn<AuthService['updatePassword']>(async () => undefined),
    getProfile: vi.fn<AuthService['getProfile']>(async () => ({ displayName: 'Sam' })),
    updateProfile: vi.fn<AuthService['updateProfile']>(async (_id, profile) => profile),
  } satisfies AuthService

  return { service, emit }
}

export { AuthServiceError }
