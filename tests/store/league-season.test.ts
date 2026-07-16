import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
} from '@/config/football'
import {
  LEAGUE_SEASON_STORAGE_KEY,
  canUseLeagueSeasonStorage,
  getLeagueSeasonStorage,
  readLeagueSeasonPreference,
  writeLeagueSeasonPreference,
} from '@/store/league-season'

describe('store/league-season', () => {
  const memory = new Map<string, string>()
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value)
    },
  }

  beforeEach(() => {
    memory.clear()
    localStorage.clear()
  })

  it('detects browser storage availability', () => {
    expect(canUseLeagueSeasonStorage({ window: {} })).toBe(true)
    expect(canUseLeagueSeasonStorage({} as { window?: unknown })).toBe(false)
    expect(canUseLeagueSeasonStorage()).toBe(true)
  })

  it('returns defaults when storage is unavailable', () => {
    expect(readLeagueSeasonPreference({} as { window?: unknown })).toEqual({
      leagueId: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    })
    expect(getLeagueSeasonStorage({} as { window?: unknown })).toBeNull()
  })

  it('uses scope localStorage when provided and falls back to global localStorage', () => {
    expect(
      getLeagueSeasonStorage({ window: {}, localStorage: storage }),
    ).toBe(storage)
    expect(getLeagueSeasonStorage({ window: {} })).toBe(localStorage)
    expect(getLeagueSeasonStorage()).toBe(localStorage)
  })

  it('reads and writes preferences', () => {
    writeLeagueSeasonPreference(
      { leagueId: 140, season: 2023 },
      { window: {}, localStorage: storage },
    )

    expect(memory.get(LEAGUE_SEASON_STORAGE_KEY)).toContain('140')
    expect(
      readLeagueSeasonPreference({ window: {}, localStorage: storage }),
    ).toEqual({ leagueId: 140, season: 2023 })
  })

  it('returns defaults when storage has no saved preference', () => {
    expect(
      readLeagueSeasonPreference({ window: {}, localStorage: storage }),
    ).toEqual({ leagueId: DEFAULT_LEAGUE_ID, season: DEFAULT_SEASON })
  })

  it('falls back to defaults for invalid or corrupt storage', () => {
    memory.set(LEAGUE_SEASON_STORAGE_KEY, '{bad json')
    expect(
      readLeagueSeasonPreference({ window: {}, localStorage: storage }),
    ).toEqual({ leagueId: DEFAULT_LEAGUE_ID, season: DEFAULT_SEASON })

    memory.set(
      LEAGUE_SEASON_STORAGE_KEY,
      JSON.stringify({ leagueId: 999, season: 1999 }),
    )
    expect(
      readLeagueSeasonPreference({ window: {}, localStorage: storage }),
    ).toEqual({ leagueId: DEFAULT_LEAGUE_ID, season: DEFAULT_SEASON })
  })

  it('keeps a valid league and replaces an invalid season with the default', () => {
    memory.set(
      LEAGUE_SEASON_STORAGE_KEY,
      JSON.stringify({ leagueId: 140, season: 1999 }),
    )

    expect(
      readLeagueSeasonPreference({ window: {}, localStorage: storage }),
    ).toEqual({ leagueId: 140, season: DEFAULT_SEASON })
  })

  it('keeps a valid season and replaces an invalid league with the default', () => {
    memory.set(
      LEAGUE_SEASON_STORAGE_KEY,
      JSON.stringify({ leagueId: 999, season: 2022 }),
    )

    expect(
      readLeagueSeasonPreference({ window: {}, localStorage: storage }),
    ).toEqual({ leagueId: DEFAULT_LEAGUE_ID, season: 2022 })
  })

  it('writes to the real localStorage when called without a custom scope', () => {
    writeLeagueSeasonPreference({ leagueId: 78, season: 2021 })

    expect(localStorage.getItem(LEAGUE_SEASON_STORAGE_KEY)).toBe(
      JSON.stringify({ leagueId: 78, season: 2021 }),
    )
    expect(readLeagueSeasonPreference()).toEqual({
      leagueId: 78,
      season: 2021,
    })
  })

  it('no-ops writes when storage is unavailable', () => {
    expect(() =>
      writeLeagueSeasonPreference(
        { leagueId: 39, season: 2024 },
        {} as { window?: unknown },
      ),
    ).not.toThrow()
  })
})
