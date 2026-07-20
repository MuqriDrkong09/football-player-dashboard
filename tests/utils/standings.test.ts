import {
  filterStandingRows,
  getFavoriteTeamNames,
  getStandingZone,
  isFavoriteStandingTeam,
  sortStandingRows,
  STANDING_ZONE_LEGEND,
  STANDING_ZONE_STYLES,
} from '@/utils/standings'
import { createStandingRow } from '../fixtures/standings'

describe('utils/standings', () => {
  it('classifies qualification and relegation zones from descriptions', () => {
    expect(getStandingZone(null)).toBeNull()
    expect(getStandingZone('')).toBeNull()
    expect(getStandingZone('Mid-table')).toBeNull()

    expect(
      getStandingZone('Promotion - Champions League (League Phase)'),
    ).toBe('champions-league')
    expect(getStandingZone('UEFA Champions League Qualification')).toBe(
      'champions-league',
    )
    expect(getStandingZone('Promotion - Europa League')).toBe('europa-league')
    expect(getStandingZone('UEFA Europa League Qualification')).toBe(
      'europa-league',
    )
    expect(getStandingZone('Promotion - Conference League')).toBe(
      'conference-league',
    )
    expect(getStandingZone('Relegation - Championship')).toBe('relegation')
    expect(getStandingZone('Relegation')).toBe('relegation')
  })

  it('exposes styles and legend entries for each highlighted zone', () => {
    expect(Object.keys(STANDING_ZONE_STYLES)).toEqual([
      'champions-league',
      'europa-league',
      'conference-league',
      'relegation',
    ])
    expect(STANDING_ZONE_LEGEND.map((entry) => entry.zone)).toEqual([
      'champions-league',
      'europa-league',
      'conference-league',
      'relegation',
    ])
  })

  it('filters teams by search query', () => {
    const rows = [
      createStandingRow({ team: { id: 1, name: 'Arsenal', logo: '' } }),
      createStandingRow({
        rank: 2,
        team: { id: 2, name: 'Liverpool', logo: '' },
      }),
    ]

    expect(filterStandingRows(rows, '')).toHaveLength(2)
    expect(filterStandingRows(rows, '  ars  ').map((row) => row.team.name)).toEqual([
      'Arsenal',
    ])
    expect(filterStandingRows(rows, 'zzz')).toHaveLength(0)
  })

  it('sorts by position, points, and name', () => {
    const rows = [
      createStandingRow({
        rank: 2,
        points: 70,
        team: { id: 2, name: 'Chelsea', logo: '' },
      }),
      createStandingRow({
        rank: 1,
        points: 80,
        team: { id: 1, name: 'Arsenal', logo: '' },
      }),
      createStandingRow({
        rank: 3,
        points: 70,
        team: { id: 3, name: 'Brentford', logo: '' },
      }),
    ]

    expect(
      sortStandingRows(rows, 'position').map((row) => row.team.name),
    ).toEqual(['Arsenal', 'Chelsea', 'Brentford'])
    expect(
      sortStandingRows(rows, 'points').map((row) => row.team.name),
    ).toEqual(['Arsenal', 'Chelsea', 'Brentford'])
    expect(sortStandingRows(rows, 'name').map((row) => row.team.name)).toEqual([
      'Arsenal',
      'Brentford',
      'Chelsea',
    ])
  })

  it('uses sort tiebreakers and the default position order', () => {
    const samePointsAndRank = [
      createStandingRow({
        rank: 4,
        points: 55,
        team: { id: 20, name: 'Team B', logo: '' },
      }),
      createStandingRow({
        rank: 4,
        points: 55,
        team: { id: 10, name: 'Team A', logo: '' },
      }),
    ]

    expect(
      sortStandingRows(samePointsAndRank, 'points').map((row) => row.team.id),
    ).toEqual([10, 20])
    expect(
      sortStandingRows(samePointsAndRank, 'position').map((row) => row.team.id),
    ).toEqual([10, 20])
    expect(
      sortStandingRows(samePointsAndRank, 'unknown' as never).map(
        (row) => row.team.id,
      ),
    ).toEqual([10, 20])

    const sameName = [
      createStandingRow({
        rank: 8,
        team: { id: 8, name: 'United', logo: '' },
      }),
      createStandingRow({
        rank: 3,
        team: { id: 3, name: 'United', logo: '' },
      }),
    ]

    expect(sortStandingRows(sameName, 'name').map((row) => row.rank)).toEqual([
      3, 8,
    ])
  })

  it('detects favorite teams from saved player clubs', () => {
    const names = getFavoriteTeamNames([
      { teamName: 'Liverpool' },
      { teamName: '  Arsenal ' },
      { teamName: null },
      { teamName: '' },
    ])

    expect(isFavoriteStandingTeam('Liverpool', names)).toBe(true)
    expect(isFavoriteStandingTeam('arsenal', names)).toBe(true)
    expect(isFavoriteStandingTeam('Chelsea', names)).toBe(false)
  })
})
