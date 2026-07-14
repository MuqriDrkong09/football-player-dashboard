import { render } from '@testing-library/react'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'

describe('components/feedback/LoadingSkeleton', () => {
  it('renders the default card-grid variant', () => {
    const { container } = render(<LoadingSkeleton />)

    expect(
      container.querySelectorAll(
        '.overflow-hidden.rounded-xl.border.border-border.bg-card.p-4',
      ),
    ).toHaveLength(6)
    expect(container.querySelector('.size-16')).toBeInTheDocument()
  })

  it('passes count, cardVariant, and className to CardGridSkeleton', () => {
    const { container } = render(
      <LoadingSkeleton
        variant="card-grid"
        count={2}
        cardVariant="team"
        className="grid-extra"
      />,
    )

    expect(
      container.querySelectorAll(
        '.overflow-hidden.rounded-xl.border.border-border.bg-card.p-4',
      ),
    ).toHaveLength(2)
    expect(container.firstElementChild).toHaveClass('grid-extra')
    expect(container.querySelector('.size-14')).toBeInTheDocument()
  })

  it('renders the table variant with the requested row count', () => {
    const { container } = render(
      <LoadingSkeleton variant="table" count={4} className="table-extra" />,
    )

    expect(container.firstElementChild).toHaveClass(
      'overflow-hidden',
      'rounded-xl',
      'table-extra',
    )
    expect(container.querySelector('table')).toBeInTheDocument()
    expect(container.querySelector('thead')).toBeInTheDocument()
    expect(container.querySelectorAll('tbody tr')).toHaveLength(4)
    expect(container.querySelector('.size-9.rounded-full')).toBeInTheDocument()
  })

  it('uses the default table row count when count is omitted', () => {
    const { container } = render(<LoadingSkeleton variant="table" />)

    expect(container.querySelectorAll('tbody tr')).toHaveLength(6)
  })

  it('renders the page variant layout', () => {
    const { container } = render(
      <LoadingSkeleton variant="page" className="page-extra" />,
    )

    expect(container.firstElementChild).toHaveClass('space-y-6', 'page-extra')
    expect(container.querySelector('.h-8.w-48')).toBeInTheDocument()
    expect(container.querySelector('.h-40')).toBeInTheDocument()
    expect(container.querySelector('.h-64')).toBeInTheDocument()
  })

  it('renders the list variant with the requested item count', () => {
    const { container } = render(
      <LoadingSkeleton variant="list" count={3} className="list-extra" />,
    )

    expect(container.firstElementChild).toHaveClass('space-y-3', 'list-extra')
    expect(container.querySelectorAll('.h-12.w-full.rounded-lg')).toHaveLength(
      3,
    )
  })

  it('uses the default list count when count is omitted', () => {
    const { container } = render(<LoadingSkeleton variant="list" />)

    expect(container.querySelectorAll('.h-12.w-full.rounded-lg')).toHaveLength(
      6,
    )
  })
})
