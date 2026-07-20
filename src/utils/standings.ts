import type { StandingRow } from '@/types/api-football'

export type StandingZone =
  | 'champions-league'
  | 'europa-league'
  | 'conference-league'
  | 'relegation'
  | null

export type StandingsSortBy = 'position' | 'points' | 'name'

/**
 * Classify a standing row using API-Football's `description` field
 * (e.g. "Promotion - Champions League", "Relegation").
 */
export function getStandingZone(description: string | null): StandingZone {
  if (!description) return null

  const value = description.toLowerCase()

  if (value.includes('relegation')) return 'relegation'
  if (value.includes('champions league')) return 'champions-league'
  if (value.includes('europa league')) return 'europa-league'
  if (value.includes('conference league')) return 'conference-league'

  return null
}

export const STANDING_ZONE_STYLES: Record<
  Exclude<StandingZone, null>,
  string
> = {
  'champions-league': 'border-l-4 border-l-sky-500 bg-sky-500/5',
  'europa-league': 'border-l-4 border-l-amber-500 bg-amber-500/5',
  'conference-league': 'border-l-4 border-l-emerald-500 bg-emerald-500/5',
  relegation: 'border-l-4 border-l-destructive bg-destructive/5',
}

export const STANDING_ZONE_LEGEND: Array<{
  zone: Exclude<StandingZone, null>
  label: string
  swatch: string
}> = [
  {
    zone: 'champions-league',
    label: 'Champions League',
    swatch: 'bg-sky-500',
  },
  {
    zone: 'europa-league',
    label: 'Europa League',
    swatch: 'bg-amber-500',
  },
  {
    zone: 'conference-league',
    label: 'Conference League',
    swatch: 'bg-emerald-500',
  },
  {
    zone: 'relegation',
    label: 'Relegation',
    swatch: 'bg-destructive',
  },
]

export const FAVORITE_TEAM_ROW_STYLE =
  'ring-2 ring-inset ring-primary/40 bg-primary/5'

export function filterStandingRows(
  rows: StandingRow[],
  search: string,
): StandingRow[] {
  const query = search.trim().toLowerCase()
  if (!query) return rows

  return rows.filter((row) => row.team.name.toLowerCase().includes(query))
}

export function sortStandingRows(
  rows: StandingRow[],
  sortBy: StandingsSortBy,
): StandingRow[] {
  const next = [...rows]

  switch (sortBy) {
    case 'points':
      return next.sort(
        (a, b) => b.points - a.points || a.rank - b.rank || a.team.id - b.team.id,
      )
    case 'name':
      return next.sort(
        (a, b) =>
          a.team.name.localeCompare(b.team.name) || a.rank - b.rank,
      )
    case 'position':
    default:
      return next.sort((a, b) => a.rank - b.rank || a.team.id - b.team.id)
  }
}

export function getFavoriteTeamNames(
  favorites: Array<{ teamName: string | null }>,
): Set<string> {
  const names = new Set<string>()

  for (const favorite of favorites) {
    const name = favorite.teamName?.trim().toLowerCase()
    if (name) names.add(name)
  }

  return names
}

export function isFavoriteStandingTeam(
  teamName: string,
  favoriteTeamNames: Set<string>,
): boolean {
  return favoriteTeamNames.has(teamName.trim().toLowerCase())
}
