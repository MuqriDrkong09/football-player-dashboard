import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayersPagination } from '@/components/players/PlayersPagination'

describe('components/players/PlayersPagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <PlayersPagination page={1} totalPages={1} onPageChange={jest.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when totalPages is zero', () => {
    const { container } = render(
      <PlayersPagination page={1} totalPages={0} onPageChange={jest.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows the current page and navigates previous/next', async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()

    render(
      <PlayersPagination page={2} totalPages={4} onPageChange={onPageChange} />,
    )

    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'pagination' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /previous/i }))
    expect(onPageChange).toHaveBeenCalledWith(1)

    await user.click(screen.getByRole('link', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('does not change page when previous is unavailable on the first page', () => {
    const onPageChange = jest.fn()

    render(
      <PlayersPagination page={1} totalPages={3} onPageChange={onPageChange} />,
    )

    const previous = screen.getByRole('link', { name: /previous/i })
    expect(previous).toHaveClass('pointer-events-none', 'opacity-50')

    fireEvent.click(previous)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('does not change page when next is unavailable on the last page', () => {
    const onPageChange = jest.fn()

    render(
      <PlayersPagination page={3} totalPages={3} onPageChange={onPageChange} />,
    )

    const next = screen.getByRole('link', { name: /next/i })
    expect(next).toHaveClass('pointer-events-none', 'opacity-50')

    fireEvent.click(next)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('merges a custom className onto the pagination root', () => {
    render(
      <PlayersPagination
        page={1}
        totalPages={2}
        onPageChange={jest.fn()}
        className="custom-pagination"
      />,
    )

    expect(screen.getByRole('navigation', { name: 'pagination' })).toHaveClass(
      'custom-pagination',
    )
  })
})
