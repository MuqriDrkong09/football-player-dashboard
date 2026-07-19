import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'

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

function renderNavbar(onMenuClick = jest.fn()) {
  return render(
    <MemoryRouter>
      <Navbar onMenuClick={onMenuClick} />
    </MemoryRouter>,
  )
}

describe('components/layout/Navbar', () => {
  it('renders the header chrome with logo, league filters, and theme toggle', () => {
    renderNavbar()

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Football Dashboard home/i }),
    ).toHaveAttribute('href', '/')
    expect(
      screen.queryByRole('navigation', { name: 'Primary navigation' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Theme toggle' }),
    ).toBeInTheDocument()
    expect(screen.getByText('League season switcher')).toBeInTheDocument()
  })

  it('calls onMenuClick when the mobile menu button is pressed', async () => {
    const user = userEvent.setup()
    const onMenuClick = jest.fn()

    renderNavbar(onMenuClick)

    await user.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    )

    expect(onMenuClick).toHaveBeenCalledTimes(1)
  })
})
