import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FavoritePlayerCard } from '@/components/favorites/FavoritePlayerCard'
import { createFavoriteFromProfile } from '@/store/favorites'
import { createPlayerProfile } from '../../fixtures/players'

describe('components/favorites/FavoritePlayerCard', () => {
  it('renders player details and remove action', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()
    const player = createFavoriteFromProfile(
      createPlayerProfile({ player: { id: 12, name: 'Saved Star' } }),
    )

    render(
      <MemoryRouter>
        <FavoritePlayerCard player={player} onRemove={onRemove} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Saved Star')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /remove/i }))
    expect(onRemove).toHaveBeenCalledWith(12)
  })
})
