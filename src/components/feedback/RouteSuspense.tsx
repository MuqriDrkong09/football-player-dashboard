import { Suspense, type ReactNode } from 'react'
import { LoadingSkeleton } from '@/components/feedback'

type RouteSuspenseProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function RouteSuspense({
  children,
  fallback = <LoadingSkeleton variant="page" />,
}: RouteSuspenseProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}
