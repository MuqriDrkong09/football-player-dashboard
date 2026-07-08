import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ComparisonChartRow } from '@/utils/compare'
import { countComparisonWins } from '@/utils/compare'

type ComparisonChartsProps = {
  data: ComparisonChartRow[]
  player1Name: string
  player2Name: string
  isLoading?: boolean
}

const PLAYER1_WIN_COLOR = 'var(--color-chart-1)'
const PLAYER2_WIN_COLOR = 'var(--color-chart-2)'
const MUTED_BAR_COLOR = 'var(--color-muted)'

export function ComparisonCharts({
  data,
  player1Name,
  player2Name,
  isLoading,
}: ComparisonChartsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  const wins = countComparisonWins(data)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{player1Name}</p>
            <p className="text-2xl font-bold text-[var(--color-chart-1)]">
              {wins.player1}
            </p>
            <p className="text-xs text-muted-foreground">categories won</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Ties</p>
            <p className="text-2xl font-bold">{wins.ties}</p>
            <p className="text-xs text-muted-foreground">even stats</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{player2Name}</p>
            <p className="text-2xl font-bold text-[var(--color-chart-2)]">
              {wins.player2}
            </p>
            <p className="text-xs text-muted-foreground">categories won</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Head-to-Head Comparison</CardTitle>
          <CardDescription>
            Brighter bars highlight the better statistic in each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="player1" name={player1Name} radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={`p1-${entry.stat}`}
                    fill={
                      entry.player1Better ? PLAYER1_WIN_COLOR : MUTED_BAR_COLOR
                    }
                  />
                ))}
              </Bar>
              <Bar dataKey="player2" name={player2Name} radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={`p2-${entry.stat}`}
                    fill={
                      entry.player2Better ? PLAYER2_WIN_COLOR : MUTED_BAR_COLOR
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((row) => (
          <Card
            key={row.stat}
            className={cn(
              row.player1Better && 'border-[var(--color-chart-1)]/50',
              row.player2Better && 'border-[var(--color-chart-2)]/50',
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{row.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm">{player1Name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-bold',
                      row.player1Better && 'text-[var(--color-chart-1)]',
                    )}
                  >
                    {row.player1}
                  </span>
                  {row.player1Better && (
                    <Badge variant="pitch" className="text-xs">
                      Better
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm">{player2Name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-bold',
                      row.player2Better && 'text-[var(--color-chart-2)]',
                    )}
                  >
                    {row.player2}
                  </span>
                  {row.player2Better && (
                    <Badge variant="secondary" className="text-xs">
                      Better
                    </Badge>
                  )}
                </div>
              </div>
              {row.isTie && (
                <Badge variant="outline" className="w-fit">
                  Tie
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
