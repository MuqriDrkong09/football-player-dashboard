import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StandingsToolbar } from '@/components/standings/StandingsToolbar'

describe('components/standings/StandingsToolbar', () => {
  beforeAll(() => {
    Element.prototype.hasPointerCapture ??= (() =>
      false) as typeof Element.prototype.hasPointerCapture
    Element.prototype.setPointerCapture ??= (() =>
      undefined) as typeof Element.prototype.setPointerCapture
    Element.prototype.releasePointerCapture ??= (() =>
      undefined) as typeof Element.prototype.releasePointerCapture
  })

  it('emits search and sort changes', async () => {
    const user = userEvent.setup()
    const onSearchChange = jest.fn()
    const onSortByChange = jest.fn()

    render(
      <StandingsToolbar
        search=""
        onSearchChange={onSearchChange}
        sortBy="position"
        onSortByChange={onSortByChange}
      />,
    )

    await user.type(screen.getByLabelText('Search team'), 'liv')
    expect(onSearchChange).toHaveBeenCalled()

    await user.click(screen.getByLabelText('Sort standings'))
    await user.click(await screen.findByRole('option', { name: 'Points' }))
    expect(onSortByChange).toHaveBeenCalledWith('points')
  })
})
