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
})
