import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RestaurantDetailPage } from '@/pages/RestaurantDetailPage'
import { SavedPage } from '@/pages/SavedPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DiscoverPage /> },
      { path: '/restaurants/:slug', element: <RestaurantDetailPage /> },
      { path: '/saved', element: <SavedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
