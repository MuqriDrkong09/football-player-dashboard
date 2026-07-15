import { act, renderHook } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('hooks/useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('uses a 300ms delay by default', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    expect(result.current).toBe('a')

    act(() => {
      jest.advanceTimersByTime(299)
    })
    expect(result.current).toBe('a')

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current).toBe('b')
  })

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'ab' })
    rerender({ value: 'abc' })
    expect(result.current).toBe('a')

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(result.current).toBe('abc')
  })

  it('resets the timer when delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 200 } },
    )

    rerender({ value: 'b', delay: 200 })
    act(() => {
      jest.advanceTimersByTime(100)
    })

    rerender({ value: 'b', delay: 400 })
    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(result.current).toBe('a')

    act(() => {
      jest.advanceTimersByTime(200)
    })
    expect(result.current).toBe('b')
  })

  it('clears the pending timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'b' })
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})
