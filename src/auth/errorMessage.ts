import { AuthServiceError } from './authService'

const GENERIC = 'Something went wrong. Please try again.'

/** Only messages from AuthServiceError are written for users; anything else stays generic. */
export function authErrorMessage(error: unknown): string {
  return error instanceof AuthServiceError ? error.message : GENERIC
}
