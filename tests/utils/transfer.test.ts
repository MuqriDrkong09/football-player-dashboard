import type { TransferRecord } from '@/types/api-football'
import {
  formatTransferDate,
  getMaxTransferFeeValue,
  getTransferHighlight,
  getTransferSeasonLabel,
  parseFeeValue,
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

  it('sorts transfers by date ascending', () => {
    expect(sortTransfersByDate(transfers, 'asc').map((item) => item.date)).toEqual([
      '2019-07-15',
      '2022-06-01',
      '2023-01-10',
    ])
  })

  it('parses fee values and transfer highlights', () => {
    expect(parseFeeValue('€85M')).toBe(85_000_000)
    expect(parseFeeValue('$50M')).toBe(50_000_000)
    expect(parseFeeValue('£30K')).toBe(30_000)
    expect(parseFeeValue('1,500,000')).toBe(1_500_000)
    expect(parseFeeValue('invalid')).toBe(0)
    expect(parseFeeValue('')).toBe(0)

    expect(getMaxTransferFeeValue(transfers)).toBe(85_000_000)
    expect(getMaxTransferFeeValue([])).toBe(0)
    expect(getMaxTransferFeeValue([transfers[0], transfers[1]])).toBe(0)
    expect(getTransferHighlight(transfers[0], transfers)).toBe('free')
    expect(getTransferHighlight(transfers[1], transfers)).toBe('loan')
    expect(getTransferHighlight(transfers[2], transfers)).toBe('record')
    expect(
      getTransferHighlight(
        {
          date: '2020-01-01',
          type: '€10M',
          teams: {
            in: { id: 1, name: 'A', logo: '' },
            out: { id: 2, name: 'B', logo: '' },
          },
        },
        transfers,
      ),
    ).toBeNull()
    expect(
      getTransferHighlight(
        {
          date: '2020-01-01',
          type: '€0',
          teams: {
            in: { id: 1, name: 'A', logo: '' },
            out: { id: 2, name: 'B', logo: '' },
          },
        },
        [
          {
            date: '2020-01-01',
            type: '€0',
            teams: {
              in: { id: 1, name: 'A', logo: '' },
              out: { id: 2, name: 'B', logo: '' },
            },
          },
        ],
      ),
    ).toBeNull()
    expect(
      getTransferHighlight(
        {
          date: '2020-01-01',
          type: 'Permanent',
          teams: {
            in: { id: 1, name: 'A', logo: '' },
            out: { id: 2, name: 'B', logo: '' },
          },
        },
        transfers,
      ),
    ).toBeNull()
    expect(parseFeeValue('not-a-number')).toBe(0)
  })

  it('returns 0 when parsed fee digits are not a valid number', () => {
    const isNaNSpy = jest.spyOn(Number, 'isNaN').mockReturnValueOnce(true)

    expect(parseFeeValue('€5M')).toBe(0)
    expect(isNaNSpy).toHaveBeenCalled()

    isNaNSpy.mockRestore()
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
