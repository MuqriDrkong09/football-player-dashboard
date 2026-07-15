import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AboutPage } from '@/pages/AboutPage'

jest.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: jest.fn(),
}))

describe('pages', () => {
  it('renders NotFoundPage actions', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Page not found')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Go to dashboard' }),
    ).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('link', { name: 'Browse players' }),
    ).toHaveAttribute('href', '/players')
  })

  it('renders AboutPage content', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /about/i }),
    ).toBeInTheDocument()
  })
})
