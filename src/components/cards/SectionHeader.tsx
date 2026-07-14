import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  title: string
  titleId?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  titleId,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div>
        <h2
          id={titleId}
          className="text-xl font-bold tracking-tight sm:text-2xl"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
