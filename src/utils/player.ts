import type { PlayerProfile, PlayerStatistics } from '@/types/api-football'
import type { PlayerPosition } from '@/config/players'
import { DEFAULT_SEASON, formatSeasonLabel } from '@/config/football'

export interface AggregatedPlayerStats {
  goals: number
  assists: number
  minutes: number
  matches: number
  yellowCards: number
  redCards: number
}

export interface CompetitionChartData {
  name: string
  goals: number
  assists: number
  minutes: number
  matches: number
  yellowCards: number
  redCards: number
}

export interface PlayerSeasonHistoryRow {
  season: number
  team: { id: number; name: string; logo: string } | null
  league: { id: number; name: string; logo: string } | null
  appearances: number
  goals: number
  assists: number
  minutes: number
  yellowCards: number
  redCards: number
}

export interface SeasonTrendChartPoint {
  season: number
  label: string
  goals: number
  assists: number
  matches: number
  minutes: number
}

export function getPrimaryStatistics(profile: PlayerProfile) {
  return profile.statistics[0] ?? null
}

/** Prefer the competition with the most appearances for team/league display. */
export function getPrimaryCompetition(
  statistics: PlayerStatistics[],
): PlayerStatistics | null {
  if (statistics.length === 0) return null

  return statistics.reduce((best, current) => {
    const bestApps = best.games?.appearences ?? 0
    const currentApps = current.games?.appearences ?? 0
    return currentApps > bestApps ? current : best
  })
}

export function aggregatePlayerStatistics(
  statistics: PlayerStatistics[],
): AggregatedPlayerStats {
  return statistics.reduce<AggregatedPlayerStats>(
    (totals, stat) => ({
      goals: totals.goals + (stat.goals?.total ?? 0),
      assists: totals.assists + (stat.goals?.assists ?? 0),
      minutes: totals.minutes + (stat.games?.minutes ?? 0),
      matches: totals.matches + (stat.games?.appearences ?? 0),
      yellowCards: totals.yellowCards + (stat.cards?.yellow ?? 0),
      redCards: totals.redCards + (stat.cards?.red ?? 0),
    }),
    {
      goals: 0,
      assists: 0,
      minutes: 0,
      matches: 0,
      yellowCards: 0,
      redCards: 0,
    },
  )
}

export function buildPlayerSeasonHistoryRow(
  season: number,
  profile: PlayerProfile | null,
): PlayerSeasonHistoryRow {
  if (!profile || profile.statistics.length === 0) {
    return {
      season,
      team: null,
      league: null,
      appearances: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
      yellowCards: 0,
      redCards: 0,
    }
  }

  const primary = getPrimaryCompetition(profile.statistics)
  const aggregated = aggregatePlayerStatistics(profile.statistics)

  // Empty statistics already returned above, so a primary competition always exists.
  const competition = primary!

  return {
    season,
    team: {
      id: competition.team.id,
      name: competition.team.name,
      logo: competition.team.logo,
    },
    league: {
      id: competition.league.id,
      name: competition.league.name,
      logo: competition.league.logo,
    },
    appearances: aggregated.matches,
    goals: aggregated.goals,
    assists: aggregated.assists,
    minutes: aggregated.minutes,
    yellowCards: aggregated.yellowCards,
    redCards: aggregated.redCards,
  }
}

export function buildPlayerSeasonHistoryRows(
  seasons: number[],
  profilesBySeason: Map<number, PlayerProfile | null>,
): PlayerSeasonHistoryRow[] {
  return [...seasons]
    .sort((a, b) => b - a)
    .map((season) =>
      buildPlayerSeasonHistoryRow(season, profilesBySeason.get(season) ?? null),
    )
}

/** Chronological season points for goals/assists/matches/minutes trend charts. */
export function getSeasonTrendChartData(
  rows: PlayerSeasonHistoryRow[],
): SeasonTrendChartPoint[] {
  return [...rows]
    .sort((a, b) => a.season - b.season)
    .map((row) => ({
      season: row.season,
      label: formatSeasonLabel(row.season),
      goals: row.goals,
      assists: row.assists,
      matches: row.appearances,
      minutes: row.minutes,
    }))
}

export function getCompetitionChartData(
  statistics: PlayerStatistics[],
): CompetitionChartData[] {
  return statistics.map((stat) => ({
    name: stat.league.name,
    goals: stat.goals?.total ?? 0,
    assists: stat.goals?.assists ?? 0,
    minutes: stat.games?.minutes ?? 0,
    matches: stat.games?.appearences ?? 0,
    yellowCards: stat.cards?.yellow ?? 0,
    redCards: stat.cards?.red ?? 0,
  }))
}

export function pickDefaultSeason(seasons: number[]): number | null {
  if (seasons.length === 0) return null
  if (seasons.includes(DEFAULT_SEASON)) return DEFAULT_SEASON
  return Math.max(...seasons)
}

export function filterPlayersByPosition(
  players: PlayerProfile[],
  position: PlayerPosition | 'all',
): PlayerProfile[] {
  if (position === 'all') return players

  return players.filter((profile) => {
    const stats = getPrimaryStatistics(profile)
    return stats?.games?.position === position
  })
}

export function filterPlayersByNationality(
  players: PlayerProfile[],
  nationality: string,
): PlayerProfile[] {
  if (nationality === 'all') return players

  return players.filter((profile) => profile.player.nationality === nationality)
}

export function getUniqueNationalities(players: PlayerProfile[]): string[] {
  const nationalities = players
    .map((profile) => profile.player.nationality)
    .filter((value): value is string => Boolean(value))

  return [...new Set(nationalities)].sort()
}
