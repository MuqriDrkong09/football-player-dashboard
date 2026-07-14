import { lazy, useEffect, useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { RouteSuspense } from '@/components/feedback/RouteSuspense'

const ImmediateChild = lazy(() =>
  Promise.resolve({
    default: function LoadedChild() {
      return <p>Route content ready</p>
    },
  }),
)

function NeverResolvingChild() {
  // Suspend forever so the Suspense fallback stays visible.
  throw new Promise(() => {})
}

describe('components/feedback/RouteSuspense', () => {
  it('renders children once the suspended route resolves', async () => {
    render(
      <RouteSuspense>
        <ImmediateChild />
      </RouteSuspense>,
    )

    await waitFor(() => {
      expect(screen.getByText('Route content ready')).toBeInTheDocument()
    })
  })

  it('shows the default page LoadingSkeleton while suspending', () => {
    const { container } = render(
      <RouteSuspense>
        <NeverResolvingChild />
      </RouteSuspense>,
    )

    expect(container.querySelector('.space-y-6')).toBeInTheDocument()
    expect(container.querySelector('.h-8.w-48')).toBeInTheDocument()
    expect(container.querySelector('.h-40')).toBeInTheDocument()
    expect(screen.queryByText('Route content ready')).not.toBeInTheDocument()
  })

  it('uses a custom fallback when provided', () => {
    render(
      <RouteSuspense fallback={<p>Custom route fallback</p>}>
        <NeverResolvingChild />
      </RouteSuspense>,
    )

    expect(screen.getByText('Custom route fallback')).toBeInTheDocument()
    expect(document.querySelector('.space-y-6')).not.toBeInTheDocument()
  })

  it('renders non-lazy children immediately', () => {
    function SyncChild() {
      const [ready, setReady] = useState(false)

      useEffect(() => {
        setReady(true)
      }, [])

      return <p>{ready ? 'Synced child' : 'Mounting'}</p>
    }

    render(
      <RouteSuspense>
        <SyncChild />
      </RouteSuspense>,
    )

    expect(screen.getByText(/Mounting|Synced child/)).toBeInTheDocument()
  })
})
