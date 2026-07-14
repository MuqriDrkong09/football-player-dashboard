import {
  getLeaderboardTab,
  isLeaderboardTabValue,
  LEADERBOARD_TABS,
} from '@/config/leaderboards'

describe('config/leaderboards', () => {
  it('defines four leaderboard tabs', () => {
    expect(LEADERBOARD_TABS).toHaveLength(4)
    expect(LEADERBOARD_TABS.map((tab) => tab.value)).toEqual([
      'scorers',
      'assists',
      'yellow-cards',
      'red-cards',
    ])
  })

  it('maps each tab to a primary stat and matching queryKind', () => {
    for (const tab of LEADERBOARD_TABS) {
      expect(tab.queryKind).toBe(tab.value)
      expect(tab.primaryStat).toBeTruthy()
      expect(tab.label).toBeTruthy()
    }
  })

  it('resolves known and unknown tab values', () => {
    expect(getLeaderboardTab('assists').value).toBe('assists')
    expect(getLeaderboardTab('unknown').value).toBe('scorers')
  })

  it('type-guards leaderboard tab values', () => {
    expect(isLeaderboardTabValue('scorers')).toBe(true)
    expect(isLeaderboardTabValue('yellow-cards')).toBe(true)
    expect(isLeaderboardTabValue('goals')).toBe(false)
  })
})
