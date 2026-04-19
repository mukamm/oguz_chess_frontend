"use client"

import { useState } from "react"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import { History, Trophy, Filter, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n"
import { useUser } from "@/hooks/use-user"
import { useMyGames, GameHistory } from "@/hooks/use-user"

function formatDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function HistoryPage() {
  const [filter, setFilter] = useState("all")
  const { t } = useI18n()
  const { user } = useUser()
  const { games, loading } = useMyGames(50)

  const filteredGames = games.filter(game => {
    if (filter === "all") return true
    return game.result === filter
  })

  const stats = {
    total:  user?.games_played ?? 0,
    wins:   user?.wins         ?? 0,
    losses: user?.losses       ?? 0,
    draws:  user?.draws        ?? 0,
  }

  const getFilterLabel = () => {
    if (filter === "all")  return t("historyAllGames")
    if (filter === "win")  return t("historyWins")
    if (filter === "loss") return t("historyLosses")
    if (filter === "draw") return t("historyDraws")
    return t("historyAllGames")
  }

  const getResultLabel = (result: string) => {
    if (result === "win")  return t("historyVictory")
    if (result === "loss") return t("historyDefeat")
    return t("historyDraw")
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("historyTitle")}</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">{t("historySubtitle")}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-border">
                    <Filter className="w-4 h-4 mr-2" />
                    {getFilterLabel()}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border">
                  <DropdownMenuItem onClick={() => setFilter("all")}  className="text-foreground">{t("historyAllGames")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("win")}  className="text-foreground">{t("historyWins")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("loss")} className="text-foreground">{t("historyLosses")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("draw")} className="text-foreground">{t("historyDraws")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("historyTotalGames")}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{stats.wins}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("historyWins")}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-destructive">{stats.losses}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("historyLosses")}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-chart-4">{stats.draws}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t("historyDraws")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Games List */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  {t("historyRecentGames")} ({filteredGames.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredGames.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No games yet</p>
                ) : (
                  <div className="space-y-3">
                    {filteredGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-1 h-12 rounded-full ${
                            game.result === "win"  ? "bg-primary" :
                            game.result === "loss" ? "bg-destructive" : "bg-chart-4"
                          }`} />
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">
                              {game.opponent_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{game.opponent_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(game.played_at)}
                            </p>
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}