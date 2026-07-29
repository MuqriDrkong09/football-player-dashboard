import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, CalendarRange, Clock, HeartPulse, Timer } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type {
  InjuriesBySeasonChartPoint,
  InjuryAnalyticsSummary,
  RecoveryDurationTrendChartPoint,
} from '@/utils/injury'

type InjuryAnalyticsProps = {
  summary: InjuryAnalyticsSummary
  injuriesBySeason: InjuriesBySeasonChartPoint[]
  recoveryDurationTrend: RecoveryDurationTrendChartPoint[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isRetrying?: boolean
}

const CHART_COLORS = {
  injuries: 'var(--color-chart-1)',
  recovery: 'var(--color-chart-2)',
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
}

const ANIMATION_DURATION = 600

const SUMMARY_ITEMS = [
  { key: 'totalInjuries', label: 'Total injuries', icon: HeartPulse },
  { key: 'totalRecoveryDays', label: 'Total recovery days', icon: Clock },
  { key: 'longestInjury', label: 'Longest injury', icon: Timer },
  { key: 'currentInjuryStatus', label: 'Current injury status', icon: Activity },
] as const

function ChartFrame({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">{children}</div>
      </CardContent>
    </Card>
  )
}

function SummaryValue({
  itemKey,
  summary,
}: {
  itemKey: (typeof SUMMARY_ITEMS)[number]['key']
  summary: InjuryAnalyticsSummary
}) {
  if (itemKey === 'totalInjuries') {
    return (
      <p className="text-3xl font-bold tracking-tight tabular-nums">
        {summary.totalInjuries}
      </p>
    )
  }

  if (itemKey === 'totalRecoveryDays') {
    return (
      <p className="text-3xl font-bold tracking-tight tabular-nums">
        {summary.totalRecoveryDays}
      </p>
    )
  }

  if (itemKey === 'longestInjury') {
    if (!summary.longestInjury) {
      return <p className="text-lg font-semibold">None recorded</p>
    }

    return (
      <div className="space-y-1">
        <p className="text-lg font-semibold leading-tight">
          {summary.longestInjury.injuryType}
        </p>
        <p className="text-sm text-muted-foreground">
          {summary.longestInjury.durationLabel}
        </p>
      </div>
    )
  }

  return <p className="text-lg font-semibold">{summary.currentInjuryStatus}</p>
}

function InjuriesBySeasonChart({
  data,
}: {
  data: InjuriesBySeasonChartPoint[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
          allowDecimals={false}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar
          dataKey="injuries"
          name="Injuries"
          fill={CHART_COLORS.injuries}
          radius={[4, 4, 0, 0]}
          isAnimationActive
          animationDuration={ANIMATION_DURATION}
          animationEasing="ease-in-out"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

function RecoveryDurationTrendChart({
  data,
}: {
  data: RecoveryDurationTrendChartPoint[]
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
          allowDecimals={false}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line
          type="monotone"
          dataKey="averageDays"
          name="Avg. recovery days"
          stroke={CHART_COLORS.recovery}
          strokeWidth={2.5}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive
          animationDuration={ANIMATION_DURATION}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function InjuryAnalytics({
  summary,
  injuriesBySeason,
  recoveryDurationTrend,
  isLoading = false,
  isError = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,
}: InjuryAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="list" count={4} />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load injury analytics.'}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (summary.totalInjuries === 0) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="No injury analytics"
        description="Injury analytics are not available for this player yet."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_ITEMS.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <SummaryValue itemKey={key} summary={summary} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame
          title="Injuries by season"
          description="Number of recorded injuries per season"
        >
          <InjuriesBySeasonChart data={injuriesBySeason} />
        </ChartFrame>
        <ChartFrame
          title="Recovery duration trend"
          description="Average recovery days per season"
        >
          <RecoveryDurationTrendChart data={recoveryDurationTrend} />
        </ChartFrame>
      </div>
    </div>
  )
}
