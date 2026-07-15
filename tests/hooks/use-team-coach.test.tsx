import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTeamCoach } from '@/hooks/use-team-coach'
import type { Coach } from '@/types/api-football'

jest.mock('@/services/teams.service', () => ({
  getTeamCoach: jest.fn(),
}))

import { getTeamCoach } from '@/services/teams.service'

const mockedGetTeamCoach = getTeamCoach as jest.MockedFunction<
  typeof getTeamCoach
>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

function createCoach(overrides: Partial<Coach> = {}): Coach {
  return {
    id: 1,
    name: 'Arne Slot',
    firstname: 'Arne',
    lastname: 'Slot',
    age: 46,
    nationality: 'Netherlands',
    photo: null,
    team: { id: 40, name: 'Liverpool', logo: '' },
    career: [],
    ...overrides,
  }
}

describe('hooks/useTeamCoach', () => {
  beforeEach(() => {
    mockedGetTeamCoach.mockReset()
  })

  it('does not fetch when team id is missing', () => {
    const { result } = renderHook(() => useTeamCoach({ team: 0 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.coach).toBeNull()
    expect(result.current.errorMessage).toBeNull()
    expect(mockedGetTeamCoach).not.toHaveBeenCalled()
  })

  it('loads the current team coach', async () => {
    mockedGetTeamCoach.mockResolvedValueOnce(createCoach())

    const { result } = renderHook(() => useTeamCoach({ team: 40 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetTeamCoach).toHaveBeenCalledWith({ team: 40 })
    expect(result.current.coach?.name).toBe('Arne Slot')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('returns null coach when the service finds nothing', async () => {
    mockedGetTeamCoach.mockResolvedValueOnce(null)

    const { result } = renderHook(() => useTeamCoach({ team: 40 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.coach).toBeNull()
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetTeamCoach.mockRejectedValueOnce(new Error('Coach unavailable'))

    const { result } = renderHook(() => useTeamCoach({ team: 40 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.coach).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Coach unavailable')
  })

  it('forwards extra query options', async () => {
    mockedGetTeamCoach.mockResolvedValueOnce(
      createCoach({ name: 'Cached Coach' }),
    )

    const { result } = renderHook(
      () => useTeamCoach({ team: 40 }, { staleTime: 1_000 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.coach?.name).toBe('Cached Coach')
  })
})
