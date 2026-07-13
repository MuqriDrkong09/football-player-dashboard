import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RetryButton } from '@/components/feedback/RetryButton'
import { cn } from '@/lib/utils'

type QueryErrorProps = {
  title?: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}

export function QueryError({
  title = 'Something went wrong',
  message = 'Failed to load data. Please try again.',
  onRetry,
  isRetrying = false,
  className,
}: QueryErrorProps) {
  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertCircle className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{message}</span>
        {onRetry && (
          <RetryButton
            onRetry={onRetry}
            isRetrying={isRetrying}
            variant="destructive"
            className="shrink-0 border-destructive/30 bg-background text-destructive hover:bg-destructive/10"
          />
        )}
      </AlertDescription>
    </Alert>
  )
}
