import { useState } from 'react'
import { LeaderboardPanel } from '@/components/leaderboards'
import { PageShell } from '@/components/layout'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DEFAULT_SEASON, LEAGUE_LABEL } from '@/config/football'
import {
  getLeaderboardTab,
  LEADERBOARD_TABS,
  type LeaderboardTabValue,
} from '@/config/leaderboards'
import { PAGE_META } from '@/config/seo'

export function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTabValue>('scorers')
  const currentTab = getLeaderboardTab(activeTab)

  return (
    <PageShell
      {...PAGE_META.leaderboards}
      description={`Top performers in the ${LEAGUE_LABEL} · ${DEFAULT_SEASON}/${String(DEFAULT_SEASON + 1).slice(2)}`}
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as LeaderboardTabValue)}
        className="space-y-4"
      >
        <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
          <TabsList className="grid h-auto w-full min-w-[28rem] grid-cols-2 gap-1 p-1 sm:min-w-0 sm:grid-cols-4">
            {LEADERBOARD_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-2 py-2 text-xs sm:px-3 sm:text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <p className="text-sm text-muted-foreground">{currentTab.description}</p>
      </Tabs>

      <LeaderboardPanel tab={currentTab} />
    </PageShell>
  )
}
