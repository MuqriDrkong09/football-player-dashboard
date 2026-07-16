import { Loader2 } from 'lucide-react'
import { useIsFetching } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

/** Global refresh feedback for football queries (e.g. after league/season change). */
export function DataRefreshingIndicator() {
  const fetchingCount = useIsFetching({ queryKey: queryKeys.all })
  const isRefreshing = fetchingCount > 0

  if (!isRefreshing) return null

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-14 z-[45] h-0.5 overflow-hidden bg-primary/15 sm:top-16"
        aria-hidden
      >
        <div className="h-full w-1/3 animate-[data-refresh-slide_1.1s_ease-in-out_infinite] bg-primary" />
      </div>

      <div
        className="pointer-events-none fixed left-1/2 top-[4.25rem] z-[45] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur sm:top-[4.75rem]"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
        <span>Updating…</span>
      </div>
    </>
  )
}
