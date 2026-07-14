import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'
import { APP_NAME } from '@/config/navigation'

describe('components/layout/Logo', () => {
  it('links home with an accessible label and brand text by default', () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: `${APP_NAME} home` })
    expect(link).toHaveAttribute('href', '/')
    expect(screen.getByText('Football')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(link.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('hides brand text when showText is false', () => {
    render(
      <MemoryRouter>
        <Logo showText={false} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: `${APP_NAME} home` }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Football')).not.toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('merges a custom className onto the link', () => {
    render(
      <MemoryRouter>
        <Logo className="custom-logo" />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: `${APP_NAME} home` }),
    ).toHaveClass('custom-logo', 'group', 'flex')
  })
})
