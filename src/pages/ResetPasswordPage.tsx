import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { authErrorMessage } from '@/auth/errorMessage'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthUnavailable } from '@/components/auth/AuthUnavailable'
import { FormError, FormSuccess } from '@/components/auth/FormMessage'
import { PasswordField } from '@/components/auth/PasswordField'
import { Button } from '@/components/ui/Button'
import { LinkButton } from '@/components/ui/LinkButton'
import { useFocusFirstInvalid } from '@/hooks/useFormFocus'
import {
  MIN_PASSWORD_LENGTH,
  validateNewPasswordForm,
  type FieldErrors,
} from '@/lib/validateAuth'

/**
 * Landing page for the emailed reset link (which signs the user in with a short-lived
 * recovery session) and for "change password" from the Account page.
 */
export function ResetPasswordPage() {
  const { status, updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors<'password' | 'confirmPassword'>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const { formRef, focusFirstInvalid } = useFocusFirstInvalid()

  if (status === 'unavailable') return <AuthUnavailable />

  if (status === 'loading') {
    return (
      <AuthCard title="Choose a new password">
        <p role="status" className="text-ink-muted">
          Checking your link…
        </p>
      </AuthCard>
    )
  }

  if (status === 'signedOut') {
    return (
      <AuthCard title="Link expired">
        <p className="text-ink-muted">
          This password reset link is invalid or has expired. Request a new one to
          continue.
        </p>
        <LinkButton to="/forgot-password">Request a new link</LinkButton>
      </AuthCard>
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateNewPasswordForm({ password, confirmPassword })
    setErrors(found)
    setServerError(null)
    if (Object.keys(found).length > 0) {
      focusFirstInvalid()
      return
    }
    setPending(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (error) {
      setServerError(authErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard
      title="Choose a new password"
      footer={
        <Link
          to="/account"
          className="font-semibold text-brand underline underline-offset-2"
        >
          Back to account
        </Link>
      }
    >
      {done ? (
        <div className="space-y-4">
          <FormSuccess>Your password has been updated.</FormSuccess>
          <LinkButton to="/">Continue to Discover</LinkButton>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
          {serverError && <FormError>{serverError}</FormError>}
          <PasswordField
            label="New password"
            name="password"
            autoComplete="new-password"
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordField
            label="Confirm new password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />
          <Button type="submit" pending={pending} className="w-full">
            {pending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
