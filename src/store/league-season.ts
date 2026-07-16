import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
  isAvailableLeagueId,
  isAvailableSeason,
} from '@/config/football'

export const LEAGUE_SEASON_STORAGE_KEY = 'football-dashboard-league-season'

export type LeagueSeasonPreference = {
  leagueId: number
  season: number
}

/** Returns false in non-browser runtimes (e.g. SSR). */
export function canUseLeagueSeasonStorage(
  scope: { window?: unknown } = globalThis,
): boolean {
  return typeof scope.window !== 'undefined'
}

export function getLeagueSeasonStorage(
  scope: { window?: unknown; localStorage?: Storage } = globalThis,
): Pick<Storage, 'getItem' | 'setItem'> | null {
  if (!canUseLeagueSeasonStorage(scope)) return null
  return scope.localStorage ?? localStorage
}

export function readLeagueSeasonPreference(
  scope: { window?: unknown; localStorage?: Storage } = globalThis,
): LeagueSeasonPreference {
  const storage = getLeagueSeasonStorage(scope)
  if (!storage) {
    return { leagueId: DEFAULT_LEAGUE_ID, season: DEFAULT_SEASON }
  }

  try {
    const raw = storage.getItem(LEAGUE_SEASON_STORAGE_KEY)
    if (!raw) {
      return { leagueId: DEFAULT_LEAGUE_ID, season: DEFAULT_SEASON }
    }

    const parsed = JSON.parse(raw) as Partial<LeagueSeasonPreference>
    const leagueId = Number(parsed.leagueId)
    const season = Number(parsed.season)

    return {
      leagueId: isAvailableLeagueId(leagueId) ? leagueId : DEFAULT_LEAGUE_ID,
      season: isAvailableSeason(season) ? season : DEFAULT_SEASON,
    }
  } catch {
    return { leagueId: DEFAULT_LEAGUE_ID, season: DEFAULT_SEASON }
  }
}

export function writeLeagueSeasonPreference(
  preference: LeagueSeasonPreference,
  scope: { window?: unknown; localStorage?: Storage } = globalThis,
): void {
  const storage = getLeagueSeasonStorage(scope)
  if (!storage) return

  storage.setItem(LEAGUE_SEASON_STORAGE_KEY, JSON.stringify(preference))
}
