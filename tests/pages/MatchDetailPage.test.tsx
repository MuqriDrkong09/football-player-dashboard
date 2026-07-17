import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ApiError } from '@/api/errors'
import { MatchDetailPage } from '@/pages/MatchDetailPage'
import { createFixture } from '../fixtures/fixtures'

jest.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: jest.fn(),
}))

jest.mock('@/hooks/use-fixture', () => ({
  useFixture: jest.fn(),
}))

import { useFixture } from '@/hooks/use-fixture'

const mockedUseFixture = useFixture as jest.MockedFunction<typeof useFixture>

function mockFixture(partial: Partial<ReturnType<typeof useFixture>> = {}) {
  mockedUseFixture.mockReturnValue({
    fixture: null,
    isLoading: false,
    isError: false,
    error: null,
    errorMessage: null,
    refetch: jest.fn(),
    isFetching: false,
    ...partial,
  } as ReturnType<typeof useFixture>)
}

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={['/teams/40', path]} initialIndex={1}>
      <Routes>
        <Route path="/matches/:matchId" element={<MatchDetailPage />} />
        <Route path="/teams" element={<p>Teams list</p>} />
        <Route path="/teams/:teamId" element={<p>Team page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('pages/MatchDetailPage', () => {
  beforeEach(() => {
    mockedUseFixture.mockReset()
  })

  it('handles invalid and missing matches', () => {
    mockFixture()
    renderPage('/matches/abc')
    expect(screen.getByText('Invalid match')).toBeInTheDocument()

    mockFixture({ fixture: null, isLoading: false, isError: false })
    renderPage('/matches/99')
    expect(screen.getByText('Match not found')).toBeInTheDocument()
  })

  it('shows a loading skeleton while the fixture loads', () => {
    mockFixture({ isLoading: true })

    renderPage('/matches/10')

    expect(screen.queryByText('Match not found')).not.toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows not-found for API NOT_FOUND errors', () => {
    mockFixture({
      isError: true,
      error: new ApiError('Gone', { code: 'NOT_FOUND', statusCode: 404 }),
    })
    renderPage('/matches/10')
    expect(screen.getByText('Match not found')).toBeInTheDocument()
  })

  it('shows query errors with retry', async () => {
    const user = userEvent.setup()
    const refetch = jest.fn()
    mockFixture({
      isError: true,
      error: new Error('boom'),
      errorMessage: 'Match failed',
      refetch,
    })

    renderPage('/matches/10')
    expect(screen.getByText(/match failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('shows the default message when an error has no message', () => {
    mockFixture({
      isError: true,
      error: new Error('boom'),
      errorMessage: null,
    })

    renderPage('/matches/10')

    expect(
      screen.getByText('Failed to load match details.'),
    ).toBeInTheDocument()
  })

  it('renders completed match details and navigates back', async () => {
    const user = userEvent.setup()
    mockFixture({
      fixture: createFixture({
        statusShort: 'FT',
        statusLong: 'Match Finished',
        goals: { home: 2, away: 1 },
      }),
    })

    renderPage('/matches/1001')

    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.getByText('Manchester United')).toBeInTheDocument()
    expect(screen.getByText('2 – 1')).toBeInTheDocument()
    expect(screen.getByText('Match Finished')).toBeInTheDocument()
    expect(screen.getByText('Michael Oliver')).toBeInTheDocument()
    expect(screen.getByText(/Anfield/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Team page')).toBeInTheDocument()
  })

  it('renders upcoming match details using the short status', () => {
    mockFixture({
      fixture: createFixture({
        statusShort: 'NS',
        statusLong: null,
        referee: null,
        venue: { name: null, city: null },
        league: { round: null, country: '' },
      }),
    })

    renderPage('/matches/10')

    expect(screen.getByText('vs')).toBeInTheDocument()
    expect(screen.getByText('NS')).toBeInTheDocument()
    expect(screen.queryByText('Referee')).not.toBeInTheDocument()
    expect(screen.queryByText('Country')).not.toBeInTheDocument()
  })

  it('falls back to Scheduled when both status labels are missing', () => {
    mockFixture({
      fixture: createFixture({
        statusShort: null,
        statusLong: null,
      }),
    })

    renderPage('/matches/10')

    expect(screen.getByText('Scheduled')).toBeInTheDocument()
  })
})
