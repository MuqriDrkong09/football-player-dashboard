import { Link } from 'react-router-dom'
import { APP_NAME } from '@/config/navigation'
import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        'group flex items-center gap-2.5 rounded-md outline-none ring-ring transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2',
        className,
      )}
      aria-label={`${APP_NAME} home`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 2c2.5 2.8 4 6.2 4 10s-1.5 7.2-4 10M12 2C9.5 4.8 8 8.2 8 12s1.5 7.2 4 10M2 12h20M4.5 7h15M4.5 17h15"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showText && (
        <span className="hidden font-bold tracking-tight sm:inline">
          <span className="text-foreground">{APP_NAME.split(' ')[0]}</span>{' '}
          <span className="text-primary">{APP_NAME.split(' ')[1]}</span>
        </span>
      )}
    </Link>
  )
}
