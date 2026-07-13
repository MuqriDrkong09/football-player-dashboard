import { CardGridSkeleton } from '@/components/cards'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type LoadingSkeletonVariant = 'card-grid' | 'table' | 'page' | 'list'

type LoadingSkeletonProps = {
  variant?: LoadingSkeletonVariant
  count?: number
  cardVariant?: 'player' | 'team'
  className?: string
}

export function LoadingSkeleton({
  variant = 'card-grid',
  count = 6,
  cardVariant = 'player',
  className,
}: LoadingSkeletonProps) {
  if (variant === 'card-grid') {
    return (
      <CardGridSkeleton
        count={count}
        variant={cardVariant}
        className={className}
      />
    )
  }

  if (variant === 'table') {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border bg-card',
          className,
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="ml-auto h-4 w-4" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead className="hidden md:table-cell text-right">
                <Skeleton className="ml-auto h-4 w-12" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: count }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-4" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden md:table-cell text-right">
                  <Skeleton className="ml-auto h-4 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (variant === 'page') {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}
