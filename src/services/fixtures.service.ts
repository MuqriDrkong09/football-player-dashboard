import { apiGet } from '@/api/client'
import { TEAM_FIXTURE_LIMITS } from '@/config/football'
import type {
  Fixture,
  GetFixturesParams,
} from '@/types/api-football'
import {
  pickRecentFixtures,
  pickUpcomingFixtures,
} from '@/utils/fixture'

export type TeamSeasonFixturesParams = {
  team: number
  season: number
  league?: number
}

export type TeamSeasonFixturesResult = {
  upcoming: Fixture[]
  recent: Fixture[]
}

export async function getFixtures(
  params?: GetFixturesParams,
): Promise<Fixture[]> {
  const { data } = await apiGet<Fixture[]>('/fixtures', params)
  return data
}

export async function getFixture(id: number): Promise<Fixture | null> {
  const fixtures = await getFixtures({ id })
  return fixtures[0] ?? null
}

/**
 * Free-plan safe: uses team + season (+ optional league), then splits
 * upcoming/recent client-side. Avoids restricted `next` / `last` params.
 */
export async function getTeamSeasonFixtures(
  params: TeamSeasonFixturesParams,
  limits: {
    upcoming?: number
    recent?: number
  } = {},
): Promise<TeamSeasonFixturesResult> {
  const upcomingLimit = limits.upcoming ?? TEAM_FIXTURE_LIMITS.upcoming
  const recentLimit = limits.recent ?? TEAM_FIXTURE_LIMITS.recent

  const fixtures = await getFixtures({
    team: params.team,
    season: params.season,
    ...(params.league != null ? { league: params.league } : {}),
  })

  return {
    upcoming: pickUpcomingFixtures(fixtures, upcomingLimit),
    recent: pickRecentFixtures(fixtures, recentLimit),
  }
}
