import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'

describe('components/favorites/FavoriteButton', () => {
  it('uses player-specific labels based on favorite state', () => {
    const { rerender } = render(
      <FavoriteButton
        isFavorite={false}
        onClick={jest.fn()}
        playerName="Salah"
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Save Salah to favorites' }),
    ).toHaveAttribute('aria-pressed', 'false')

    rerender(
      <FavoriteButton isFavorite onClick={jest.fn()} playerName="Salah" />,
    )

    expect(
      screen.getByRole('button', { name: 'Remove Salah from favorites' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('uses generic labels when playerName is omitted', () => {
    const { rerender } = render(
      <FavoriteButton isFavorite={false} onClick={jest.fn()} />,
    )

    expect(
      screen.getByRole('button', { name: 'Save to favorites' }),
    ).toBeInTheDocument()

    rerender(<FavoriteButton isFavorite onClick={jest.fn()} />)

    expect(
      screen.getByRole('button', { name: 'Remove from favorites' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows text labels for non-icon sizes', () => {
    const { rerender } = render(
      <FavoriteButton isFavorite={false} onClick={jest.fn()} size="sm" />,
    )

    expect(screen.getByText('Save player')).toBeInTheDocument()

    rerender(<FavoriteButton isFavorite onClick={jest.fn()} size="default" />)

    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('hides text labels for the default icon size', () => {
    render(<FavoriteButton isFavorite={false} onClick={jest.fn()} />)

    expect(screen.queryByText('Save player')).not.toBeInTheDocument()
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('applies favorite styling and merges className', () => {
    const { rerender } = render(
      <FavoriteButton
        isFavorite={false}
        onClick={jest.fn()}
        className="extra-class"
      />,
    )

    expect(screen.getByRole('button')).toHaveClass('extra-class')
    expect(screen.getByRole('button')).not.toHaveClass('bg-primary')

    rerender(
      <FavoriteButton
        isFavorite
        onClick={jest.fn()}
        className="extra-class"
      />,
    )

    expect(screen.getByRole('button')).toHaveClass(
      'bg-primary',
      'text-primary-foreground',
      'extra-class',
    )
    expect(document.querySelector('.fill-current')).toBeInTheDocument()
  })

  it('prevents default and stops propagation before calling onClick', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const parentClick = jest.fn()

    render(
      <div onClick={parentClick}>
        <FavoriteButton isFavorite={false} onClick={onClick} size="sm" />
      </div>,
    )

    await user.click(screen.getByRole('button', { name: 'Save to favorites' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(parentClick).not.toHaveBeenCalled()
  })
})
