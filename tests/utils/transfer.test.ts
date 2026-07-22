import type { TransferRecord } from '@/types/api-football'
import {
  formatTransferDate,
  getTransferSeasonLabel,
  parseTransferDetails,
  sortTransfersByDate,
} from '@/utils/transfer'

const transfers: TransferRecord[] = [
  {
    date: '2019-07-15',
    type: 'Free',
    teams: {
      in: { id: 1, name: 'Liverpool', logo: 'liv.png' },
      out: { id: 2, name: 'Southampton', logo: '' },
    },
  },
  {
    date: '2023-01-10',
    type: 'Loan',
    teams: {
      in: { id: 3, name: 'Bayern Munich', logo: 'bayern.png' },
      out: { id: 1, name: 'Liverpool', logo: 'liv.png' },
    },
  },
  {
    date: '2022-06-01',
    type: '€85M',
    teams: {
      in: { id: 4, name: 'Real Madrid', logo: 'rm.png' },
      out: { id: 5, name: 'Monaco', logo: 'monaco.png' },
    },
  },
]

describe('utils/transfer', () => {
  it('formats transfer dates and seasons', () => {
    expect(formatTransferDate('2019-07-15')).toMatch(/2019/)
    expect(formatTransferDate(null)).toBe('Date unknown')
    expect(formatTransferDate('')).toBe('Date unknown')
    expect(formatTransferDate('invalid')).toBe('Date unknown')
    expect(getTransferSeasonLabel('2019-07-15')).toBe('2019/20')
    expect(getTransferSeasonLabel('2019-01-15')).toBe('2018/19')
    expect(getTransferSeasonLabel(null)).toBe('Unknown')
    expect(getTransferSeasonLabel('')).toBe('Unknown')
    expect(getTransferSeasonLabel('invalid')).toBe('Unknown')
  })

  it('parses transfer types and fees', () => {
    expect(parseTransferDetails('Free')).toEqual({
      transferType: 'Free Transfer',
      fee: null,
    })
    expect(parseTransferDetails('FREE')).toEqual({
      transferType: 'Free Transfer',
      fee: null,
    })
    expect(parseTransferDetails('Loan')).toEqual({
      transferType: 'Loan',
      fee: null,
    })
    expect(parseTransferDetails('loan')).toEqual({
      transferType: 'Loan',
      fee: null,
    })
    expect(parseTransferDetails('€85M')).toEqual({
      transferType: 'Permanent',
      fee: '€85M',
    })
    expect(parseTransferDetails('$50M')).toEqual({
      transferType: 'Permanent',
      fee: '$50M',
    })
    expect(parseTransferDetails('£30M')).toEqual({
      transferType: 'Permanent',
      fee: '£30M',
    })
    expect(parseTransferDetails('1000000')).toEqual({
      transferType: 'Permanent',
      fee: '1000000',
    })
    expect(parseTransferDetails('Permanent')).toEqual({
      transferType: 'Permanent',
      fee: null,
    })
    expect(parseTransferDetails('PERMANENT')).toEqual({
      transferType: 'Permanent',
      fee: null,
    })
    expect(parseTransferDetails('N/A')).toEqual({
      transferType: 'Unknown',
      fee: null,
    })
    expect(parseTransferDetails(' n/a ')).toEqual({
      transferType: 'Unknown',
      fee: null,
    })
    expect(parseTransferDetails('')).toEqual({
      transferType: 'Unknown',
      fee: null,
    })
    expect(parseTransferDetails('   ')).toEqual({
      transferType: 'Unknown',
      fee: null,
    })
    expect(parseTransferDetails(null)).toEqual({
      transferType: 'Unknown',
      fee: null,
    })
    expect(parseTransferDetails('End of contract')).toEqual({
      transferType: 'End of contract',
      fee: null,
    })
  })

  it('sorts transfers by date descending', () => {
    expect(sortTransfersByDate(transfers).map((item) => item.date)).toEqual([
      '2023-01-10',
      '2022-06-01',
      '2019-07-15',
    ])
  })

  it('places transfers with missing or invalid dates after dated transfers', () => {
    const mixedTransfers: TransferRecord[] = [
      {
        date: null,
        type: 'Free',
        teams: {
          in: { id: 1, name: 'Club A', logo: '' },
          out: { id: 2, name: 'Club B', logo: '' },
        },
      },
      {
        date: '2021-08-01',
        type: 'Loan',
        teams: {
          in: { id: 3, name: 'Club C', logo: '' },
          out: { id: 4, name: 'Club D', logo: '' },
        },
      },
      {
        date: 'invalid',
        type: 'Loan',
        teams: {
          in: { id: 5, name: 'Club E', logo: '' },
          out: { id: 6, name: 'Club F', logo: '' },
        },
      },
      {
        date: null,
        type: 'Free',
        teams: {
          in: { id: 7, name: 'Club G', logo: '' },
          out: { id: 8, name: 'Club H', logo: '' },
        },
      },
    ]

    expect(sortTransfersByDate(mixedTransfers).map((item) => item.date)).toEqual([
      '2021-08-01',
      null,
      'invalid',
      null,
    ])
  })
})
