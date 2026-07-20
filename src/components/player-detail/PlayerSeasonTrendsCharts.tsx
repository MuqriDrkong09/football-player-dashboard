import { useState, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { SeasonTrendChartPoint } from '@/utils/player'

export type SeasonTrendChartType = 'line' | 'bar'

type PlayerSeasonTrendsChartsProps = {
  data: SeasonTrendChartPoint[]
  isLoading?: boolean
}

const CHART_COLORS = {
  goals: 'var(--color-chart-1)',
  assists: 'var(--color-chart-2)',
  matches: 'var(--color-chart-3)',
  minutes: 'var(--color-chart-4)',
}

const ANIMATION_DURATION = 600

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
}

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

function GoalsAssistsChart({
  data,
  chartType,
}: {
  data: SeasonTrendChartPoint[]
  chartType: SeasonTrendChartType
}) {
  const sharedAxis = (
    <>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
      <XAxis
        dataKey="label"
        tick={{ fontSize: 12 }}
        className="fill-muted-foreground"
      />
      <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" allowDecimals={false} />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      <Legend />
    </>
  )

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          key="line-goals"
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          {sharedAxis}
          <Line
            type="monotone"
            dataKey="goals"
            name="Goals"
            stroke={CHART_COLORS.goals}
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive
            animationDuration={ANIMATION_DURATION}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey="assists"
            name="Assists"
            stroke={CHART_COLORS.assists}
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        key="bar-goals"
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        {sharedAxis}
        <Bar
          dataKey="goals"
          name="Goals"
          fill={CHART_COLORS.goals}
          radius={[4, 4, 0, 0]}
          isAnimationActive
          animationDuration={ANIMATION_DURATION}
          animationEasing="ease-in-out"
        />
        <Bar
          dataKey="assists"
          name="Assists"
          fill={CHART_COLORS.assists}
          radius={[4, 4, 0, 0]}
          isAnimationActive
          animationDuration={ANIMATION_DURATION}
          animationEasing="ease-in-out"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

function MatchesMinutesChart({
  data,
  chartType,
}: {
  data: SeasonTrendChartPoint[]
  chartType: SeasonTrendChartType
}) {
  const sharedAxis = (
    <>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
      <XAxis
        dataKey="label"
        tick={{ fontSize: 12 }}
        className="fill-muted-foreground"
      />
      <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" allowDecimals={false} />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      <Legend />
    </>
  )

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          key="line-minutes"
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          {sharedAxis}
          <Line
            type="monotone"
            dataKey="matches"
            name="Matches"
            stroke={CHART_COLORS.matches}
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive
            animationDuration={ANIMATION_DURATION}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey="minutes"
            name="Minutes"
            stroke={CHART_COLORS.minutes}
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        key="bar-minutes"
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        {sharedAxis}
        <Bar
          dataKey="matches"
          name="Matches"
          fill={CHART_COLORS.matches}
          radius={[4, 4, 0, 0]}
          isAnimationActive
          animationDuration={ANIMATION_DURATION}
          animationEasing="ease-in-out"
        />
        <Bar
          dataKey="minutes"
          name="Minutes"
          fill={CHART_COLORS.minutes}
          radius={[4, 4, 0, 0]}
          isAnimationActive
          animationDuration={ANIMATION_DURATION}
          animationEasing="ease-in-out"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PlayerSeasonTrendsCharts({
  data,
  isLoading = false,
}: PlayerSeasonTrendsChartsProps) {
  const [chartType, setChartType] = useState<SeasonTrendChartType>('line')

  if (isLoading) {
    return (
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
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No season trend data available yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Season-by-season trends for goals, assists, matches, and minutes.
        </p>
        <Tabs
          value={chartType}
          onValueChange={(value) => setChartType(value as SeasonTrendChartType)}
        >
          <TabsList aria-label="Chart type">
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame
          title="Goals & Assists"
          description="Scoring contribution by season"
        >
          <GoalsAssistsChart data={data} chartType={chartType} />
        </ChartFrame>
        <ChartFrame
          title="Matches & Minutes"
          description="Playing time by season"
        >
          <MatchesMinutesChart data={data} chartType={chartType} />
        </ChartFrame>
      </div>
    </div>
  )
}
