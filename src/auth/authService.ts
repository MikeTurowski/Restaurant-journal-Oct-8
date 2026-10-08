export interface AuthUser {
  id: string
  email: string
}

export interface Profile {
  displayName: string
}

export interface SignUpInput {
  email: string
  password: string
  displayName: string
}

export interface SignInInput {
  email: string
  password: string
}

/** Thrown with a message that is safe to show to the user. */
export class AuthServiceError extends Error {
  override name = 'AuthServiceError'
}

/**
 * Everything the UI needs from an auth back end. The Supabase implementation lives in
 * supabaseAuthService.ts; tests use a fake.
 */
export interface AuthService {
  /** Calls `listener` with the current user now-ish, then on every change. Returns unsubscribe. */
  subscribe(listener: (user: AuthUser | null) => void): () => void
  /** `needsEmailConfirmation` is true when the user must click an emailed link before signing in. */
  signUp(input: SignUpInput): Promise<{ needsEmailConfirmation: boolean }>
  signIn(input: SignInInput): Promise<void>
  signOut(): Promise<void>
  sendPasswordReset(email: string): Promise<void>
  updatePassword(password: string): Promise<void>
  getProfile(userId: string): Promise<Profile | null>
  updateProfile(userId: string, profile: Profile): Promise<Profile>
}
