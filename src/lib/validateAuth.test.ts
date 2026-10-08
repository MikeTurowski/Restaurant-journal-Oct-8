import {
  safeNextPath,
  validateLogin,
  validateNewPasswordForm,
  validateRegister,
} from './validateAuth'

describe('validateLogin', () => {
  it('requires a valid email and a password', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Enter your email address.',
      password: 'Enter your password.',
    })
    expect(validateLogin({ email: 'nope', password: 'x' }).email).toMatch(/valid email/)
  })

  it('accepts short passwords at sign-in (only registration enforces length)', () => {
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual({})
  })
})

describe('validateRegister', () => {
  const valid = {
    displayName: 'Sam',
    email: 'sam@example.com',
    password: 'longenough',
    confirmPassword: 'longenough',
  }

  it('passes valid input', () => {
    expect(validateRegister(valid)).toEqual({})
  })

  it('flags each invalid field', () => {
    const errors = validateRegister({
      displayName: '   ',
      email: 'sam@',
      password: 'short',
      confirmPassword: 'different',
    })
    expect(Object.keys(errors).sort()).toEqual([
      'confirmPassword',
      'displayName',
      'email',
      'password',
    ])
  })

  it('catches mismatched passwords', () => {
    expect(
      validateRegister({ ...valid, confirmPassword: 'longenough!' }).confirmPassword,
    ).toMatch(/don’t match/)
  })

  it('limits display name length', () => {
    expect(
      validateRegister({ ...valid, displayName: 'x'.repeat(61) }).displayName,
    ).toMatch(/60/)
  })
})

describe('validateNewPasswordForm', () => {
  it('requires matching passwords of sufficient length', () => {
    expect(
      validateNewPasswordForm({ password: 'longenough', confirmPassword: 'longenough' }),
    ).toEqual({})
    expect(
      validateNewPasswordForm({ password: 'short', confirmPassword: 'short' }).password,
    ).toBeDefined()
  })
})

describe('safeNextPath', () => {
  it('keeps in-app paths', () => {
    expect(safeNextPath('/saved')).toBe('/saved')
    expect(safeNextPath('/restaurants/moss-and-marrow?x=1')).toBe(
      '/restaurants/moss-and-marrow?x=1',
    )
  })

  it('rejects external and protocol-relative URLs', () => {
    expect(safeNextPath('https://evil.example')).toBe('/')
    expect(safeNextPath('//evil.example')).toBe('/')
    expect(safeNextPath('/\\evil.example')).toBe('/')
    expect(safeNextPath(null)).toBe('/')
  })

  it('never redirects back into the auth screens', () => {
    expect(safeNextPath('/login')).toBe('/')
    expect(safeNextPath('/register?next=/saved')).toBe('/')
  })
})
