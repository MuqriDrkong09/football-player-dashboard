import { render, screen } from '@testing-library/react'
import { FadeIn } from '@/components/motion/FadeIn'

describe('components/motion/FadeIn', () => {
  it('renders children in a div with default animation classes', () => {
    const { container } = render(
      <FadeIn>
        <p>Fade in content</p>
      </FadeIn>,
    )

    const el = container.firstElementChild
    expect(el?.tagName).toBe('DIV')
    expect(el).toHaveClass(
      'animate-in',
      'fade-in',
      'slide-in-from-bottom-2',
      'duration-500',
      'fill-mode-both',
    )
    expect(el).not.toHaveAttribute('style')
    expect(screen.getByText('Fade in content')).toBeInTheDocument()
  })

  it('merges a custom className onto the wrapper', () => {
    const { container } = render(
      <FadeIn className="custom-fade mt-4">
        <span>Styled</span>
      </FadeIn>,
    )

    expect(container.firstElementChild).toHaveClass(
      'custom-fade',
      'mt-4',
      'animate-in',
      'fade-in',
    )
  })

  it('applies an animation delay when delayMs is greater than zero', () => {
    const { container } = render(
      <FadeIn delayMs={250}>
        <span>Delayed</span>
      </FadeIn>,
    )

    expect(container.firstElementChild).toHaveStyle({
      animationDelay: '250ms',
    })
  })

  it('does not apply a style when delayMs is zero', () => {
    const { container } = render(
      <FadeIn delayMs={0}>
        <span>Immediate</span>
      </FadeIn>,
    )

    expect(container.firstElementChild).not.toHaveAttribute('style')
  })

  it('renders as a section when requested', () => {
    const { container } = render(
      <FadeIn as="section">
        <p>Section content</p>
      </FadeIn>,
    )

    expect(container.firstElementChild?.tagName).toBe('SECTION')
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('renders as an article when requested', () => {
    const { container } = render(
      <FadeIn as="article">
        <p>Article content</p>
      </FadeIn>,
    )

    expect(container.firstElementChild?.tagName).toBe('ARTICLE')
    expect(screen.getByText('Article content')).toBeInTheDocument()
  })
})
