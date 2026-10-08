import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { authErrorMessage } from '@/auth/errorMessage'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthUnavailable } from '@/components/auth/AuthUnavailable'
import { FormError, FormSuccess } from '@/components/auth/FormMessage'
import { TextField } from '@/components/auth/TextField'
import { Button } from '@/components/ui/Button'
import { useFocusFirstInvalid } from '@/hooks/useFormFocus'
import { validateEmail } from '@/lib/validateAuth'

export function ForgotPasswordPage() {
  const { status, sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [serverError, setServerError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const { formRef, focusFirstInvalid } = useFocusFirstInvalid()

  if (status === 'unavailable') return <AuthUnavailable />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateEmail(email)
    setError(found)
    setServerError(null)
    if (found) {
      focusFirstInvalid()
      return
    }
    setPending(true)
    try {
      await sendPasswordReset(email.trim())
      setSentTo(email.trim())
    } catch (err) {
      setServerError(authErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we’ll send you a link to choose a new password."
      footer={
        <Link
          to="/login"
          className="font-semibold text-brand underline underline-offset-2"
        >
          Back to sign in
        </Link>
      }
    >
      {sentTo ? (
        // Same message whether or not the address has an account, so it can't be probed.
        <FormSuccess>
          If an account exists for {sentTo}, a reset link is on its way. It can take a
          minute to arrive.
        </FormSuccess>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
          {serverError && <FormError>{serverError}</FormError>}
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Button type="submit" pending={pending} className="w-full">
            {pending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
