import { Home, Users } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { NavLinks } from '@/components/layout/NavLinks'
import type { NavItem } from '@/config/navigation'

const items: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Players', href: '/players', icon: Users },
]

function renderNav(
  ui: React.ReactElement,
  initialPath = '/',
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('components/layout/NavLinks', () => {
  it('renders horizontal links with the default aria label', () => {
    const { container } = renderNav(<NavLinks items={items} />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toHaveClass('flex', 'items-center', 'gap-1')
    expect(nav.className).not.toContain('flex-col')

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Players' })).toHaveAttribute(
      'href',
      '/players',
    )
    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(
      2,
    )
  })

  it('applies vertical orientation classes', () => {
    renderNav(
      <NavLinks items={items} orientation="vertical" ariaLabel="Sidebar" />,
    )

    const nav = screen.getByRole('navigation', { name: 'Sidebar' })
    expect(nav).toHaveClass('flex', 'flex-col', 'gap-1')
    expect(nav.className).not.toContain('whitespace-nowrap')
  })

  it('marks the matching route as active and others as inactive', () => {
    renderNav(<NavLinks items={items} />, '/players')

    expect(screen.getByRole('link', { name: 'Players' })).toHaveClass(
      'bg-primary/10',
      'text-primary',
    )
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass(
      'text-muted-foreground',
    )
  })

  it('uses end matching so nested paths do not activate the home link', () => {
    renderNav(<NavLinks items={items} />, '/players')

    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveClass(
      'bg-primary/10',
    )
  })

  it('calls onNavigate when a link is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = jest.fn()

    renderNav(<NavLinks items={items} onNavigate={onNavigate} />)

    await user.click(screen.getByRole('link', { name: 'Players' }))
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('merges a custom className onto the nav element', () => {
    renderNav(<NavLinks items={items} className="custom-nav" />)

    expect(screen.getByRole('navigation')).toHaveClass('custom-nav')
  })

  it('applies whitespace-nowrap for horizontal link items', () => {
    renderNav(<NavLinks items={items} orientation="horizontal" />)

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass(
      'whitespace-nowrap',
    )
  })
})
