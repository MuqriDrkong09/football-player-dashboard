import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useFixture } from '@/hooks/use-fixture'
import { createFixture } from '../fixtures/fixtures'

jest.mock('@/services/fixtures.service', () => ({
  getFixture: jest.fn(),
}))

import { getFixture } from '@/services/fixtures.service'

const mockedGetFixture = getFixture as jest.MockedFunction<typeof getFixture>

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

describe('hooks/useFixture', () => {
  beforeEach(() => {
    mockedGetFixture.mockReset()
  })

  it('does not fetch when id is invalid', () => {
    const { result } = renderHook(() => useFixture(0), {
      wrapper: createWrapper(),
    })

    expect(result.current.fixture).toBeNull()
    expect(mockedGetFixture).not.toHaveBeenCalled()
  })

  it('loads a fixture by id', async () => {
    const fixture = createFixture({ id: 88 })
    mockedGetFixture.mockResolvedValueOnce(fixture)

    const { result } = renderHook(() => useFixture(88), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.fixture).toEqual(fixture)
    expect(mockedGetFixture).toHaveBeenCalledWith(88)
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetFixture.mockRejectedValueOnce(new Error('Fixture unavailable'))

    const { result } = renderHook(() => useFixture(88), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.errorMessage).toMatch(/fixture unavailable/i)
  })
})
