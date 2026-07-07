import { apiGet } from '@/api/client'
import type {
  GetLeaguesParams,
  League,
  PaginatedResult,
} from '@/types/api-football'

export async function getLeagues(
  params?: GetLeaguesParams,
): Promise<PaginatedResult<League[]>> {
  return apiGet<League[]>('/leagues', params)
}
