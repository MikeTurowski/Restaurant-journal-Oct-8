import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { authErrorMessage } from '@/auth/errorMessage'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthUnavailable } from '@/components/auth/AuthUnavailable'
import { FormError, FormSuccess } from '@/components/auth/FormMessage'
import { TextField } from '@/components/auth/TextField'
import { Button } from '@/components/ui/Button'
import { LogOutIcon } from '@/components/ui/icons'
import { useFocusFirstInvalid } from '@/hooks/useFormFocus'
import { useSaved } from '@/hooks/useSaved'
import { MAX_DISPLAY_NAME_LENGTH, validateDisplayName } from '@/lib/validateAuth'

function DisplayNameForm({ initialName }: { initialName: string }) {
  const { updateDisplayName } = useAuth()
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | undefined>()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)
  const { formRef, focusFirstInvalid } = useFocusFirstInvalid()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateDisplayName(name)
    setError(found)
    setServerError(null)
    setSaved(false)
    if (found) {
      focusFirstInvalid()
      return
    }
    setPending(true)
    try {
      await updateDisplayName(name.trim())
      setSaved(true)
    } catch (err) {
      setServerError(authErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && <FormError>{serverError}</FormError>}
      {saved && <FormSuccess>Profile saved.</FormSuccess>}
      <TextField
        label="Display name"
        name="displayName"
        autoComplete="name"
        maxLength={MAX_DISPLAY_NAME_LENGTH}
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setSaved(false)
        }}
        error={error}
      />
      <Button type="submit" pending={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}

export function AccountPage() {
  const { status, user, profile, signOut } = useAuth()
  const { savedIds } = useSaved()
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  if (status === 'unavailable') return <AuthUnavailable />
  if (status === 'signedOut') return <Navigate to="/login?next=%2Faccount" replace />
  if (status === 'loading' || !user) {
    return (
      <AuthCard title="Your account">
        <p role="status" className="text-ink-muted">
          Loading your account…
        </p>
      </AuthCard>
    )
  }

  async function handleSignOut() {
    setSigningOut(true)
    setSignOutError(null)
    try {
      await signOut()
    } catch (error) {
      setSignOutError(authErrorMessage(error))
      setSigningOut(false)
    }
  }

  return (
    <AuthCard
      title="Your account"
      description={user.email}
      footer={
        <Link
          to="/saved"
          className="font-semibold text-brand underline underline-offset-2"
        >
          View your {savedIds.size} saved {savedIds.size === 1 ? 'place' : 'places'}
        </Link>
      }
    >
      <section aria-labelledby="profile-heading" className="space-y-3">
        <h2 id="profile-heading" className="text-lg">
          Profile
        </h2>
        {profile === undefined ? (
          <p role="status" className="text-ink-muted">
            Loading profile…
          </p>
        ) : (
          <DisplayNameForm initialName={profile?.displayName ?? ''} />
        )}
      </section>

      <hr className="border-line" />

      <section aria-labelledby="security-heading" className="space-y-3">
        <h2 id="security-heading" className="text-lg">
          Security
        </h2>
        <Link
          to="/reset-password"
          className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-2"
        >
          Change password
        </Link>
      </section>

      <hr className="border-line" />

      {signOutError && <FormError>{signOutError}</FormError>}
      <Button variant="secondary" pending={signingOut} onClick={handleSignOut}>
        <LogOutIcon width={18} height={18} />
        {signingOut ? 'Signing out…' : 'Sign out'}
      </Button>
    </AuthCard>
  )
}
