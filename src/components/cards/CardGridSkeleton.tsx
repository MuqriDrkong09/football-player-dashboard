import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type CardGridSkeletonProps = {
  count?: number
  variant?: 'player' | 'team'
  className?: string
}

export function CardGridSkeleton({
  count = 6,
  variant = 'player',
  className,
}: CardGridSkeletonProps) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
        variant === 'team' && 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-4">
            <Skeleton
              className={cn(
                'shrink-0 rounded-full',
                variant === 'player' ? 'size-16' : 'size-14 rounded-lg',
              )}
            />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              {variant === 'player' && <Skeleton className="h-3 w-2/3" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
