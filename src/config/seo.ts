import { APP_NAME } from '@/config/navigation'
import { LEAGUE_LABEL } from '@/config/football'

export const SEO_DEFAULTS = {
  siteName: APP_NAME,
  titleTemplate: `%s | ${APP_NAME}`,
  description: `Explore ${LEAGUE_LABEL} player stats, leaderboards, comparisons, and favorites — powered by live football data.`,
  keywords: [
    'football',
    'soccer',
    'premier league',
    'player stats',
    'leaderboards',
    'football dashboard',
  ].join(', '),
  themeColor: '#15803d',
} as const

export type PageMeta = {
  title: string
  description?: string
  noIndex?: boolean
}

export const PAGE_META = {
  home: {
    title: 'Dashboard',
    description: SEO_DEFAULTS.description,
  },
  players: {
    title: 'Players',
    description: `Search and filter ${LEAGUE_LABEL} players by team, position, and nationality.`,
  },
  playerDetail: {
    title: 'Player Details',
    description: `View season statistics, charts, and profile details for ${LEAGUE_LABEL} players.`,
  },
  teams: {
    title: 'Teams',
    description: `Browse all ${LEAGUE_LABEL} clubs and open a team for stadium, coach, and season stats.`,
  },
  teamDetail: {
    title: 'Team Details',
    description: `View club profile, stadium, coach, and season statistics for ${LEAGUE_LABEL} teams.`,
  },

  leaderboards: {
    title: 'Leaderboards',
    description: `Top scorers, assists, and card leaders in the ${LEAGUE_LABEL}.`,
  },
  compare: {
    title: 'Compare Players',
    description: `Compare head-to-head season statistics between two ${LEAGUE_LABEL} players.`,
  },
  favorites: {
    title: 'Favorites',
    description: 'Your saved football players stored locally in this browser.',
  },
  about: {
    title: 'About',
    description: `Learn about ${APP_NAME} — a football analytics dashboard powered by API-Football.`,
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The requested page could not be found.',
    noIndex: true,
  },
} as const satisfies Record<string, PageMeta>

export function formatDocumentTitle(title: string): string {
  if (title === APP_NAME || title === 'Dashboard') {
    return `${APP_NAME} — ${LEAGUE_LABEL} Stats`
  }

  return SEO_DEFAULTS.titleTemplate.replace('%s', title)
}
