"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Search, Zap, Trophy, Clock, Swords, UserPlus, Circle } from "lucide-react"
import { InviteFriendModal } from "@/components/modals/invite-friend-modal"
import { MatchmakingModal } from "@/components/modals/matchmaking-modal"
import { useI18n } from "@/lib/i18n"
import { useLobby } from "@/hooks/use-lobby"
import { api } from "@/lib/api"

export default function LobbyPage() {
  const [searchQuery, setSearchQuery]         = useState("")
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [matchmakingOpen, setMatchmakingOpen] = useState(false)
  const [challenging, setChallenging]         = useState<number | null>(null)
  const { t } = useI18n()
  const { players, loading } = useLobby()
  const router = useRouter()

  const filteredPlayers = players.filter(p =>
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChallenge = async (opponentId: number) => {
    setChallenging(opponentId)
    const game = await api.createChessGame(opponentId)
    if (game) {
      router.push(`/play?game_id=${game.id}`)
    }
    setChallenging(null)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-8 sm:pt-10">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("lobbyTitle")}</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">{t("lobbySubtitle")}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  onClick={() => setInviteModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-primary text-xs sm:text-sm"
                >
                  <UserPlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t("lobbyInviteFriend")}</span>
                </Button>
                <Button
                  onClick={() => setMatchmakingOpen(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                >
                  <Zap className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t("lobbyQuickMatch")}</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Online Players */}
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        {t("lobbyOnlinePlayers")}
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          ({filteredPlayers.filter(p => p.status === "online").length} {t("lobbyAvailable")})
                        </span>
                      </CardTitle>
                    </div>
                    <div className="relative mt-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t("lobbySearchPlayers")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-input border-border"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : filteredPlayers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No players online
                        </p>
                      ) : (
                        filteredPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                                    {player.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <Circle className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                                  player.status === "online"
                                    ? "fill-primary text-primary"
                                    : "fill-chart-4 text-chart-4"
                                }`} />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{player.username}</p>
                                <div className="flex items-center gap-1 text-sm">
                                  <Trophy className="w-3 h-3 text-primary" />
                                  <span className="text-muted-foreground">{player.elo_rating} ELO</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {player.status === "online" ? (
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                  onClick={() => handleChallenge(player.id)}
                                  disabled={challenging === player.id}
                                >
                                  {challenging === player.id ? (
                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-1" />
                                  ) : (
                                    <Swords className="w-4 h-4 mr-1" />
                                  )}
                                  {t("lobbyChallenge")}
                                </Button>
                              ) : (
                                <span className="text-sm text-chart-4 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {t("lobbyInGame")}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Games — пока статичные */}
              <div>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Swords className="w-5 h-5 text-chart-4" />
                      {t("lobbyLiveGames")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No live games
                    </p>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </main>
        <Footer />
      </div>

      <InviteFriendModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} />
      <MatchmakingModal open={matchmakingOpen} onOpenChange={setMatchmakingOpen} />
    </>
  )
}