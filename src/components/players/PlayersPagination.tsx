import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

type PlayersPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function PlayersPagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PlayersPaginationProps) {
  if (totalPages <= 1) return null

  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return (
    <Pagination className={cn(className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(event) => {
              event.preventDefault()
              if (canGoPrevious) onPageChange(page - 1)
            }}
            className={cn(!canGoPrevious && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>

        <PaginationItem>
          <span className="px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(event) => {
              event.preventDefault()
              if (canGoNext) onPageChange(page + 1)
            }}
            className={cn(!canGoNext && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
