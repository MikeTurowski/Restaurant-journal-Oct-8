import { useEffect } from 'react'

const BASE = 'Eugene Vegan Finder'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : BASE
  }, [title])
}
