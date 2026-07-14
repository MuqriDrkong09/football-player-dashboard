jest.mock('@/components/ui/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    message: jest.fn(),
    warning: jest.fn(),
  },
}))

import { toast } from '@/components/ui/toast'
import { notify } from '@/lib/notify'

describe('lib/notify', () => {
  it('delegates success notifications', () => {
    notify.success('Saved', 'Player added')
    expect(toast.success).toHaveBeenCalledWith('Saved', {
      description: 'Player added',
    })
  })

  it('delegates error notifications', () => {
    notify.error('Failed', 'Try again')
    expect(toast.error).toHaveBeenCalledWith('Failed', {
      description: 'Try again',
    })
  })

  it('delegates info and warning notifications', () => {
    notify.info('Note')
    notify.warning('Careful', 'Check filters')

    expect(toast.message).toHaveBeenCalledWith('Note', {
      description: undefined,
    })
    expect(toast.warning).toHaveBeenCalledWith('Careful', {
      description: 'Check filters',
    })
  })
})
