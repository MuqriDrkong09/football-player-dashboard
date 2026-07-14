import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { useTheme } from '@/hooks/use-theme'

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
}

describe('hooks/useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('throws when used outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider',
    )
  })

  it('exposes theme controls from ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
    expect(typeof result.current.toggleTheme).toBe('function')
    expect(typeof result.current.setTheme).toBe('function')
  })
})
