import { useCallback, useEffect, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

type Settled<T> = {
  source: () => Promise<T>
  attempt: number
  outcome: Exclude<AsyncState<T>, { status: 'loading' }>
}

/**
 * Runs `load` and reports loading / success / error.
 * `load` must be referentially stable (wrap it in useCallback); a new function
 * starts a new request. `retry()` re-runs the same request.
 * Loading is derived (no result yet for this request) rather than set in an effect.
 */
export function useAsync<T>(
  load: () => Promise<T>,
): AsyncState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    let cancelled = false
    load().then(
      (data) => {
        if (!cancelled)
          setSettled({ source: load, attempt, outcome: { status: 'success', data } })
      },
      (reason: unknown) => {
        if (cancelled) return
        const error = reason instanceof Error ? reason : new Error(String(reason))
        setSettled({ source: load, attempt, outcome: { status: 'error', error } })
      },
    )
    return () => {
      cancelled = true
    }
  }, [load, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  const current = settled && settled.source === load && settled.attempt === attempt
  return { ...(current ? settled.outcome : { status: 'loading' as const }), retry }
}
