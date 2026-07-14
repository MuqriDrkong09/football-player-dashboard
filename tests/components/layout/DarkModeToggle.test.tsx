import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { notify } from '@/lib/notify'
import { useTheme } from '@/hooks/use-theme'

jest.mock('@/hooks/use-theme', () => ({
  useTheme: jest.fn(),
}))

jest.mock('@/lib/notify', () => ({
  notify: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

const mockedUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe('components/layout/DarkModeToggle', () => {
  const toggleTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the light-mode control and switches to dark mode', async () => {
    const user = userEvent.setup()
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      toggleTheme,
    })

    render(<DarkModeToggle />)

    const button = screen.getByRole('button', { name: 'Switch to dark mode' })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await user.click(button)

    expect(toggleTheme).toHaveBeenCalledTimes(1)
    expect(notify.info).toHaveBeenCalledWith('Dark mode on')
  })

  it('renders the dark-mode control and switches to light mode', async () => {
    const user = userEvent.setup()
    mockedUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
      toggleTheme,
    })

    render(<DarkModeToggle />)

    const button = screen.getByRole('button', { name: 'Switch to light mode' })
    expect(button).toHaveAttribute('aria-pressed', 'true')

    await user.click(button)

    expect(toggleTheme).toHaveBeenCalledTimes(1)
    expect(notify.info).toHaveBeenCalledWith('Light mode on')
  })

  it('renders sun and moon icons as decorative', () => {
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      toggleTheme,
    })

    const { container } = render(<DarkModeToggle />)

    expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(
      2,
    )
  })
})
