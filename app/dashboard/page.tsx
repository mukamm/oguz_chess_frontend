"use client"

import Link from "next/link"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Bot, Zap, History, Trophy, Target, TrendingUp, Clock } from "lucide-react"
import { Header } from "@/components/header"
import { useI18n } from "@/lib/i18n"
import { useUser, useMyGames } from "@/hooks/use-user"

// форматируем секунды → "8:24"
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

export default function DashboardPage() {
  const { t } = useI18n()
  const { user, loading } = useUser()
  const { games } = useMyGames(4)

  const winRate = user && user.games_played > 0
    ? Math.round((user.wins / user.games_played) * 100) + "%"
    : "0%"

  const stats = [
    { labelKey: "dashboardGamesPlayed", value: user?.games_played ?? 0,               icon: Target,     color: "text-primary"  },
    { labelKey: "dashboardWinRate",     value: winRate,                                icon: Trophy,     color: "text-chart-4"  },
    { labelKey: "dashboardBestStreak",  value: user?.best_streak ?? 0,                icon: TrendingUp, color: "text-chart-2"  },
    { labelKey: "dashboardAvgTime",     value: formatTime(user?.avg_time_seconds ?? 0), icon: Clock,     color: "text-chart-5"  },
  ]

  const getResultLabel = (result: string) => {
    if (result === "win")  return t("historyVictory")
    if (result === "loss") return t("historyDefeat")
    return t("historyDraw")
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">

            {/* Header */}
            <div className="mt-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {t("dashboardWelcome")}, {user?.username}!
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">{t("dashboardReady")}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/lobby">
                <Card className="bg-card border-border hover:border-primary/50 transition-all duration-200 cursor-pointer group h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{t("dashboardPlayFriend")}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t("dashboardPlayFriendDesc")}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/ai">
                <Card className="bg-card border-border hover:border-primary/50 transition-all duration-200 cursor-pointer group h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-chart-2/10 flex items-center justify-center group-hover:bg-chart-2/20 transition-colors">
                      <Bot className="w-8 h-8 text-chart-2" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{t("dashboardPlayAI")}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t("dashboardPlayAIDesc")}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/lobby?quick=true">
                <Card className="bg-card border-border hover:border-primary/50 transition-all duration-200 cursor-pointer group h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-chart-4/10 flex items-center justify-center group-hover:bg-chart-4/20 transition-colors">
                      <Zap className="w-8 h-8 text-chart-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{t("dashboardQuickMatch")}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{t("dashboardQuickMatchDesc")}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.labelKey} className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{t(stat.labelKey as any)}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recent Games */}
<Card className="bg-card border-border">
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="text-foreground flex items-center gap-2">
      <History className="w-5 h-5 text-primary" />
      {t("dashboardRecentGames")}
    </CardTitle>
    <Link href="/history">
      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
        {t("dashboardViewAll")}
      </Button>
    </Link>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {games.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No games yet
        </p>
      ) : (
        games.map((game) => (
          <div
            key={game.id}
            className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                game.result === "win"  ? "bg-primary" :
                game.result === "loss" ? "bg-destructive" : "bg-chart-4"
              }`} />
              <div>
                <p className="font-medium text-foreground">{game.opponent_name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(game.played_at)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                game.result === "win"  ? "text-primary" :
                game.result === "loss" ? "text-destructive" : "text-chart-4"
              }`}>
                {getResultLabel(game.result)}
              </p>
              <p className={`text-sm ${
                game.rating_change >= 0 ? "text-primary" : "text-destructive"
              }`}>
                {game.rating_change >= 0 ? "+" : ""}{game.rating_change} ELO
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </CardContent>
</Card>

          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}