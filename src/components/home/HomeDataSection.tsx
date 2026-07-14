import type { ReactNode } from 'react'
import { SectionHeader } from '@/components/cards'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { cn } from '@/lib/utils'

type HomeDataSectionProps = {
  titleId: string
  title: string
  description: string
  action?: ReactNode
  isLoading: boolean
  isError: boolean
  errorMessage?: string | null
  onRetry: () => void
  isRetrying?: boolean
  isEmpty: boolean
  emptyTitle: string
  emptyDescription: string
  skeletonCount: number
  cardVariant?: 'player' | 'team'
  gridClassName?: string
  children: ReactNode
}

export function HomeDataSection({
  titleId,
  title,
  description,
  action,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  isRetrying = false,
  isEmpty,
  emptyTitle,
  emptyDescription,
  skeletonCount,
  cardVariant = 'player',
  gridClassName,
  children,
}: HomeDataSectionProps) {
  return (
    <section aria-labelledby={titleId}>
      <SectionHeader
        titleId={titleId}
        title={title}
        description={description}
        action={action}
      />

      {isLoading && (
        <LoadingSkeleton
          variant="card-grid"
          count={skeletonCount}
          cardVariant={cardVariant}
          className={gridClassName}
        />
      )}

      {isError && (
        <QueryError
          message={errorMessage ?? 'Failed to load data.'}
          onRetry={onRetry}
          isRetrying={isRetrying}
          notifyToast={false}
        />
      )}

      {!isLoading && !isError && !isEmpty && (
        <div
          className={cn(
            'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
            gridClassName,
          )}
        >
          {children}
        </div>
      )}

      {!isLoading && !isError && isEmpty && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  )
}
