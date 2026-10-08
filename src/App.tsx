import { RouterProvider } from 'react-router'
import { RepositoryProvider } from '@/data/RepositoryContext'
import { SavedProvider } from '@/hooks/useSaved'
import { router } from './router'

export default function App() {
  return (
    <RepositoryProvider>
      <SavedProvider>
        <RouterProvider router={router} />
      </SavedProvider>
    </RepositoryProvider>
  )
}
