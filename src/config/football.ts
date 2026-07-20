export const DEFAULT_LEAGUE_ID = 39 // Premier League
export const DEFAULT_SEASON = 2024

export const HOME_LIMITS = {
  featuredPlayers: 6,
  topScorers: 6,
  topAssists: 6,
  popularTeams: 8,
} as const

export const TEAM_FIXTURE_LIMITS = {
  upcoming: 5,
  recent: 5,
} as const

export const LEAGUE_FIXTURE_LIMITS = {
  upcoming: 10,
  recent: 10,
} as const

export type LeagueOption = {
  id: number
  name: string
  country: string
}

export const AVAILABLE_LEAGUES: readonly LeagueOption[] = [
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga', country: 'Spain' },
  { id: 135, name: 'Serie A', country: 'Italy' },
  { id: 78, name: 'Bundesliga', country: 'Germany' },
  { id: 61, name: 'Ligue 1', country: 'France' },
] as const

export const AVAILABLE_SEASONS = [2024, 2023, 2022] as const

export const LEAGUE_LABEL = 'Premier League'

export function getLeagueById(leagueId: number): LeagueOption | undefined {
  return AVAILABLE_LEAGUES.find((league) => league.id === leagueId)
}

export function getLeagueLabel(leagueId: number): string {
  return getLeagueById(leagueId)?.name ?? LEAGUE_LABEL
}

export function isAvailableLeagueId(leagueId: number): boolean {
  return AVAILABLE_LEAGUES.some((league) => league.id === leagueId)
}

export function isAvailableSeason(season: number): boolean {
  return (AVAILABLE_SEASONS as readonly number[]).includes(season)
}

/** Keep only seasons the current API plan can query (2022–2024 on free). */
export function filterAccessibleSeasons(seasons: number[]): number[] {
  return seasons.filter(isAvailableSeason)
}

/** Formats a season start year as `YYYY/YY` (e.g. 2024 → 2024/25). */
export function formatSeasonLabel(season: number): string {
  const next = String(season + 1).slice(-2)
  return `${season}/${next}`
}
