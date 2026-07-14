import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { PageTransition } from '@/components/layout/PageTransition'

function PathLabel() {
  const location = useLocation()
  return <p data-testid="path-label">{location.pathname}</p>
}

function NavigateButton({ to }: { to: string }) {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(to)}>
      Go {to}
    </button>
  )
}

describe('components/layout/PageTransition', () => {
  it('renders children with the default animation classes', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/players']}>
        <PageTransition>
          <p>Players page</p>
        </PageTransition>
      </MemoryRouter>,
    )

    expect(screen.getByText('Players page')).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass(
      'animate-in',
      'fade-in',
      'slide-in-from-bottom-1',
      'duration-300',
      'fill-mode-both',
    )
  })

  it('merges a custom className onto the transition wrapper', () => {
    const { container } = render(
      <MemoryRouter>
        <PageTransition className="custom-transition">
          <span>Content</span>
        </PageTransition>
      </MemoryRouter>,
    )

    expect(container.firstElementChild).toHaveClass(
      'custom-transition',
      'animate-in',
    )
  })

  it('keys the wrapper to the current pathname so route changes remount it', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <MemoryRouter initialEntries={['/players']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <NavigateButton to="/about" />
                <PageTransition>
                  <PathLabel />
                </PageTransition>
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    const firstWrapper = container.querySelector('.animate-in')
    expect(screen.getByTestId('path-label')).toHaveTextContent('/players')

    await user.click(screen.getByRole('button', { name: 'Go /about' }))

    expect(screen.getByTestId('path-label')).toHaveTextContent('/about')
    const secondWrapper = container.querySelector('.animate-in')
    expect(secondWrapper).not.toBe(firstWrapper)
  })
})
