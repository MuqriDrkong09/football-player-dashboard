import { Loader2, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RetryButtonProps = {
  onRetry: () => void
  isRetrying?: boolean
  label?: string
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
}

export function RetryButton({
  onRetry,
  isRetrying = false,
  label = 'Try again',
  className,
  size = 'sm',
  variant = 'outline',
}: RetryButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onRetry}
      disabled={isRetrying}
      className={cn('gap-2', className)}
    >
      {isRetrying ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <RotateCw className="size-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  )
}
