import {
  Database,
  GitCompareArrows,
  Shield,
  Trophy,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { APP_NAME } from '@/config/navigation'
import { LEAGUE_LABEL } from '@/config/football'
import { PAGE_META } from '@/config/seo'

const FEATURES = [
  {
    title: 'Player search',
    description: 'Find players quickly with debounced search and filters.',
    icon: Users,
    href: '/players',
  },
  {
    title: 'Teams',
    description: 'Browse every club and open team profiles with season stats.',
    icon: Shield,
    href: '/teams',
  },
  {
    title: 'Leaderboards',
    description: 'Track top scorers, assists, and discipline leaders.',
    icon: Trophy,
    href: '/leaderboards',
  },
  {
    title: 'Head-to-head',
    description: 'Compare two players across key season statistics.',
    icon: GitCompareArrows,
    href: '/compare',
  },
  {
    title: 'Live football data',
    description: `Powered by API-Football for the ${LEAGUE_LABEL}.`,
    icon: Database,
    href: '/players',
  },

] as const

export function AboutPage() {
  return (
    <PageShell {...PAGE_META.about} heading="About">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{APP_NAME}</CardTitle>
            <CardDescription>
              A modern football analytics dashboard for exploring player
              profiles, seasonal performance, and league-wide leaderboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Browse {LEAGUE_LABEL} talent, save favorites locally, and dig into
              charts without leaving the app. Built with React, TypeScript,
              TanStack Query, and Tailwind CSS.
            </p>
            <Button asChild>
              <Link to="/players">Explore players</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ title, description, icon: Icon, href }) => (
            <Card
              key={title}
              className="transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/40"
            >
              <CardHeader className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" size="sm" className="px-0">
                  <Link to={href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
