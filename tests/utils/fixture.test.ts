import {
  formatFixtureDate,
  formatFixtureKickoff,
  formatFixtureScore,
  getFixtureCompetitionLabel,
  isFixtureCompleted,
  pickRecentFixtures,
  pickUpcomingFixtures,
} from '@/utils/fixture'
import { createFixture } from '../fixtures/fixtures'

describe('utils/fixture', () => {
  it('detects completed fixture statuses', () => {
    expect(isFixtureCompleted(createFixture({ statusShort: 'FT' }))).toBe(true)
    expect(isFixtureCompleted(createFixture({ statusShort: 'AET' }))).toBe(true)
    expect(isFixtureCompleted(createFixture({ statusShort: 'PEN' }))).toBe(true)
    expect(isFixtureCompleted(createFixture({ statusShort: 'NS' }))).toBe(false)
    expect(isFixtureCompleted(createFixture({ statusShort: null }))).toBe(false)
  })

  it('formats date and kickoff labels', () => {
    const date = formatFixtureDate('2024-08-17T14:00:00+00:00')
    const kickoff = formatFixtureKickoff('2024-08-17T14:00:00+00:00')

    expect(date).toMatch(/2024/)
    expect(kickoff.length).toBeGreaterThan(0)
    expect(formatFixtureDate('not-a-date')).toBe('Date TBD')
    expect(formatFixtureKickoff('not-a-date')).toBe('Kickoff TBD')
  })

  it('formats scores only for completed fixtures', () => {
    expect(formatFixtureScore(createFixture({ statusShort: 'NS' }))).toBeNull()
    expect(
      formatFixtureScore(
        createFixture({
          statusShort: 'FT',
          goals: { home: 2, away: 1 },
        }),
      ),
    ).toBe('2 – 1')
    expect(
      formatFixtureScore(
        createFixture({
          statusShort: 'FT',
          goals: { home: null, away: null },
          score: {
            fulltime: { home: 3, away: 0 },
            halftime: { home: null, away: null },
            extratime: { home: null, away: null },
            penalty: { home: null, away: null },
          },
        }),
      ),
    ).toBe('3 – 0')
    expect(
      formatFixtureScore(
        createFixture({
          statusShort: 'FT',
          goals: { home: null, away: null },
        }),
      ),
    ).toBeNull()
  })

  it('builds competition labels with optional round', () => {
    expect(getFixtureCompetitionLabel(createFixture())).toContain(
      'Premier League',
    )
    expect(
      getFixtureCompetitionLabel(createFixture({ league: { round: null } })),
    ).toBe('Premier League')
  })

  it('picks upcoming and recent fixtures from a season list', () => {
    const now = new Date('2024-08-15T00:00:00.000Z')
    const fixtures = [
      createFixture({
        id: 1,
        statusShort: 'FT',
        date: '2024-08-01T12:00:00+00:00',
        goals: { home: 1, away: 0 },
      }),
      createFixture({
        id: 2,
        statusShort: 'FT',
        date: '2024-08-10T12:00:00+00:00',
        goals: { home: 2, away: 2 },
      }),
      createFixture({
        id: 3,
        statusShort: 'NS',
        date: '2024-08-20T12:00:00+00:00',
      }),
      createFixture({
        id: 4,
        statusShort: 'NS',
        date: '2024-08-27T12:00:00+00:00',
      }),
    ]

    expect(pickUpcomingFixtures(fixtures, 1, now).map((f) => f.fixture.id)).toEqual([
      3,
    ])
    expect(pickRecentFixtures(fixtures, 1).map((f) => f.fixture.id)).toEqual([2])
  })
})
