export const MIN_PASSWORD_LENGTH = 8
export const MAX_DISPLAY_NAME_LENGTH = 60

export type FieldErrors<K extends string> = Partial<Record<K, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return 'Enter your email address.'
  if (!EMAIL.test(email)) return 'Enter a valid email address, like name@example.com.'
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return 'Enter a password.'
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
}

export function validateDisplayName(value: string): string | undefined {
  const name = value.trim()
  if (!name) return 'Enter a display name.'
  if (name.length > MAX_DISPLAY_NAME_LENGTH) {
    return `Keep it to ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`
  }
}

function validateConfirm(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Re-enter your password.'
  if (confirm !== password) return 'Passwords don’t match.'
}

function compact<K extends string>(
  errors: Record<K, string | undefined>,
): FieldErrors<K> {
  const result: FieldErrors<K> = {}
  for (const key of Object.keys(errors) as K[]) {
    const message = errors[key]
    if (message) result[key] = message
  }
  return result
}

export function validateLogin(input: { email: string; password: string }) {
  return compact({
    email: validateEmail(input.email),
    // Don't enforce the minimum length at sign-in; just require something.
    password: input.password ? undefined : 'Enter your password.',
  })
}

export function validateRegister(input: {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}) {
  return compact({
    displayName: validateDisplayName(input.displayName),
    email: validateEmail(input.email),
    password: validateNewPassword(input.password),
    confirmPassword: validateConfirm(input.password, input.confirmPassword),
  })
}

export function validateNewPasswordForm(input: {
  password: string
  confirmPassword: string
}) {
  return compact({
    password: validateNewPassword(input.password),
    confirmPassword: validateConfirm(input.password, input.confirmPassword),
  })
}

/**
 * Only allow redirects to paths inside this app, never other sites
 * (`//evil.com`, `https://…`) and never back into the auth screens.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return '/'
  }
  if (/^\/(login|register|forgot-password|reset-password)(\/|\?|$)/.test(next)) return '/'
  return next
}
