import { APP_NAME } from '@/config/navigation'
import { Container } from '@/components/layout/Container'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <Container className="flex flex-col items-center justify-between gap-3 py-6 sm:flex-row sm:py-8">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          &copy; {year} {APP_NAME}. Built with API-Football data.
        </p>
        <p className="text-center text-xs text-muted-foreground sm:text-right">
          Player stats, comparisons, and favorites — all in one place.
        </p>
      </Container>
    </footer>
  )
}
