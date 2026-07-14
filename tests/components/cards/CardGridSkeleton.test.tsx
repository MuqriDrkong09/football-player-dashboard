import { render, screen } from '@testing-library/react'
import { CardGridSkeleton } from '@/components/cards/CardGridSkeleton'

describe('components/cards/CardGridSkeleton', () => {
  it('renders the default player grid with 6 cards', () => {
    const { container } = render(<CardGridSkeleton />)

    const cards = container.querySelectorAll(
      '.overflow-hidden.rounded-xl.border.border-border.bg-card.p-4',
    )
    expect(cards).toHaveLength(6)

    const grid = container.firstElementChild
    expect(grid?.className).toContain('grid')
    expect(grid?.className).toContain('sm:grid-cols-2')
    expect(grid?.className).toContain('lg:grid-cols-3')
    expect(grid?.className).not.toContain('xl:grid-cols-4')
  })

  it('renders a custom number of skeleton cards', () => {
    const { container } = render(<CardGridSkeleton count={3} />)

    expect(
      container.querySelectorAll(
        '.overflow-hidden.rounded-xl.border.border-border.bg-card.p-4',
      ),
    ).toHaveLength(3)
  })

  it('applies player avatar sizing and the extra detail skeleton', () => {
    const { container } = render(<CardGridSkeleton count={1} variant="player" />)

    const avatar = container.querySelector('.size-16.rounded-full')
    expect(avatar).toBeInTheDocument()

    // title, subtitle, and player-only detail line
    expect(container.querySelectorAll('.flex-1.space-y-2 > *')).toHaveLength(3)
  })

  it('applies team grid and avatar styles without the extra detail line', () => {
    const { container } = render(<CardGridSkeleton count={1} variant="team" />)

    const grid = container.firstElementChild
    expect(grid?.className).toContain('md:grid-cols-3')
    expect(grid?.className).toContain('xl:grid-cols-4')

    const avatar = container.querySelector('.size-14.rounded-lg')
    expect(avatar).toBeInTheDocument()
    expect(container.querySelector('.size-16')).not.toBeInTheDocument()

    expect(container.querySelectorAll('.flex-1.space-y-2 > *')).toHaveLength(2)
  })

  it('merges a custom className onto the grid container', () => {
    const { container } = render(
      <CardGridSkeleton className="custom-skeleton-grid" />,
    )

    expect(container.firstElementChild).toHaveClass('custom-skeleton-grid')
  })

  it('renders accessible skeleton placeholders via the Skeleton primitive', () => {
    render(<CardGridSkeleton count={2} />)

    // shadcn Skeleton uses animate-pulse blocks; ensure they exist in the tree
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
