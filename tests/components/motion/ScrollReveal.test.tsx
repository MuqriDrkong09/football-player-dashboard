import { render, screen } from '@testing-library/react'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { useInView } from '@/hooks/use-in-view'

jest.mock('@/hooks/use-in-view')

const mockUseInView = jest.mocked(useInView)

describe('components/motion/ScrollReveal', () => {
  beforeEach(() => {
    mockUseInView.mockReturnValue({
      ref: { current: null },
      isInView: true,
    })
  })

  it('renders children with visible animation classes when in view', () => {
    const { container } = render(
      <ScrollReveal>
        <p>Revealed content</p>
      </ScrollReveal>,
    )

    const el = container.firstElementChild
    expect(el?.tagName).toBe('DIV')
    expect(el).toHaveClass(
      'duration-700',
      'fill-mode-both',
      'animate-in',
      'fade-in',
      'slide-in-from-bottom-4',
    )
    expect(el).not.toHaveClass('translate-y-4', 'opacity-0')
    expect(el).not.toHaveAttribute('style')
    expect(screen.getByText('Revealed content')).toBeInTheDocument()
  })

  it('renders hidden classes when not in view', () => {
    mockUseInView.mockReturnValue({
      ref: { current: null },
      isInView: false,
    })

    const { container } = render(
      <ScrollReveal>
        <p>Hidden content</p>
      </ScrollReveal>,
    )

    const el = container.firstElementChild
    expect(el).toHaveClass('translate-y-4', 'opacity-0')
    expect(el).not.toHaveClass('animate-in', 'fade-in')
  })

  it('merges a custom className onto the wrapper', () => {
    const { container } = render(
      <ScrollReveal className="custom-reveal mt-2">
        <span>Styled</span>
      </ScrollReveal>,
    )

    expect(container.firstElementChild).toHaveClass(
      'custom-reveal',
      'mt-2',
      'animate-in',
    )
  })

  it('applies an animation delay when delayMs is greater than zero', () => {
    const { container } = render(
      <ScrollReveal delayMs={150}>
        <span>Delayed</span>
      </ScrollReveal>,
    )

    expect(container.firstElementChild).toHaveStyle({
      animationDelay: '150ms',
    })
  })

  it('does not apply a style when delayMs is zero', () => {
    const { container } = render(
      <ScrollReveal delayMs={0}>
        <span>Immediate</span>
      </ScrollReveal>,
    )

    expect(container.firstElementChild).not.toHaveAttribute('style')
  })

  it('passes the ref from useInView to the wrapper element', () => {
    const ref = { current: null }
    mockUseInView.mockReturnValue({
      ref,
      isInView: true,
    })

    render(
      <ScrollReveal>
        <span>Ref target</span>
      </ScrollReveal>,
    )

    expect(mockUseInView).toHaveBeenCalled()
  })
})
