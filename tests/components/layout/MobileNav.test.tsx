import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { MobileNav } from '@/components/layout/MobileNav'

jest.mock('@/components/layout/DarkModeToggle', () => ({
  DarkModeToggle: () => <button type="button">Theme toggle</button>,
}))

jest.mock('@/components/league-season', () => ({
  LeagueSeasonSwitcher: () => <div>League season switcher</div>,
}))

jest.mock('@/lib/notify', () => ({
  notify: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

function LocationChanger() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate('/players')}>
      Change route
    </button>
  )
}

function renderMobileNav(open: boolean, onClose = jest.fn()) {
  const utils = render(
    <MemoryRouter initialEntries={['/']}>
      <LocationChanger />
      <Routes>
        <Route
          path="*"
          element={<MobileNav open={open} onClose={onClose} />}
        />
      </Routes>
    </MemoryRouter>,
  )

  return { ...utils, onClose }
}

describe('components/layout/MobileNav', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('renders a closed panel with inert attributes and no body scroll lock', () => {
    renderMobileNav(false)

    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toHaveAttribute('aria-hidden', 'true')
    expect(dialog.className).toContain('-translate-x-full')
    expect(document.body.style.overflow).toBe('')
  })

  it('opens the panel, locks body scroll, and focuses the close button', () => {
    renderMobileNav(true)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-hidden', 'false')
    expect(dialog.className).toContain('translate-x-0')
    expect(document.body.style.overflow).toBe('hidden')
    expect(
      screen.getByRole('button', { name: 'Close navigation menu' }),
    ).toHaveFocus()
    expect(
      screen.getByRole('navigation', { name: 'Mobile navigation' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
  })

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const { container, onClose } = renderMobileNav(true)

    const backdrop = container.querySelector('[aria-hidden="true"].fixed.inset-0')
    expect(backdrop).toBeTruthy()
    await user.click(backdrop!)

    expect(onClose).toHaveBeenCalled()
  })

  it('closes when the close button is clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = renderMobileNav(true)

    await user.click(
      screen.getByRole('button', { name: 'Close navigation menu' }),
    )

    expect(onClose).toHaveBeenCalled()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const { onClose } = renderMobileNav(true)

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
  })

  it('closes when the route changes', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    renderMobileNav(true, onClose)
    onClose.mockClear()

    await user.click(screen.getByRole('button', { name: 'Change route' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('traps focus within the panel with Tab and Shift+Tab', () => {
    renderMobileNav(true)

    const first = screen.getByRole('link', {
      name: /Football Dashboard home/i,
    })
    const last = screen.getByRole('button', { name: 'Theme toggle' })
    const closeButton = screen.getByRole('button', {
      name: 'Close navigation menu',
    })

    last.focus()
    fireEvent.keyDown(document, { key: 'Tab', bubbles: true, cancelable: true })
    expect(first).toHaveFocus()

    first.focus()
    fireEvent.keyDown(document, {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    })
    expect(last).toHaveFocus()

    // Mid-panel Tab should not force a wrap.
    closeButton.focus()
    fireEvent.keyDown(document, { key: 'Tab', bubbles: true, cancelable: true })
    expect(closeButton).toHaveFocus()
  })

  it('ignores Tab trapping when the panel has no focusable elements', async () => {
    const user = userEvent.setup()
    renderMobileNav(true)

    const dialog = screen.getByRole('dialog')
    const querySpy = jest
      .spyOn(dialog, 'querySelectorAll')
      .mockReturnValue([] as unknown as NodeListOf<HTMLElement>)

    await user.keyboard('{Tab}')

    expect(querySpy).toHaveBeenCalled()
    querySpy.mockRestore()
  })

  it('ignores non-Tab key presses in the focus trap handler', () => {
    renderMobileNav(true)

    fireEvent.keyDown(document, {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    })

    expect(
      screen.getByRole('button', { name: 'Close navigation menu' }),
    ).toHaveFocus()
  })

  it('restores body overflow and previous focus on unmount', () => {
    const prior = document.createElement('button')
    prior.textContent = 'Prior focus'
    document.body.appendChild(prior)
    prior.focus()

    const { unmount } = renderMobileNav(true)
    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('')
    expect(prior).toHaveFocus()
    prior.remove()
  })

  it('clears the body scroll lock when transitioning from open to closed', () => {
    const onClose = jest.fn()
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav open onClose={onClose} />
      </MemoryRouter>,
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav open={false} onClose={onClose} />
      </MemoryRouter>,
    )

    expect(document.body.style.overflow).toBe('')
  })
})
