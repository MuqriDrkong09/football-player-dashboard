import type { ReactNode } from 'react'
import { usePageMeta } from '@/hooks/use-page-meta'
import { cn } from '@/lib/utils'
import type { PageMeta } from '@/config/seo'

type PageShellProps = PageMeta & {
  children: ReactNode
  heading?: string
  actions?: ReactNode
  className?: string
  contentClassName?: string
  showHeader?: boolean
}

export function PageShell({
  title,
  description,
  noIndex,
  children,
  heading,
  actions,
  className,
  contentClassName,
  showHeader = true,
}: PageShellProps) {
  usePageMeta({ title, description, noIndex })

  return (
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {showHeader && (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {heading ?? title}
            </h1>
            {description && (
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </header>
      )}

      <div className={cn(contentClassName)}>{children}</div>
    </div>
  )
}
