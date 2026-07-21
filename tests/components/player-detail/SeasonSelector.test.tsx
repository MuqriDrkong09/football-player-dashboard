import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SeasonSelector } from '@/components/player-detail/SeasonSelector'

describe('components/player-detail/SeasonSelector', () => {
  beforeAll(() => {
    Element.prototype.hasPointerCapture ??= (() =>
      false) as typeof Element.prototype.hasPointerCapture
    Element.prototype.setPointerCapture ??= (() =>
      undefined) as typeof Element.prototype.setPointerCapture
    Element.prototype.releasePointerCapture ??= (() =>
      undefined) as typeof Element.prototype.releasePointerCapture
  })

  it('renders loading skeletons when isLoading is true', () => {
    const { container } = render(
      <SeasonSelector
        seasons={[2024, 2023]}
        value={2024}
        onChange={jest.fn()}
        isLoading
      />,
    )

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('returns null when there are no seasons', () => {
    const { container } = render(
      <SeasonSelector seasons={[]} value={null} onChange={jest.fn()} />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders with default label and id', () => {
    render(
      <SeasonSelector seasons={[2024, 2023]} value={2024} onChange={jest.fn()} />,
    )

    expect(screen.getByLabelText('Season')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveTextContent(
      '2024/25',
    )
  })

  it('renders with custom label and id', () => {
    render(
      <SeasonSelector
        id="baseline-season-select"
        label="Baseline season"
        seasons={[2024, 2023]}
        value={2023}
        onChange={jest.fn()}
      />,
    )

    expect(screen.getByText('Baseline season')).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Baseline season' }),
    ).toHaveAttribute('id', 'baseline-season-select')
    expect(
      screen.getByRole('combobox', { name: 'Baseline season' }),
    ).toHaveTextContent('2023/24')
  })

  it('shows the placeholder when value is null', () => {
    render(
      <SeasonSelector seasons={[2024, 2023]} value={null} onChange={jest.fn()} />,
    )

    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveTextContent(
      'Select season',
    )
  })

  it('lists seasons in descending order and excludes the disabled season', async () => {
    const user = userEvent.setup()

    render(
      <SeasonSelector
        seasons={[2022, 2024, 2023]}
        value={2024}
        onChange={jest.fn()}
        disabledSeason={2023}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Season' }))

    const listbox = await screen.findByRole('listbox')
    const options = within(listbox).getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      '2024/25',
      '2022/23',
    ])
    expect(
      within(listbox).queryByRole('option', { name: '2023/24' }),
    ).not.toBeInTheDocument()
  })

  it('calls onChange when a season is selected', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <SeasonSelector seasons={[2024, 2023]} value={2024} onChange={onChange} />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Season' }))
    await user.click(await screen.findByRole('option', { name: '2023/24' }))

    expect(onChange).toHaveBeenCalledWith(2023)
  })
})
