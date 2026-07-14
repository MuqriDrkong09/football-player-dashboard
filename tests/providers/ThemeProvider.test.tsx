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
    </div>
  )
}

function renderWithTheme(ui: ReactNode, defaultTheme: 'light' | 'dark' = 'light') {
  return render(
    <ThemeProvider defaultTheme={defaultTheme}>{ui}</ThemeProvider>,
  )
}

describe('providers/ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
  })

  it('applies the theme class and persists it', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Probe />)

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('supports setting an explicit theme', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Probe />, 'light')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'dark' }))
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })
})
