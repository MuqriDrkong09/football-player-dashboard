import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InjuryTimeline } from '@/components/player-detail/InjuryTimeline'
import type { InjuryTimelineItem } from '@/utils/injury'

jest.mock('@/lib/notify', () => ({
  notify: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

jest.mock('framer-motion', () => ({
  motion: {
    li: ({
      children,
      initial: _initial,
      whileInView: _whileInView,
      viewport: _viewport,
      transition: _transition,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <li {...props}>{children}</li>
    ),
    article: ({
      children,
      whileHover: _whileHover,
      transition: _transition,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <article {...props}>{children}</article>
    ),
  },
}))

const items: InjuryTimelineItem[] = [
  {
    id: 'hamstring',
    injuryType: 'Hamstring Injury',
    bodyArea: 'Hamstring',
    startDate: '1 Aug 2023',
    returnDateLabel: '15 Oct 2023',
    recoveryDuration: '2 mo',
    club: { id: 40, name: 'Liverpool', logo: 'liv.png' },
    recoveryStatus: 'Recovered',
    highlights: ['long-term'],
  },
  {
    id: 'knee',
    injuryType: 'Knee Injury',
    bodyArea: 'Knee',
    startDate: '10 Jan 2024',
    returnDateLabel: 'Expected return unknown',
    recoveryDuration: '4 mo',
    club: null,
    recoveryStatus: 'Ongoing',
    highlights: ['current', 'long-term'],
  },
  {
    id: 'illness',
    injuryType: 'Illness',
    bodyArea: null,
    startDate: '5 Mar 2024',
    returnDateLabel: '10 Mar 2024',
    recoveryDuration: '5 days',
    club: { id: 40, name: 'Liverpool', logo: '' },
    recoveryStatus: 'Recovered',
    highlights: [],
  },
  {
    id: 'concussion',
    injuryType: 'Concussion',
    bodyArea: 'Head',
    startDate: '12 Apr 2024',
    returnDateLabel: '20 Apr 2024',
    recoveryDuration: null,
    club: { id: 12, name: 'Arsenal', logo: 'ars.png' },
    recoveryStatus: 'Recovered',
    highlights: ['long-term'],
  },
  {
    id: 'foot',
    injuryType: 'Foot Injury',
    bodyArea: 'Foot',
    startDate: '1 May 2024',
    returnDateLabel: '8 May 2024',
    recoveryDuration: '7 days',
    club: { id: 13, name: 'Chelsea', logo: 'che.png' },
    recoveryStatus: 'Recovered',
    highlights: [],
  },
]

describe('components/player-detail/InjuryTimeline', () => {
  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(<InjuryTimeline items={[]} isLoading />)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(
      <InjuryTimeline
        items={[]}
        isError
        errorMessage="Timeline failed"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/timeline failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()

    rerender(<InjuryTimeline items={[]} isError />)
    expect(screen.getByText('Failed to load injury timeline.')).toBeInTheDocument()

    rerender(<InjuryTimeline items={[]} />)
    expect(screen.getByText('No injury timeline')).toBeInTheDocument()
  })

  it('renders injury timeline items with highlights and club details', () => {
    render(<InjuryTimeline items={items} />)

    const timeline = screen.getByRole('list', { name: 'Injury timeline' })
    expect(timeline.querySelectorAll('li')).toHaveLength(5)
    expect(screen.getByText('Hamstring Injury')).toBeInTheDocument()
    expect(screen.getByText('Knee Injury')).toBeInTheDocument()
    expect(screen.getByText('Illness')).toBeInTheDocument()
    expect(screen.getByText('Concussion')).toBeInTheDocument()
    expect(screen.getByText('Foot Injury')).toBeInTheDocument()
    expect(screen.getByText('Body area: Hamstring')).toBeInTheDocument()
    expect(screen.getByText('Body area: Knee')).toBeInTheDocument()
    expect(screen.getByText('Body area: Head')).toBeInTheDocument()
    expect(screen.getByText('Body area: Foot')).toBeInTheDocument()
    expect(screen.queryByText('Body area: Illness')).not.toBeInTheDocument()
    expect(screen.getAllByText('Current injury')).toHaveLength(1)
    expect(screen.getAllByText('Long-term injury')).toHaveLength(3)
    expect(screen.getByText('2 mo')).toBeInTheDocument()
    expect(screen.getByText('4 mo')).toBeInTheDocument()
    expect(screen.getByText('5 days')).toBeInTheDocument()
    expect(screen.getByText('7 days')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getAllByText('Liverpool')).toHaveLength(2)
    expect(screen.getByText('Arsenal')).toBeInTheDocument()
    expect(screen.getByText('Chelsea')).toBeInTheDocument()
    expect(screen.getByAltText('Liverpool logo')).toBeInTheDocument()
    expect(screen.getByAltText('Arsenal logo')).toBeInTheDocument()
    expect(screen.getByAltText('Chelsea logo')).toBeInTheDocument()
    expect(screen.getByText('Club at injury: Unknown')).toBeInTheDocument()
    expect(screen.getByText('LI')).toBeInTheDocument()
  })

  it('renders connector lines and default styling for middle non-highlighted items', () => {
    const { container } = render(
      <InjuryTimeline
        items={[
          items[0],
          {
            id: 'illness-middle',
            injuryType: 'Illness',
            bodyArea: null,
            startDate: '5 Mar 2024',
            returnDateLabel: '10 Mar 2024',
            recoveryDuration: '5 days',
            club: { id: 40, name: 'Liverpool', logo: 'liv.png' },
            recoveryStatus: 'Recovered',
            highlights: [],
          },
          items[4],
        ]}
      />,
    )

    expect(container.querySelector('.mt-1.w-px.flex-1.bg-border')).toBeInTheDocument()
    expect(container.querySelector('.text-primary-foreground')).toBeInTheDocument()
    expect(container.querySelectorAll('.border-primary').length).toBeGreaterThan(0)
  })

  it('renders a single timeline item without a connector line', () => {
    const { container } = render(<InjuryTimeline items={[items[0]]} />)

    expect(screen.getByRole('list', { name: 'Injury timeline' }).querySelectorAll('li')).toHaveLength(1)
    expect(container.querySelector('.mt-1.w-px.flex-1.bg-border')).not.toBeInTheDocument()
  })

  it('passes retrying state to the error view', () => {
    render(
      <InjuryTimeline
        items={[]}
        isError
        errorMessage="Timeline failed"
        onRetry={jest.fn()}
        isRetrying
      />,
    )

    expect(screen.getByRole('button', { name: /try again/i })).toBeDisabled()
  })
})
