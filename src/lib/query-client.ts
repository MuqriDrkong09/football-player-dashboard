import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/api/errors'

/** Default stale window for list/detail football data. */
const STALE_TIME = 1000 * 60 * 10 // 10 minutes
/** Keep unused query results in memory longer to speed revisits. */
const GC_TIME = 1000 * 60 * 30 // 30 minutes
/** Search suggestions stay fresher and are discarded sooner. */
const SEARCH_STALE_TIME = 1000 * 60
const SEARCH_GC_TIME = 1000 * 60 * 5
/** Leaderboards change infrequently within a session. */
const LEADERBOARD_STALE_TIME = 1000 * 60 * 15
const MAX_RETRIES = 2

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false

  if (isApiError(error)) {
    if (
      error.code === 'UNAUTHORIZED' ||
      error.code === 'NOT_FOUND' ||
      error.code === 'API_ERROR'
    ) {
      return false
    }

    if (error.code === 'RATE_LIMIT') {
      return failureCount < 1
    }
  }

  return true
}

function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 15_000)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: shouldRetry,
      retryDelay,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      structuralSharing: true,
      networkMode: 'online',
    },
  },
})

export {
  GC_TIME,
  LEADERBOARD_STALE_TIME,
  MAX_RETRIES,
  SEARCH_GC_TIME,
  SEARCH_STALE_TIME,
  STALE_TIME,
}
