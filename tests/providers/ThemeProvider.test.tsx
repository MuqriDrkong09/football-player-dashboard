import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { useTheme } from '@/hooks/use-theme'

function Probe() {
  const { theme, toggleTheme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        dark
      </button>
      <button type="button" onClick={() => setTheme('light')}>
        light
      </button>
    </div>
  )
}

function renderWithTheme(
  ui: ReactNode,
  props?: { defaultTheme?: 'light' | 'dark' },
) {
  return render(<ThemeProvider {...props}>{ui}</ThemeProvider>)
}

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

describe('providers/ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
    mockMatchMedia(false)
  })

  it('applies the default theme class and persists toggles', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Probe />, { defaultTheme: 'light' })

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('light')

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('supports setting an explicit theme', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Probe />, { defaultTheme: 'light' })

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'dark' }))
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'light' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('restores a stored light theme when defaultTheme is omitted', () => {
    localStorage.setItem('theme', 'light')

    renderWithTheme(<Probe />)

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('restores a stored dark theme when defaultTheme is omitted', () => {
    localStorage.setItem('theme', 'dark')

    renderWithTheme(<Probe />)

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('falls back to the system dark preference for invalid stored values', () => {
    localStorage.setItem('theme', 'neon')
    mockMatchMedia(true)

    renderWithTheme(<Probe />)

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(window.matchMedia).toHaveBeenCalledWith(
      '(prefers-color-scheme: dark)',
    )
  })

  it('falls back to the system light preference when nothing is stored', () => {
    mockMatchMedia(false)

    renderWithTheme(<Probe />)

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })
})
