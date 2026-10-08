import { useCallback, useRef } from 'react'

/** Moves focus to the first invalid field after a failed submit. */
export function useFocusFirstInvalid() {
  const formRef = useRef<HTMLFormElement>(null)
  const focusFirstInvalid = useCallback(() => {
    // Wait for React to render the error state (aria-invalid) before querying.
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    })
  }, [])
  return { formRef, focusFirstInvalid }
}
