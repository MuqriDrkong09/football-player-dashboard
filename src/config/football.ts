export const DEFAULT_LEAGUE_ID = 39 // Premier League
export const DEFAULT_SEASON = 2024

export const HOME_LIMITS = {
  featuredPlayers: 6,
  topScorers: 6,
  topAssists: 6,
  popularTeams: 8,
} as const

export const LEAGUE_LABEL = 'Premier League'

/** Formats a season start year as `YYYY/YY` (e.g. 2024 → 2024/25). */
export function formatSeasonLabel(season: number): string {
  const next = String(season + 1).slice(-2)
  return `${season}/${next}`
}
