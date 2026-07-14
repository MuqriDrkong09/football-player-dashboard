import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
  formatSeasonLabel,
  HOME_LIMITS,
  LEAGUE_LABEL,
} from '@/config/football'

describe('config/football', () => {
  it('exposes Premier League defaults', () => {
    expect(DEFAULT_LEAGUE_ID).toBe(39)
    expect(DEFAULT_SEASON).toBe(2024)
    expect(LEAGUE_LABEL).toBe('Premier League')
  })

  it('defines home section limits', () => {
    expect(HOME_LIMITS.featuredPlayers).toBe(6)
    expect(HOME_LIMITS.topScorers).toBe(6)
    expect(HOME_LIMITS.topAssists).toBe(6)
    expect(HOME_LIMITS.popularTeams).toBe(8)
  })

  it('formats season labels as YYYY/YY', () => {
    expect(formatSeasonLabel(2024)).toBe('2024/25')
    expect(formatSeasonLabel(1999)).toBe('1999/00')
    expect(formatSeasonLabel(2009)).toBe('2009/10')
  })
})
