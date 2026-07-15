import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/errors'
import {
  GC_TIME,
  LEADERBOARD_STALE_TIME,
  MAX_RETRIES,
  SEARCH_GC_TIME,
  SEARCH_STALE_TIME,
  STALE_TIME,
  queryClient,
} from '@/lib/query-client'

const queryDefaults = queryClient.getDefaultOptions().queries!
const shouldRetry = queryDefaults.retry as (
  failureCount: number,
  error: unknown,
) => boolean
const retryDelay = queryDefaults.retryDelay as (attemptIndex: number) => number

describe('lib/query-client', () => {
  it('exposes tuned cache timing constants', () => {
    expect(STALE_TIME).toBe(1000 * 60 * 10)
    expect(GC_TIME).toBe(1000 * 60 * 30)
    expect(SEARCH_STALE_TIME).toBe(1000 * 60)
    expect(SEARCH_GC_TIME).toBe(1000 * 60 * 5)
    expect(LEADERBOARD_STALE_TIME).toBe(1000 * 60 * 15)
    expect(MAX_RETRIES).toBe(2)
  })

  it('configures a QueryClient with expected query defaults', () => {
    expect(queryClient).toBeInstanceOf(QueryClient)
    expect(queryDefaults).toMatchObject({
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      structuralSharing: true,
      networkMode: 'online',
    })
  })

  describe('shouldRetry', () => {
    it('stops retrying after MAX_RETRIES failures', () => {
      expect(shouldRetry(MAX_RETRIES, new Error('any'))).toBe(false)
      expect(shouldRetry(MAX_RETRIES + 1, new Error('any'))).toBe(false)
    })

    it('does not retry UNAUTHORIZED, NOT_FOUND, or API_ERROR', () => {
      expect(
        shouldRetry(0, new ApiError('denied', { code: 'UNAUTHORIZED' })),
      ).toBe(false)
      expect(
        shouldRetry(0, new ApiError('missing', { code: 'NOT_FOUND' })),
      ).toBe(false)
      expect(
        shouldRetry(0, new ApiError('api', { code: 'API_ERROR' })),
      ).toBe(false)
    })

    it('retries RATE_LIMIT only on the first attempt', () => {
      const rateLimit = new ApiError('slow down', { code: 'RATE_LIMIT' })

      expect(shouldRetry(0, rateLimit)).toBe(true)
      expect(shouldRetry(1, rateLimit)).toBe(false)
    })

    it('retries other ApiErrors and unknown errors', () => {
      expect(
        shouldRetry(0, new ApiError('offline', { code: 'NETWORK_ERROR' })),
      ).toBe(true)
      expect(shouldRetry(1, new Error('transient'))).toBe(true)
      expect(shouldRetry(0, 'string failure')).toBe(true)
    })
  })

  describe('retryDelay', () => {
    it('uses exponential backoff capped at 15 seconds', () => {
      expect(retryDelay(0)).toBe(1000)
      expect(retryDelay(1)).toBe(2000)
      expect(retryDelay(2)).toBe(4000)
      expect(retryDelay(3)).toBe(8000)
      expect(retryDelay(4)).toBe(15_000)
      expect(retryDelay(10)).toBe(15_000)
    })
  })
})
