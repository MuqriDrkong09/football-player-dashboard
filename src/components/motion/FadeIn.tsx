import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type FadeInProps = {
  children: ReactNode
  className?: string
  delayMs?: number
  as?: 'div' | 'section' | 'article'
}

export function FadeIn({
  children,
  className,
  delayMs = 0,
  as: Component = 'div',
}: FadeInProps) {
  return (
    <Component
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both',
        className,
      )}
      style={delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Component>
  )
}
