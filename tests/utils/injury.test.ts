import type { InjuryRecord, SidelinedRecord } from '@/types/api-football'
import {
  buildInjuryHistory,
  countMatchesMissed,
  extractBodyArea,
  formatInjuryDate,
  getInjuryRecoveryStatus,
} from '@/utils/injury'

const sidelinedRecords: SidelinedRecord[] = [
  {
    type: 'Hamstring Injury',
    start: '2023-08-01',
    end: '2023-10-15',
  },
  {
    type: 'Knee Injury',
    start: '2024-01-10',
    end: 'Unknown',
  },
]

const injuries: InjuryRecord[] = [
  {
    player: {
      id: 1,
      name: 'Test Player',
      photo: '',
      type: 'Missing Fixture',
      reason: 'Hamstring Injury',
    },
    team: { id: 40, name: 'Liverpool', logo: 'liv.png' },
    fixture: {
      id: 100,
      timezone: 'UTC',
      date: '2023-08-20T15:00:00+00:00',
      timestamp: 1,
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'pl.png',
      flag: null,
      season: 2023,
    },
  },
  {
    player: {
      id: 1,
      name: 'Test Player',
      photo: '',
      type: 'Missing Fixture',
      reason: 'Hamstring Injury',
    },
    team: { id: 40, name: 'Liverpool', logo: 'liv.png' },
    fixture: {
      id: 101,
      timezone: 'UTC',
      date: '2023-09-01T15:00:00+00:00',
      timestamp: 1,
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'pl.png',
      flag: null,
      season: 2023,
    },
  },
]

function createInjury(
  fixtureId: number,
  fixtureDate: string,
): InjuryRecord {
  return {
    player: {
      id: 1,
      name: 'Test Player',
      photo: '',
      type: 'Missing Fixture',
      reason: 'Hamstring Injury',
    },
    team: { id: 40, name: 'Liverpool', logo: 'liv.png' },
    fixture: {
      id: fixtureId,
      timezone: 'UTC',
      date: fixtureDate,
      timestamp: 1,
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'pl.png',
      flag: null,
      season: 2023,
    },
  }
}

describe('utils/injury', () => {
  it('formats injury dates and extracts body areas', () => {
    expect(formatInjuryDate('2023-08-01')).toMatch(/2023/)
    expect(formatInjuryDate(null)).toBe('Unknown')
    expect(formatInjuryDate('')).toBe('Unknown')
    expect(formatInjuryDate('   ')).toBe('Unknown')
    expect(formatInjuryDate('unknown')).toBe('Unknown')
    expect(formatInjuryDate('invalid')).toBe('Unknown')
    expect(extractBodyArea('Hamstring Injury')).toBe('Hamstring')
    expect(extractBodyArea('Calf Injury')).toBe('Calf')
    expect(extractBodyArea('Quadriceps Injury')).toBe('Quadriceps')
    expect(extractBodyArea('Suspended')).toBeNull()
    expect(extractBodyArea('')).toBeNull()
    expect(extractBodyArea('   ')).toBeNull()
  })

  it('derives recovery status labels', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-01T00:00:00Z'))
    const now = Date.now()

    expect(getInjuryRecoveryStatus('2023-08-01', '2023-10-15')).toEqual({
      status: 'Recovered',
      label: 'Recovered',
      endDateLabel: expect.stringMatching(/2023/),
    })
    expect(getInjuryRecoveryStatus('2024-01-10', 'Unknown')).toEqual({
      status: 'Ongoing',
      label: 'Currently sidelined',
      endDateLabel: 'Expected return unknown',
    })
    expect(getInjuryRecoveryStatus('2024-01-10', '2024-12-01')).toEqual({
      status: 'Expected return',
      label: expect.stringMatching(/Expected return/),
      endDateLabel: expect.stringMatching(/2024/),
    })
    expect(getInjuryRecoveryStatus('invalid', null)).toEqual({
      status: 'Unknown',
      label: 'Return date unknown',
      endDateLabel: 'Expected return unknown',
    })
    expect(getInjuryRecoveryStatus('2025-12-01', null, now)).toEqual({
      status: 'Unknown',
      label: 'Return date unknown',
      endDateLabel: 'Expected return unknown',
    })

    jest.useRealTimers()
  })

  it('counts missed matches within a sidelined period', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-01T00:00:00Z'))

    expect(countMatchesMissed(sidelinedRecords[0], injuries)).toBe(2)
    expect(countMatchesMissed(sidelinedRecords[1], injuries)).toBeNull()
    expect(
      countMatchesMissed(
        { type: 'Hamstring Injury', start: 'invalid', end: '2023-10-15' },
        injuries,
      ),
    ).toBeNull()
    expect(
      countMatchesMissed(sidelinedRecords[0], [
        createInjury(200, '2022-01-01T15:00:00+00:00'),
      ]),
    ).toBeNull()
    expect(
      countMatchesMissed(sidelinedRecords[0], [
        createInjury(201, 'invalid-fixture-date'),
      ]),
    ).toBeNull()
    expect(
      countMatchesMissed(
        { type: 'Knee Injury', start: '2024-01-10', end: 'Unknown' },
        [createInjury(300, '2024-02-01T15:00:00+00:00')],
      ),
    ).toBe(1)

    jest.useRealTimers()
  })

  it('builds sorted injury history records', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-01T00:00:00Z'))

    const records = buildInjuryHistory(sidelinedRecords, injuries)

    expect(records).toHaveLength(2)
    expect(records[0].injuryType).toBe('Knee Injury')
    expect(records[1].injuryType).toBe('Hamstring Injury')
    expect(records[1].bodyArea).toBe('Hamstring')
    expect(records[1].matchesMissed).toBe(2)
    expect(records[0].recoveryStatus).toBe('Ongoing')

    const unsortedRecords = buildInjuryHistory(
      [
        { type: 'Invalid A', start: 'invalid', end: 'Unknown' },
        { type: 'Invalid B', start: 'invalid', end: 'Unknown' },
        { type: 'Valid Injury', start: '2023-08-01', end: '2023-10-15' },
      ],
      [],
    )

    expect(unsortedRecords.map((record) => record.injuryType)).toEqual([
      'Valid Injury',
      'Invalid A',
      'Invalid B',
    ])
    expect(unsortedRecords[1].recoveryStatus).toBe('Unknown')
    expect(unsortedRecords[1].startDate).toBe('Unknown')
    expect(unsortedRecords[1].bodyArea).toBeNull()

    const sortedPair = buildInjuryHistory(
      [
        { type: 'Valid Second', start: '2023-08-01', end: '2023-10-15' },
        { type: 'Invalid First', start: 'invalid', end: 'Unknown' },
        { type: 'Invalid Third', start: 'bad', end: 'Unknown' },
      ],
      [],
    )

    expect(sortedPair.map((record) => record.injuryType)).toEqual([
      'Valid Second',
      'Invalid First',
      'Invalid Third',
    ])

    jest.useRealTimers()
  })
})
