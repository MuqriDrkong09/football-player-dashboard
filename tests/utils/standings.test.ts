import {
  getStandingZone,
  STANDING_ZONE_LEGEND,
  STANDING_ZONE_STYLES,
} from '@/utils/standings'

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
})
