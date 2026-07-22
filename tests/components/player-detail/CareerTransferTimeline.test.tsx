import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CareerTransferTimeline } from '@/components/player-detail/CareerTransferTimeline'
import type { TransferRecord } from '@/types/api-football'

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
    date: '2022-06-01',
    type: '€85M',
    teams: {
      in: { id: 4, name: 'Real Madrid', logo: 'rm.png' },
      out: { id: 5, name: 'Monaco', logo: 'monaco.png' },
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
]

describe('components/player-detail/CareerTransferTimeline', () => {
  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(
      <CareerTransferTimeline transfers={[]} isLoading />,
    )
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(
      <CareerTransferTimeline
        transfers={[]}
        isError
        errorMessage="Timeline failed"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/timeline failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()

    rerender(<CareerTransferTimeline transfers={[]} isError />)
    expect(
      screen.getByText('Failed to load career transfer timeline.'),
    ).toBeInTheDocument()

    rerender(<CareerTransferTimeline transfers={[]} />)
    expect(screen.getByText('No transfer timeline')).toBeInTheDocument()
  })

  it('renders transfers chronologically with highlights and fees', () => {
    render(<CareerTransferTimeline transfers={transfers} />)

    const timeline = screen.getByRole('list', { name: 'Career transfer timeline' })
    const items = timeline.querySelectorAll('li')

    expect(items).toHaveLength(3)
    expect(screen.getByText('Season 2019/20')).toBeInTheDocument()
    expect(screen.getByText('Season 2021/22')).toBeInTheDocument()
    expect(screen.getByText('Season 2022/23')).toBeInTheDocument()
    expect(screen.getByText('Free transfer')).toBeInTheDocument()
    expect(screen.getByText('Record transfer')).toBeInTheDocument()
    expect(screen.getByText('Loan move')).toBeInTheDocument()
    expect(screen.getByText('Southampton')).toBeInTheDocument()
    expect(screen.getByText('SO')).toBeInTheDocument()
    expect(screen.getByText('Real Madrid')).toBeInTheDocument()
    expect(screen.getByText('Bayern Munich')).toBeInTheDocument()
    expect(screen.getByText('Transfer fee:')).toBeInTheDocument()
    expect(screen.getByText('€85M')).toBeInTheDocument()
    expect(screen.getAllByText('Liverpool')).toHaveLength(2)
    expect(screen.getByAltText('Real Madrid logo')).toBeInTheDocument()
    expect(screen.getByAltText('Bayern Munich logo')).toBeInTheDocument()
  })

  it('renders non-highlighted paid transfers without a fee section when fee is absent', () => {
    const paidTransfer: TransferRecord[] = [
      {
        date: '2020-01-01',
        type: 'Permanent',
        teams: {
          in: { id: 10, name: 'Arsenal', logo: 'ars.png' },
          out: { id: 11, name: 'Chelsea', logo: 'che.png' },
        },
      },
    ]

    render(<CareerTransferTimeline transfers={paidTransfer} />)

    expect(screen.queryByText('Record transfer')).not.toBeInTheDocument()
    expect(screen.queryByText('Free transfer')).not.toBeInTheDocument()
    expect(screen.queryByText('Loan move')).not.toBeInTheDocument()
    expect(screen.queryByText('Transfer fee:')).not.toBeInTheDocument()
    expect(screen.getByAltText('Arsenal logo')).toBeInTheDocument()
    expect(screen.getByAltText('Chelsea logo')).toBeInTheDocument()
  })

  it('renders a single non-highlighted transfer as the last timeline item', () => {
    const singleTransfer: TransferRecord[] = [
      {
        date: '2020-01-01',
        type: 'Permanent',
        teams: {
          in: { id: 10, name: 'Arsenal', logo: 'ars.png' },
          out: { id: 11, name: 'Chelsea', logo: 'che.png' },
        },
      },
    ]

    const { container } = render(
      <CareerTransferTimeline transfers={singleTransfer} />,
    )

    const timeline = screen.getByRole('list', { name: 'Career transfer timeline' })
    expect(timeline.querySelectorAll('li')).toHaveLength(1)

    const connector = container.querySelector('.mt-1.w-px.flex-1.bg-border')
    expect(connector).not.toBeInTheDocument()
    expect(container.querySelector('.bg-primary-foreground')).toBeInTheDocument()
  })

  it('renders connector lines for non-last items and default dots for middle transfers', () => {
    const mixedTransfers: TransferRecord[] = [
      {
        date: '2020-01-01',
        type: 'Permanent',
        teams: {
          in: { id: 10, name: 'Arsenal', logo: 'ars.png' },
          out: { id: 11, name: 'Chelsea', logo: 'che.png' },
        },
      },
      {
        date: '2021-01-01',
        type: 'Free',
        teams: {
          in: { id: 12, name: 'Barcelona', logo: 'bar.png' },
          out: { id: 10, name: 'Arsenal', logo: 'ars.png' },
        },
      },
    ]

    const { container } = render(
      <CareerTransferTimeline transfers={mixedTransfers} />,
    )

    const timeline = screen.getByRole('list', { name: 'Career transfer timeline' })
    expect(timeline.querySelectorAll('li')).toHaveLength(2)
    expect(container.querySelector('.mt-1.w-px.flex-1.bg-border')).toBeInTheDocument()
    expect(container.querySelectorAll('.bg-primary')).toHaveLength(1)
    expect(container.querySelector('.bg-primary-foreground')).not.toBeInTheDocument()
    expect(screen.getByText('Free transfer')).toBeInTheDocument()
  })

  it('renders unknown date labels for transfers without a date', () => {
    const unknownDateTransfer: TransferRecord[] = [
      {
        date: null,
        type: 'Free',
        teams: {
          in: { id: 10, name: 'Arsenal', logo: 'ars.png' },
          out: { id: 11, name: 'Chelsea', logo: '' },
        },
      },
    ]

    render(<CareerTransferTimeline transfers={unknownDateTransfer} />)

    expect(screen.getByText('Date unknown')).toBeInTheDocument()
    expect(screen.getByText('Season Unknown')).toBeInTheDocument()
    expect(screen.getByText('CH')).toBeInTheDocument()
  })

  it('passes retrying state to the error view', () => {
    render(
      <CareerTransferTimeline
        transfers={[]}
        isError
        errorMessage="Timeline failed"
        onRetry={jest.fn()}
        isRetrying
      />,
    )

    expect(screen.getByRole('button', { name: /try again/i })).toBeDisabled()
  })
})
