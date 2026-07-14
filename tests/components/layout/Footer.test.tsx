import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'
import { APP_NAME } from '@/config/navigation'

describe('components/layout/Footer', () => {
  it('renders the copyright line with the current year and app name', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-07-14T00:00:00.000Z'))

    render(<Footer />)

    expect(
      screen.getByText(
        `© 2026 ${APP_NAME}. Built with API-Football data.`,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Player stats, comparisons, and favorites — all in one place.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()

    jest.useRealTimers()
  })

  it('updates the copyright year when the system date changes', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2030-01-01T00:00:00.000Z'))

    render(<Footer />)

    expect(
      screen.getByText(
        `© 2030 ${APP_NAME}. Built with API-Football data.`,
      ),
    ).toBeInTheDocument()

    jest.useRealTimers()
  })
})
