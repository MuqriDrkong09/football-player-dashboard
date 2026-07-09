import { useState } from 'react'
import { LeaderboardPanel } from '@/components/leaderboards'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DEFAULT_SEASON,
  LEAGUE_LABEL,
} from '@/config/football'
import {
  getLeaderboardTab,
  LEADERBOARD_TABS,
  type LeaderboardTabValue,
} from '@/config/leaderboards'

export function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTabValue>('scorers')
  const currentTab = getLeaderboardTab(activeTab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Leaderboards
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Top performers in the {LEAGUE_LABEL} · {DEFAULT_SEASON}/
          {String(DEFAULT_SEASON + 1).slice(2)}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as LeaderboardTabValue)}
        className="space-y-4"
      >
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto w-full min-w-max flex-wrap justify-start gap-1 p-1">
            {LEADERBOARD_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-3 py-2"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <p className="text-sm text-muted-foreground">{currentTab.description}</p>
      </Tabs>

      <LeaderboardPanel tab={currentTab} />
    </div>
  )
}
