import { RouterProvider } from 'react-router'
import { AuthProvider } from '@/auth/AuthContext'
import { RepositoryProvider } from '@/data/RepositoryContext'
import { SavedProvider } from '@/hooks/useSaved'
import { router } from './router'

export default function App() {
  return (
    <RepositoryProvider>
      <AuthProvider>
        <SavedProvider>
          <RouterProvider router={router} />
        </SavedProvider>
      </AuthProvider>
    </RepositoryProvider>
  )
}
