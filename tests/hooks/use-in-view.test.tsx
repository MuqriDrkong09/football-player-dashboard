import { act, render, renderHook } from '@testing-library/react'
import { useInView } from '@/hooks/use-in-view'

type ObserverInstance = {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit
  observe: jest.Mock
  disconnect: jest.Mock
  unobserve: jest.Mock
}

let latestObserver: ObserverInstance | null = null

class ControllableIntersectionObserver {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit
  observe = jest.fn()
  disconnect = jest.fn()
  unobserve = jest.fn()

  constructor(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
  ) {
    this.callback = callback
    this.options = options
    latestObserver = this
  }
}

function triggerIntersection(
  isIntersecting: boolean,
  target: Element = document.createElement('div'),
) {
  if (!latestObserver) {
    throw new Error('No IntersectionObserver instance available')
  }

  act(() => {
    latestObserver!.callback(
      [{ isIntersecting, target } as IntersectionObserverEntry],
      latestObserver as unknown as IntersectionObserver,
    )
  })
}

function InViewTarget({
  options,
  onChange,
}: {
  options?: Parameters<typeof useInView>[0]
  onChange?: (state: ReturnType<typeof useInView>) => void
}) {
  const state = useInView(options)
  onChange?.(state)

  return (
    <div ref={state.ref} data-testid="target">
      {state.isInView ? 'visible' : 'hidden'}
    </div>
  )
}

describe('hooks/useInView', () => {
  const OriginalIntersectionObserver = window.IntersectionObserver

  beforeEach(() => {
    latestObserver = null
    window.IntersectionObserver =
      ControllableIntersectionObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    window.IntersectionObserver = OriginalIntersectionObserver
  })

  it('starts hidden and returns a ref', () => {
    const { result } = renderHook(() => useInView())

    expect(result.current.isInView).toBe(false)
    expect(result.current.ref).toEqual({ current: null })
  })

  it('does not observe when the ref is not attached to an element', () => {
    renderHook(() => useInView())

    expect(latestObserver).toBeNull()
  })

  it('observes the target with default options when the ref is attached', () => {
    render(<InViewTarget />)

    expect(latestObserver).not.toBeNull()
    expect(latestObserver?.options).toEqual({
      threshold: 0.12,
      rootMargin: '0px 0px -24px 0px',
    })
    expect(latestObserver?.observe).toHaveBeenCalledTimes(1)
    expect(latestObserver?.observe.mock.calls[0]?.[0]).toHaveAttribute(
      'data-testid',
      'target',
    )
  })

  it('sets isInView to true when the target intersects', () => {
    render(<InViewTarget />)

    triggerIntersection(true, latestObserver!.observe.mock.calls[0]![0] as Element)

    expect(document.querySelector('[data-testid="target"]')).toHaveTextContent(
      'visible',
    )
  })

  it('disconnects after intersecting when triggerOnce is true by default', () => {
    render(<InViewTarget />)

    triggerIntersection(true, latestObserver!.observe.mock.calls[0]![0] as Element)

    expect(latestObserver?.disconnect).toHaveBeenCalledTimes(1)
  })

  it('uses custom observer options when provided', () => {
    render(
      <InViewTarget
        options={{
          threshold: 0.5,
          rootMargin: '10px',
          triggerOnce: false,
        }}
      />,
    )

    expect(latestObserver?.options).toEqual({
      threshold: 0.5,
      rootMargin: '10px',
    })
  })

  it('sets isInView to false when leaving view and triggerOnce is false', () => {
    render(<InViewTarget options={{ triggerOnce: false }} />)

    const target = latestObserver!.observe.mock.calls[0]![0] as Element
    triggerIntersection(true, target)
    expect(document.querySelector('[data-testid="target"]')).toHaveTextContent(
      'visible',
    )

    triggerIntersection(false, target)
    expect(document.querySelector('[data-testid="target"]')).toHaveTextContent(
      'hidden',
    )
  })

  it('does not hide the target when leaving view and triggerOnce is true', () => {
    render(<InViewTarget options={{ triggerOnce: true }} />)

    const target = latestObserver!.observe.mock.calls[0]![0] as Element
    triggerIntersection(true, target)
    triggerIntersection(false, target)

    expect(document.querySelector('[data-testid="target"]')).toHaveTextContent(
      'visible',
    )
  })

  it('ignores callbacks without an intersection entry', () => {
    render(<InViewTarget />)

    act(() => {
      latestObserver!.callback(
        [] as IntersectionObserverEntry[],
        latestObserver as unknown as IntersectionObserver,
      )
    })

    expect(document.querySelector('[data-testid="target"]')).toHaveTextContent(
      'hidden',
    )
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<InViewTarget />)
    const disconnect = latestObserver!.disconnect

    unmount()

    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('creates a new observer when options change', () => {
    const { rerender } = render(
      <InViewTarget options={{ threshold: 0.1, triggerOnce: true }} />,
    )
    const firstObserver = latestObserver
    const firstDisconnect = firstObserver!.disconnect

    rerender(
      <InViewTarget options={{ threshold: 0.8, triggerOnce: true }} />,
    )

    expect(firstDisconnect).toHaveBeenCalledTimes(1)
    expect(latestObserver).not.toBe(firstObserver)
    expect(latestObserver?.options.threshold).toBe(0.8)
  })
})
