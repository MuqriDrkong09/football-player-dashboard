import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getFixture } from '@/services/fixtures.service'
import type { Fixture } from '@/types/api-football'

type UseFixtureOptions = Omit<
  UseQueryOptions<Fixture | null, Error, Fixture | null>,
  'queryKey' | 'queryFn'
>

export function useFixture(id: number, options?: UseFixtureOptions) {
  const query = useQuery({
    queryKey: queryKeys.fixtures.detail(id),
    queryFn: () => getFixture(id),
    enabled: id > 0,
    ...options,
  })

  return {
    ...query,
    fixture: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
