import { apiGet } from '@/api/client'
import type {
  Coach,
  GetStandingsParams,
  GetTeamCoachParams,
  GetTeamParams,
  GetTeamsParams,
  GetTeamStatisticsParams,
  PaginatedResult,
  StandingResponseItem,
  StandingRow,
  Team,
  TeamStatistics,
} from '@/types/api-football'

export async function getTeams(
  params?: GetTeamsParams,
): Promise<PaginatedResult<Team[]>> {
  return apiGet<Team[]>('/teams', params)
}

export async function getTeam(params: GetTeamParams): Promise<Team | null> {
  const { data } = await apiGet<Team[]>('/teams', params)
  return data[0] ?? null
}

export async function getTeamStatistics(
  params: GetTeamStatisticsParams,
): Promise<TeamStatistics | null> {
  const { data, results } = await apiGet<TeamStatistics>('/teams/statistics', params)
  return results > 0 ? data : null
}

export async function getTeamCoaches(
  params: GetTeamCoachParams,
): Promise<Coach[]> {
  const { data } = await apiGet<Coach[]>('/coachs', params)
  return data
}

/** Prefers the coach currently at the team (career end is null). */
export async function getTeamCoach(
  params: GetTeamCoachParams,
): Promise<Coach | null> {
  const coaches = await getTeamCoaches(params)
  if (coaches.length === 0) return null

  const current = coaches.find((coach) =>
    coach?.career?.some(
      (item) => item.team.id === params.team && item.end == null,
    ),
  )

  return current ?? coaches[0] ?? null
}

export async function getStandings(
  params: GetStandingsParams,
): Promise<StandingResponseItem[]> {
  const { data } = await apiGet<StandingResponseItem[]>('/standings', params)
  return data
}

export async function getTeamStanding(
  params: GetStandingsParams & { team: number },
): Promise<StandingRow | null> {
  const standings = await getStandings(params)
  const tables = standings[0]?.league.standings ?? []

  for (const table of tables) {
    const match = table.find((row) => row.team.id === params.team)
    if (match) return match
  }

  return null
}
