import { useState } from 'react'
import { LeaderboardPanel } from '@/components/leaderboards'
import { PageShell } from '@/components/layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DEFAULT_SEASON,
  formatSeasonLabel,
  LEAGUE_LABEL,
} from '@/config/football'
import {
  getLeaderboardTab,
  isLeaderboardTabValue,
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
      description={`Top performers in the ${LEAGUE_LABEL} · ${formatSeasonLabel(DEFAULT_SEASON)}`}
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (isLeaderboardTabValue(value)) {
            setActiveTab(value)
          }
        }}
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

        <p className="text-sm text-muted-foreground">
          {currentTab.description}
        </p>

        {LEADERBOARD_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {tab.value === activeTab ? <LeaderboardPanel tab={tab} /> : null}
          </TabsContent>
        ))}
      </Tabs>
    </PageShell>
  )
}
