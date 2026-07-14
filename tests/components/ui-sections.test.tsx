import { render, screen } from '@testing-library/react'
import { SectionHeader } from '@/components/cards/SectionHeader'
import { SkipLink } from '@/components/layout/SkipLink'
import { HomeDataSection } from '@/components/home/HomeDataSection'

jest.mock('@/lib/notify', () => ({
  notify: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

describe('components/cards/SectionHeader', () => {
  it('renders title, description, action, and title id', () => {
    render(
      <SectionHeader
        titleId="featured-title"
        title="Featured"
        description="Top picks"
        action={<button type="button">View all</button>}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Featured' })).toHaveAttribute(
      'id',
      'featured-title',
    )
    expect(screen.getByText('Top picks')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View all' })).toBeInTheDocument()
  })
})

describe('components/layout/SkipLink', () => {
  it('links to the main content landmark', () => {
    render(<SkipLink />)
    expect(
      screen.getByRole('link', { name: 'Skip to main content' }),
    ).toHaveAttribute('href', '#main-content')
  })
})

describe('components/home/HomeDataSection', () => {
  it('renders loading, error, empty, and content states', () => {
    const { rerender } = render(
      <HomeDataSection
        titleId="home-section"
        title="Section"
        description="Desc"
        isLoading
        isError={false}
        onRetry={jest.fn()}
        isEmpty={false}
        emptyTitle="Empty"
        emptyDescription="None"
        skeletonCount={2}
      >
        <div>Item</div>
      </HomeDataSection>,
    )

    expect(screen.getByRole('heading', { name: 'Section' })).toBeInTheDocument()

    rerender(
      <HomeDataSection
        titleId="home-section"
        title="Section"
        description="Desc"
        isLoading={false}
        isError
        errorMessage="Failed section"
        onRetry={jest.fn()}
        isEmpty={false}
        emptyTitle="Empty"
        emptyDescription="None"
        skeletonCount={2}
      >
        <div>Item</div>
      </HomeDataSection>,
    )

    expect(screen.getByText('Failed section')).toBeInTheDocument()

    rerender(
      <HomeDataSection
        titleId="home-section"
        title="Section"
        description="Desc"
        isLoading={false}
        isError={false}
        onRetry={jest.fn()}
        isEmpty
        emptyTitle="Nothing here"
        emptyDescription="None found"
        skeletonCount={2}
      >
        <div>Item</div>
      </HomeDataSection>,
    )

    expect(screen.getByText('Nothing here')).toBeInTheDocument()

    rerender(
      <HomeDataSection
        titleId="home-section"
        title="Section"
        description="Desc"
        isLoading={false}
        isError={false}
        onRetry={jest.fn()}
        isEmpty={false}
        emptyTitle="Empty"
        emptyDescription="None"
        skeletonCount={2}
      >
        <div>Item</div>
      </HomeDataSection>,
    )

    expect(screen.getByText('Item')).toBeInTheDocument()
  })
})
