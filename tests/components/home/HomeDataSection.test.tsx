import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeDataSection } from '@/components/home/HomeDataSection'

jest.mock('@/lib/notify', () => ({
  notify: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

const baseProps = {
  titleId: 'home-section-title',
  title: 'Featured',
  description: 'Top picks this season',
  onRetry: jest.fn(),
  emptyTitle: 'Nothing here',
  emptyDescription: 'No items found',
  skeletonCount: 2,
  children: <div>Child item</div>,
}

describe('components/home/HomeDataSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the labelled section header and optional action', () => {
    render(
      <HomeDataSection
        {...baseProps}
        isLoading={false}
        isError={false}
        isEmpty={false}
        action={<button type="button">View all</button>}
      />,
    )

    const heading = screen.getByRole('heading', { name: 'Featured' })
    expect(heading).toHaveAttribute('id', 'home-section-title')
    expect(screen.getByText('Top picks this season')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Featured' })).toHaveAttribute(
      'aria-labelledby',
      'home-section-title',
    )
  })

  it('shows the loading skeleton with team cardVariant and grid class', () => {
    const { container } = render(
      <HomeDataSection
        {...baseProps}
        isLoading
        isError={false}
        isEmpty={false}
        cardVariant="team"
        gridClassName="custom-grid"
        skeletonCount={3}
      />,
    )

    expect(container.querySelector('.custom-grid')).toBeInTheDocument()
    expect(
      container.querySelectorAll(
        '.overflow-hidden.rounded-xl.border.border-border.bg-card.p-4',
      ),
    ).toHaveLength(3)
    expect(container.querySelector('.size-14')).toBeInTheDocument()
    expect(screen.queryByText('Child item')).not.toBeInTheDocument()
  })

  it('shows QueryError with a provided message and retry handler', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    render(
      <HomeDataSection
        {...baseProps}
        isLoading={false}
        isError
        isEmpty={false}
        errorMessage="Section failed"
        onRetry={onRetry}
        isRetrying
      />,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Section failed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeDisabled()

    // Re-render without retrying to click
    render(
      <HomeDataSection
        {...baseProps}
        isLoading={false}
        isError
        isEmpty={false}
        errorMessage="Section failed"
        onRetry={onRetry}
      />,
    )

    await user.click(screen.getAllByRole('button', { name: 'Try again' })[1])
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('falls back to the default error message when errorMessage is nullish', () => {
    const { rerender } = render(
      <HomeDataSection
        {...baseProps}
        isLoading={false}
        isError
        isEmpty={false}
        errorMessage={null}
      />,
    )

    expect(screen.getByText('Failed to load data.')).toBeInTheDocument()

    rerender(
      <HomeDataSection
        {...baseProps}
        isLoading={false}
        isError
        isEmpty={false}
      />,
    )

    expect(screen.getByText('Failed to load data.')).toBeInTheDocument()
  })

  it('renders children in the grid when data is available', () => {
    const { container } = render(
      <HomeDataSection
        {...baseProps}
        isLoading={false}
        isError={false}
        isEmpty={false}
        gridClassName="xl:grid-cols-4"
      />,
    )

    expect(screen.getByText('Child item')).toBeInTheDocument()
    expect(container.querySelector('.xl\\:grid-cols-4')).toBeInTheDocument()
    expect(container.querySelector('.sm\\:grid-cols-2')).toBeInTheDocument()
  })

  it('renders the empty state when there is no data', () => {
    render(
      <HomeDataSection
        {...baseProps}
        isLoading={false}
        isError={false}
        isEmpty
      />,
    )

    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.queryByText('Child item')).not.toBeInTheDocument()
  })
})
