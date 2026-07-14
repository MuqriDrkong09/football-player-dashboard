import { cn } from '@/lib/utils'

describe('lib/utils', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('ignores falsy values', () => {
    expect(cn('block', false && 'hidden', undefined, null, 'text-sm')).toBe(
      'block text-sm',
    )
  })
})
