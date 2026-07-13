import { AlertCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RetryButton } from '@/components/feedback/RetryButton'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'

type QueryErrorProps = {
  title?: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
  /** Show a toast when this error appears. Defaults to true. */
  notifyToast?: boolean
}

export function QueryError({
  title = 'Something went wrong',
  message = 'Failed to load data. Please try again.',
  onRetry,
  isRetrying = false,
  className,
  notifyToast = true,
}: QueryErrorProps) {
  const notifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!notifyToast) return

    const key = `${title}:${message}`
    if (notifiedRef.current === key) return

    notifiedRef.current = key
    notify.error(title, message)
  }, [message, notifyToast, title])

  return (
    <Alert variant="destructive" className={cn(className)} role="alert">
      <AlertCircle className="size-4" aria-hidden="true" />
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
