import {
  AVAILABLE_LEAGUES,
  AVAILABLE_SEASONS,
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
  formatSeasonLabel,
  getLeagueById,
  getLeagueLabel,
  HOME_LIMITS,
  isAvailableLeagueId,
  isAvailableSeason,
  LEAGUE_LABEL,
  TEAM_FIXTURE_LIMITS,
  LEAGUE_FIXTURE_LIMITS,
} from '@/config/football'

describe('config/football', () => {
  it('exposes Premier League defaults', () => {
    expect(DEFAULT_LEAGUE_ID).toBe(39)
    expect(DEFAULT_SEASON).toBe(2024)
    expect(LEAGUE_LABEL).toBe('Premier League')
  })

  it('defines home section and fixture limits', () => {
    expect(HOME_LIMITS.featuredPlayers).toBe(6)
    expect(HOME_LIMITS.topScorers).toBe(6)
    expect(HOME_LIMITS.topAssists).toBe(6)
    expect(HOME_LIMITS.popularTeams).toBe(8)
    expect(TEAM_FIXTURE_LIMITS.upcoming).toBe(5)
    expect(TEAM_FIXTURE_LIMITS.recent).toBe(5)
    expect(LEAGUE_FIXTURE_LIMITS.upcoming).toBe(10)
    expect(LEAGUE_FIXTURE_LIMITS.recent).toBe(10)
  })

  it('exposes selectable leagues and seasons', () => {
    expect(AVAILABLE_LEAGUES.length).toBeGreaterThan(1)
    expect(AVAILABLE_SEASONS).toContain(2024)
    expect(getLeagueById(39)?.name).toBe('Premier League')
    expect(getLeagueLabel(140)).toBe('La Liga')
    expect(getLeagueLabel(999)).toBe('Premier League')
    expect(isAvailableLeagueId(39)).toBe(true)
    expect(isAvailableLeagueId(1)).toBe(false)
    expect(isAvailableSeason(2023)).toBe(true)
    expect(isAvailableSeason(2010)).toBe(false)
  })

  it('formats season labels as YYYY/YY', () => {
    expect(formatSeasonLabel(2024)).toBe('2024/25')
    expect(formatSeasonLabel(1999)).toBe('1999/00')
    expect(formatSeasonLabel(2009)).toBe('2009/10')
  })
})
