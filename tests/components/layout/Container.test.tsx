import { render, screen } from '@testing-library/react'
import { Container } from '@/components/layout/Container'

describe('components/layout/Container', () => {
  it('renders children in a default div with base layout classes', () => {
    const { container } = render(
      <Container>
        <p>Inside container</p>
      </Container>,
    )

    const el = container.firstElementChild
    expect(el?.tagName).toBe('DIV')
    expect(el).toHaveClass(
      'mx-auto',
      'w-full',
      'max-w-7xl',
      'px-4',
      'sm:px-6',
      'lg:px-8',
    )
    expect(screen.getByText('Inside container')).toBeInTheDocument()
  })

  it('renders as a main landmark when requested', () => {
    render(
      <Container as="main">
        <p>Main content</p>
      </Container>,
    )

    expect(screen.getByRole('main')).toHaveTextContent('Main content')
  })

  it('renders as a section when requested', () => {
    const { container } = render(
      <Container as="section">
        <p>Section content</p>
      </Container>,
    )

    expect(container.firstElementChild?.tagName).toBe('SECTION')
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('merges a custom className onto the container', () => {
    const { container } = render(
      <Container className="custom-container py-8">
        <span>Styled</span>
      </Container>,
    )

    expect(container.firstElementChild).toHaveClass(
      'custom-container',
      'py-8',
      'max-w-7xl',
    )
  })
})
