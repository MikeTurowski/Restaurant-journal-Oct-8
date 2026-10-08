import { friendlyAuthMessage } from './supabaseAuthService'

describe('friendlyAuthMessage', () => {
  it('translates known Supabase error codes', () => {
    expect(friendlyAuthMessage('invalid_credentials')).toBe(
      'Email or password is incorrect.',
    )
    expect(friendlyAuthMessage('email_exists')).toMatch(/already exists/)
    expect(friendlyAuthMessage('over_email_send_rate_limit')).toMatch(/Too many/)
  })

  it('reports network failures distinctly', () => {
    expect(friendlyAuthMessage(undefined, 'AuthRetryableFetchError')).toMatch(
      /connection/,
    )
  })

  it('never leaks raw error text for unknown errors', () => {
    expect(friendlyAuthMessage('some_internal_code')).toBe(
      'Something went wrong. Please try again.',
    )
  })
})
