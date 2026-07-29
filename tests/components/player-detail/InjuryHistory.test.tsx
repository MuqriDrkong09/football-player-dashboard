import { render, screen } from '@testing-library/react'
import { InjuryHistory } from '@/components/player-detail/InjuryHistory'
import type { InjuryHistoryItem } from '@/utils/injury'

const records: InjuryHistoryItem[] = [
  {
    id: 'hamstring',
    injuryType: 'Hamstring Injury',
    bodyArea: 'Hamstring',
    startDate: '1 Aug 2023',
    endDateLabel: '15 Oct 2023',
    recoveryStatus: 'Recovered',
    recoveryLabel: 'Recovered',
    matchesMissed: 2,
  },
  {
    id: 'knee',
    injuryType: 'Knee Injury',
    bodyArea: 'Knee',
    startDate: '10 Jan 2024',
    endDateLabel: 'Expected return unknown',
    recoveryStatus: 'Ongoing',
    recoveryLabel: 'Currently sidelined',
    matchesMissed: null,
  },
  {
    id: 'ankle',
    injuryType: 'Suspended',
    bodyArea: null,
    startDate: '5 Mar 2024',
    endDateLabel: '1 Apr 2024',
    recoveryStatus: 'Expected return',
    recoveryLabel: 'Expected return 1 Apr 2024',
    matchesMissed: 1,
  },
  {
    id: 'illness',
    injuryType: 'Illness',
    bodyArea: null,
    startDate: 'Unknown',
    endDateLabel: 'Expected return unknown',
    recoveryStatus: 'Unknown',
    recoveryLabel: 'Return date unknown',
    matchesMissed: null,
  },
]

describe('components/player-detail/InjuryHistory', () => {
  it('shows loading and empty states', () => {
    const { rerender } = render(<InjuryHistory records={[]} isLoading />)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(<InjuryHistory records={[]} />)
    expect(screen.getByText('No injury history')).toBeInTheDocument()
  })

  it('renders injury cards with available details', () => {
    render(<InjuryHistory records={records} />)

    expect(screen.getByLabelText('Injury history')).toBeInTheDocument()
    expect(screen.getByText('Hamstring Injury')).toBeInTheDocument()
    expect(screen.getByText('Knee Injury')).toBeInTheDocument()
    expect(screen.getByText('Suspended')).toBeInTheDocument()
    expect(screen.getByText('Illness')).toBeInTheDocument()
    expect(screen.getByText('Body area: Hamstring')).toBeInTheDocument()
    expect(screen.getByText('Body area: Knee')).toBeInTheDocument()
    expect(screen.queryByText('Body area: Suspended')).not.toBeInTheDocument()
    expect(screen.queryByText('Body area: Illness')).not.toBeInTheDocument()
    expect(screen.getAllByText('Recovered')).toHaveLength(2)
    expect(screen.getByText('Ongoing')).toBeInTheDocument()
    expect(screen.getByText('Expected return')).toBeInTheDocument()
    expect(screen.getAllByText('Unknown')).toHaveLength(2)
    expect(screen.getAllByText('Matches missed')).toHaveLength(2)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Currently sidelined')).toBeInTheDocument()
    expect(screen.getByText('Expected return 1 Apr 2024')).toBeInTheDocument()
    expect(screen.getByText('Return date unknown')).toBeInTheDocument()
  })
})
