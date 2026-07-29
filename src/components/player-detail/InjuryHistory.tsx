import { HeartPulse } from 'lucide-react'
import { EmptyState, LoadingSkeleton } from '@/components/feedback'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { InjuryHistoryItem, InjuryRecoveryStatus } from '@/utils/injury'

type InjuryHistoryProps = {
  records: InjuryHistoryItem[]
  isLoading?: boolean
}

const recoveryBadgeStyles: Record<InjuryRecoveryStatus, string> = {
  Recovered:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Ongoing:
    'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  'Expected return':
    'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  Unknown:
    'border-border bg-muted/40 text-muted-foreground',
}

function InjuryCard({ record }: { record: InjuryHistoryItem }) {
  return (
    <Card>
      <CardHeader className="space-y-3 p-4 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">{record.injuryType}</CardTitle>
            {record.bodyArea ? (
              <CardDescription>Body area: {record.bodyArea}</CardDescription>
            ) : null}
          </div>
          <Badge
            variant="outline"
            className={cn(recoveryBadgeStyles[record.recoveryStatus])}
          >
            {record.recoveryStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-2">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Start date</dt>
            <dd className="font-medium">{record.startDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">End / expected return</dt>
            <dd className="font-medium">{record.endDateLabel}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Recovery status</dt>
            <dd className="font-medium">{record.recoveryLabel}</dd>
          </div>
          {record.matchesMissed != null ? (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Matches missed</dt>
              <dd className="font-semibold tabular-nums">{record.matchesMissed}</dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  )
}

export function InjuryHistory({
  records,
  isLoading = false,
}: InjuryHistoryProps) {
  if (isLoading) {
    return <LoadingSkeleton variant="card-grid" count={3} cardVariant="team" />
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={HeartPulse}
        title="No injury history"
        description="Injury records are not available for this player yet."
      />
    )
  }

  return (
    <div
      className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3')}
      aria-label="Injury history"
    >
      {records.map((record) => (
        <InjuryCard key={record.id} record={record} />
      ))}
    </div>
  )
}
