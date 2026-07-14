import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { sidebarNavItems } from '@/config/navigation'

jest.mock('@/components/layout/DarkModeToggle', () => ({
  DarkModeToggle: () => <button type="button">Theme toggle</button>,
}))

jest.mock('@/lib/notify', () => ({
  notify: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

describe('components/layout/Sidebar', () => {
  it('renders the sidebar landmark with logo, nav links, and theme controls', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    const aside = screen.getByRole('complementary', {
      name: 'Sidebar navigation',
    })
    expect(aside).toHaveClass(
      'hidden',
      'w-64',
      'lg:flex',
      'lg:flex-col',
      'bg-sidebar',
    )

    expect(
      screen.getByRole('link', { name: /Football Dashboard home/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('navigation', { name: 'Sidebar navigation' }),
    ).toBeInTheDocument()

    for (const item of sidebarNavItems) {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute(
        'href',
        item.href,
      )
    }

    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Theme toggle' }),
    ).toBeInTheDocument()
  })

  it('merges a custom className onto the aside', () => {
    render(
      <MemoryRouter>
        <Sidebar className="custom-sidebar" />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('complementary', { name: 'Sidebar navigation' }),
    ).toHaveClass('custom-sidebar', 'w-64')
  })
})
