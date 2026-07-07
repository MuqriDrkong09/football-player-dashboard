import { apiGet } from '@/api/client'
import type {
  GetTeamsParams,
  PaginatedResult,
  Team,
} from '@/types/api-football'

export async function getTeams(
  params?: GetTeamsParams,
): Promise<PaginatedResult<Team[]>> {
  return apiGet<Team[]>('/teams', params)
}
