import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'

jest.mock('@/components/layout/DarkModeToggle', () => ({
  DarkModeToggle: () => <button type="button">Theme toggle</button>,
}))

jest.mock('@/components/league-season', () => ({
  LeagueSeasonSwitcher: () => <div>League season switcher</div>,
}))

jest.mock('@/lib/notify', () => ({
  notify: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

function renderRootLayout(initialPath = '/') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<p>Home outlet</p>} />
            <Route path="players" element={<p>Players outlet</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('layouts/RootLayout', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('renders the app shell around outlet content', () => {
    renderRootLayout()

    expect(
      screen.getByRole('link', { name: /skip to main content/i }),
    ).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(
      screen.getByRole('complementary', { name: 'Sidebar navigation' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByRole('main')).toHaveAttribute('tabIndex', '-1')
    expect(screen.getByText('Home outlet')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('opens and closes the mobile navigation', async () => {
    const user = userEvent.setup()
    renderRootLayout()

    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true',
    )

    await user.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-hidden', 'false')
    expect(document.body.style.overflow).toBe('hidden')

    await user.click(
      screen.getByRole('button', { name: 'Close navigation menu' }),
    )

    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('renders nested route content through the outlet', () => {
    renderRootLayout('/players')

    expect(screen.getByText('Players outlet')).toBeInTheDocument()
  })
})
