import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/api/errors'

const STALE_TIME = 1000 * 60 * 5 // 5 minutes
const GC_TIME = 1000 * 60 * 10 // 10 minutes
const MAX_RETRIES = 3

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false

  if (isApiError(error)) {
    if (error.code === 'UNAUTHORIZED' || error.code === 'NOT_FOUND') {
      return false
    }

    if (error.code === 'RATE_LIMIT') {
      return failureCount < 2
    }
  }

  return true
}

function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 30_000)
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
    },
  },
})

export { GC_TIME, MAX_RETRIES, STALE_TIME }
