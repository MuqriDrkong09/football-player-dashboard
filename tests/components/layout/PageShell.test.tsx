import { render, screen } from '@testing-library/react'
import { PageShell } from '@/components/layout/PageShell'
import { usePageMeta } from '@/hooks/use-page-meta'

jest.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: jest.fn(),
}))

const mockedUsePageMeta = usePageMeta as jest.MockedFunction<typeof usePageMeta>

describe('components/layout/PageShell', () => {
  beforeEach(() => {
    mockedUsePageMeta.mockClear()
  })

  it('sets page meta and renders the header with title, description, and actions', () => {
    const { container } = render(
      <PageShell
        title="Players"
        description="Browse the squad"
        noIndex
        className="shell-extra"
        contentClassName="content-extra"
        actions={<button type="button">Filter</button>}
      >
        <p>Page body</p>
      </PageShell>,
    )

    expect(mockedUsePageMeta).toHaveBeenCalledWith({
      title: 'Players',
      description: 'Browse the squad',
      noIndex: true,
    })
    expect(screen.getByRole('heading', { level: 1, name: 'Players' })).toBeInTheDocument()
    expect(screen.getByText('Browse the squad')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument()
    expect(screen.getByText('Page body')).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('shell-extra', 'space-y-6')
    expect(container.querySelector('.content-extra')).toHaveTextContent(
      'Page body',
    )
  })

  it('prefers heading over title when provided', () => {
    render(
      <PageShell title="Players" heading="All Players">
        <span>Body</span>
      </PageShell>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'All Players' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Players' }),
    ).not.toBeInTheDocument()
  })

  it('omits the description and actions when they are not provided', () => {
    render(
      <PageShell title="About">
        <span>Body</span>
      </PageShell>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('banner').querySelector('p')).toBeNull()
  })

  it('hides the header entirely when showHeader is false', () => {
    render(
      <PageShell title="Hidden" description="Should not show" showHeader={false}>
        <span>Only body</span>
      </PageShell>,
    )

    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByText('Should not show')).not.toBeInTheDocument()
    expect(screen.getByText('Only body')).toBeInTheDocument()
    expect(mockedUsePageMeta).toHaveBeenCalledWith({
      title: 'Hidden',
      description: 'Should not show',
      noIndex: undefined,
    })
  })
})
