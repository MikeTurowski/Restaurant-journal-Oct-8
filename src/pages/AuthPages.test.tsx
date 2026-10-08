import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthProvider } from '@/auth/AuthContext'
import { AuthServiceError } from '@/auth/authService'
import { createFakeAuthService } from '@/test/fakeAuthService'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'

function renderAt(
  path: string,
  service: ReturnType<typeof createFakeAuthService>['service'],
) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/', element: <p>Home page</p> },
      { path: '/saved', element: <p>Saved page</p> },
    ],
    { initialEntries: [path] },
  )
  return render(
    <AuthProvider service={service}>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

describe('LoginPage', () => {
  it('shows validation errors and does not call the service for empty input', async () => {
    const { service } = createFakeAuthService()
    renderAt('/login', service)
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(service.signIn).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByLabelText('Email')).toHaveFocus())
  })

  it('signs in and redirects to the safe ?next path', async () => {
    const { service } = createFakeAuthService()
    renderAt('/login?next=%2Fsaved', service)
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Email'), 'sam@example.com')
    await user.type(screen.getByLabelText('Password'), 'hunter2hunter2')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(service.signIn).toHaveBeenCalledWith({
      email: 'sam@example.com',
      password: 'hunter2hunter2',
    })
    expect(await screen.findByText('Saved page')).toBeInTheDocument()
  })

  it('ignores an unsafe ?next and goes home', async () => {
    const { service } = createFakeAuthService()
    renderAt('/login?next=https%3A%2F%2Fevil.example', service)
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Email'), 'sam@example.com')
    await user.type(screen.getByLabelText('Password'), 'hunter2hunter2')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('shows the service error message when sign-in fails', async () => {
    const { service } = createFakeAuthService()
    service.signIn.mockRejectedValueOnce(
      new AuthServiceError('Email or password is incorrect.'),
    )
    renderAt('/login', service)
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Email'), 'sam@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email or password is incorrect.',
    )
  })

  it('redirects away when already signed in', async () => {
    const { service } = createFakeAuthService({ id: 'u1', email: 'sam@example.com' })
    renderAt('/login', service)
    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const { service } = createFakeAuthService()
    renderAt('/login', service)
    const user = userEvent.setup()

    const password = await screen.findByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
  })
})

describe('RegisterPage', () => {
  it('rejects mismatched passwords', async () => {
    const { service } = createFakeAuthService()
    renderAt('/register', service)
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Display name'), 'Sam')
    await user.type(screen.getByLabelText('Email'), 'sam@example.com')
    await user.type(screen.getByLabelText('Password'), 'longenough')
    await user.type(screen.getByLabelText('Confirm password'), 'different!!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Passwords don’t match.')).toBeInTheDocument()
    expect(service.signUp).not.toHaveBeenCalled()
  })

  it('creates an account and shows the check-your-email screen', async () => {
    const { service } = createFakeAuthService()
    renderAt('/register', service)
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Display name'), '  Sam  ')
    await user.type(screen.getByLabelText('Email'), 'sam@example.com')
    await user.type(screen.getByLabelText('Password'), 'longenough')
    await user.type(screen.getByLabelText('Confirm password'), 'longenough')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(service.signUp).toHaveBeenCalledWith({
      displayName: 'Sam',
      email: 'sam@example.com',
      password: 'longenough',
    })
    expect(
      await screen.findByRole('heading', { name: 'Check your email' }),
    ).toBeInTheDocument()
    expect(screen.getByText('sam@example.com')).toBeInTheDocument()
  })
})

describe('accounts disabled', () => {
  it('explains that sign-in is unavailable when no back end is configured', () => {
    const router = createMemoryRouter([{ path: '/login', element: <LoginPage /> }], {
      initialEntries: ['/login'],
    })
    render(
      <AuthProvider service={null}>
        <RouterProvider router={router} />
      </AuthProvider>,
    )
    expect(
      screen.getByRole('heading', { name: 'Accounts aren’t available' }),
    ).toBeInTheDocument()
  })
})
