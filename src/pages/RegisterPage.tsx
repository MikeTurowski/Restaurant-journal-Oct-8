import { useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { authErrorMessage } from '@/auth/errorMessage'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthUnavailable } from '@/components/auth/AuthUnavailable'
import { FormError } from '@/components/auth/FormMessage'
import { PasswordField } from '@/components/auth/PasswordField'
import { TextField } from '@/components/auth/TextField'
import { MailIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/Button'
import { LinkButton } from '@/components/ui/LinkButton'
import { useFocusFirstInvalid } from '@/hooks/useFormFocus'
import {
  MAX_DISPLAY_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  safeNextPath,
  validateRegister,
  type FieldErrors,
} from '@/lib/validateAuth'

type Field = 'displayName' | 'email' | 'password' | 'confirmPassword'

export function RegisterPage() {
  const { status, signUp } = useAuth()
  const [params] = useSearchParams()
  const next = safeNextPath(params.get('next'))

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors<Field>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null)
  const { formRef, focusFirstInvalid } = useFocusFirstInvalid()

  if (status === 'unavailable') return <AuthUnavailable />
  if (status === 'signedIn') return <Navigate to={next} replace />

  if (confirmationSentTo) {
    return (
      <AuthCard title="Check your email">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand-soft-ink">
            <MailIcon width={24} height={24} />
          </span>
          <p className="text-ink">
            We sent a confirmation link to <strong>{confirmationSentTo}</strong>. Open it
            to finish creating your account, then sign in.
          </p>
          <p className="text-sm text-ink-muted">
            Nothing there? Check your spam folder, or make sure the address is right.
          </p>
          <LinkButton to="/login">Go to sign in</LinkButton>
        </div>
      </AuthCard>
    )
  }

  const loginHref = next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateRegister({ displayName, email, password, confirmPassword })
    setErrors(found)
    setServerError(null)
    if (Object.keys(found).length > 0) {
      focusFirstInvalid()
      return
    }
    setPending(true)
    try {
      const { needsEmailConfirmation } = await signUp({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      })
      if (needsEmailConfirmation) setConfirmationSentTo(email.trim())
      // Otherwise the new session redirects this page to `next`.
    } catch (error) {
      setServerError(authErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      description="Save restaurants to your account and find them on any device."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to={loginHref}
            className="font-semibold text-brand underline underline-offset-2"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && <FormError>{serverError}</FormError>}
        <TextField
          label="Display name"
          name="displayName"
          autoComplete="name"
          maxLength={MAX_DISPLAY_NAME_LENGTH}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
        />
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
        <Button type="submit" pending={pending} className="w-full">
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
