import type { SupabaseClient } from '@supabase/supabase-js'
import { AuthServiceError, type AuthService, type AuthUser } from './authService'

const GENERIC = 'Something went wrong. Please try again.'

/** Maps Supabase auth error codes to short messages that are safe to show. */
export function friendlyAuthMessage(code: string | undefined, name?: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Email or password is incorrect.'
    case 'email_not_confirmed':
      return 'Please confirm your email first. Check your inbox for the link.'
    case 'weak_password':
      return 'Choose a stronger password (at least 8 characters).'
    case 'same_password':
      return 'Choose a password different from your current one.'
    case 'user_already_exists':
    case 'email_exists':
      return 'An account with this email already exists. Try signing in.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Please wait a few minutes and try again.'
    case 'session_not_found':
    case 'refresh_token_not_found':
      return 'Your session has expired. Please sign in again.'
    default:
      return name === 'AuthRetryableFetchError'
        ? 'Couldn’t reach the server. Check your connection and try again.'
        : GENERIC
  }
}

interface ErrorLike {
  code?: string
  name?: string
}

function fail(error: ErrorLike): never {
  throw new AuthServiceError(friendlyAuthMessage(error.code, error.name), {
    cause: error,
  })
}

export function createSupabaseAuthService(client: SupabaseClient): AuthService {
  return {
    subscribe(listener) {
      // Fires INITIAL_SESSION on subscribe, then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED / …
      // Keep this callback synchronous: calling other Supabase APIs inside it can deadlock.
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        const user: AuthUser | null = session?.user
          ? { id: session.user.id, email: session.user.email ?? '' }
          : null
        listener(user)
      })
      return () => data.subscription.unsubscribe()
    },

    async signUp({ email, password, displayName }) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      if (error) fail(error)
      return { needsEmailConfirmation: !data.session }
    },

    async signIn({ email, password }) {
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) fail(error)
    },

    async signOut() {
      const { error } = await client.auth.signOut()
      if (error) fail(error)
    },

    async sendPasswordReset(email) {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) fail(error)
    },

    async updatePassword(password) {
      const { error } = await client.auth.updateUser({ password })
      if (error) fail(error)
    },

    async getProfile(userId) {
      const { data, error } = await client
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .maybeSingle<{ display_name: string }>()
      if (error) fail(error)
      return data ? { displayName: data.display_name } : null
    },

    async updateProfile(userId, profile) {
      const { data, error } = await client
        .from('profiles')
        .upsert({ id: userId, display_name: profile.displayName })
        .select('display_name')
        .single<{ display_name: string }>()
      if (error) fail(error)
      return { displayName: data.display_name }
    },
  }
}
