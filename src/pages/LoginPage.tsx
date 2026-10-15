import { useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import { useAuth } from '@/auth/AuthContext'
import { authErrorMessage } from '@/auth/errorMessage'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthUnavailable } from '@/components/auth/AuthUnavailable'
import { FormError } from '@/components/auth/FormMessage'
import { PasswordField } from '@/components/auth/PasswordField'
import { TextField } from '@/components/auth/TextField'
import { Button } from '@/components/ui/Button'
import { useFocusFirstInvalid } from '@/hooks/useFormFocus'
import { safeNextPath, validateLogin, type FieldErrors } from '@/lib/validateAuth'

export function LoginPage() {
  const { status, signIn } = useAuth()
  const [params] = useSearchParams()
  const next = safeNextPath(params.get('next'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors<'email' | 'password'>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const { formRef, focusFirstInvalid } = useFocusFirstInvalid()

  if (status === 'unavailable') return <AuthUnavailable />
  if (status === 'signedIn') return <Navigate to={next} replace />

  const registerHref =
    next === '/' ? '/register' : `/register?next=${encodeURIComponent(next)}`

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateLogin({ email, password })
    setErrors(found)
    setServerError(null)
    if (Object.keys(found).length > 0) {
      focusFirstInvalid()
      return
    }
    setPending(true)
    try {
      await signIn({ email: email.trim(), password })
      // On success the auth state changes and this page redirects to `next`.
    } catch (error) {
      setServerError(authErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Sign in to keep your saved restaurants on every device."
      footer={
        <>
          New here?{' '}
          <Link
            to={registerHref}
            className="font-semibold text-brand underline underline-offset-2"
          >
            Create an account
          </Link>
        </>
      }
    >
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
          error={errors.email}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="action" pending={pending} className="w-full">
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  )
}
