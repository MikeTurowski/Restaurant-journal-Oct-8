import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { AccountPage } from '@/pages/AccountPage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RestaurantDetailPage } from '@/pages/RestaurantDetailPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { SavedPage } from '@/pages/SavedPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DiscoverPage /> },
      { path: '/restaurants/:slug', element: <RestaurantDetailPage /> },
      { path: '/saved', element: <SavedPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
