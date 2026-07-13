import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

type PageTransitionProps = {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation()

  return (
    <div
      key={location.pathname}
      className={cn(
        'animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both',
        className,
      )}
    >
      {children}
    </div>
  )
}
