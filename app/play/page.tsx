"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Chessboard } from "@/components/chess/chessboard"
import { GameChat } from "@/components/chess/game-chat"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Flag, Handshake, RotateCcw, Trophy, Clock, MessageCircle, X, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { useUser } from "@/hooks/use-user"
import { useChessGame } from "@/hooks/use-chess-game"
import { api } from "@/lib/api"

interface Move {
  number: number
  white: string
  black?: string
}

export default function PlayPage() {
  const { t } = useI18n()
  const { user } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [gameId, setGameId]         = useState<number | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [moves, setMoves]           = useState<Move[]>([])
  const [whiteTime, setWhiteTime]   = useState(300)
  const [blackTime, setBlackTime]   = useState(300)
  const [aiFen, setAiFen]           = useState<string>("start")
  const [aiGameOver, setAiGameOver] = useState(false)
  const [aiResult, setAiResult]     = useState<"win" | "loss" | "draw" | null>(null)
  const [aiThinking, setAiThinking] = useState(false)

  const mode       = searchParams.get("mode")
  const difficulty = searchParams.get("difficulty") || "medium"
  const isNeural = mode === "neural"
const isAiMode = mode === "ai" || isNeural

 useEffect(() => {
  const existingGameId = searchParams.get("game_id")
  const opponentId = searchParams.get("opponent")

  if (existingGameId) {
    setGameId(Number(existingGameId))
  } else if (user && isAiMode) {
    api.createAiGame().then(game => {
      if (game) {
        setGameId(game.id)
        router.replace(`/play?mode=${mode}&game_id=${game.id}&difficulty=${difficulty}`)
      }
    })
  } else if (user && !isAiMode) {
    api.createChessGame(opponentId ? Number(opponentId) : undefined)
      .then(game => {
        if (game) {
          setGameId(game.id)
          router.replace(`/play?game_id=${game.id}`)
        }
      })
  }
}, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const { fen, isMyTurn, isWhite, status, winner, error, sendMove, wsRef } =
    useChessGame(isAiMode ? 0 : (gameId ?? 0), isAiMode ? 0 : (user?.id ?? 0))

  // Таймер (только мультиплеер)
  useEffect(() => {
  // Для мультиплеера
  if (!isAiMode) {
    if (status !== "playing" || !gameId) return
    const timer = setInterval(() => {
      if (isMyTurn) setWhiteTime(prev => Math.max(0, prev - 1))
      else          setBlackTime(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }

  // Для AI режима
  if (isAiMode) {
    if (aiGameOver || aiThinking) return
    const timer = setInterval(() => {
      setWhiteTime(prev => {
        if (prev <= 1) {
          setAiGameOver(true)
          setAiResult("loss") // время вышло = проигрыш
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }
}, [isMyTurn, status, gameId, isAiMode, aiGameOver, aiThinking])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const addMoveToHistory = (uciMove: string, isAiMove = false) => {
    setMoves(prev => {
      const last = prev[prev.length - 1]
      // Ход AI идёт как чёрный ход в последней незавершённой паре
      if (isAiMove && last && last.black === undefined) {
        return [...prev.slice(0, -1), { ...last, black: uciMove }]
      }
      // Новый ход игрока
      if (!last || last.black !== undefined) {
        return [...prev, { number: prev.length + 1, white: uciMove }]
      }
      return [...prev.slice(0, -1), { ...last, black: uciMove }]
    })
  }

  const handleMove = async (uciMove: string) => {
  if (isAiMode && gameId) {
    setAiThinking(true)
    addMoveToHistory(uciMove)

    // ← главное изменение
    const result = isNeural
      ? await api.makeNeuralMove(gameId, uciMove, difficulty)
      : await api.makeAiMove(gameId, uciMove, difficulty)

    if (result?.ai_move) addMoveToHistory(result.ai_move, true)
    setAiThinking(false)

    if (result) {
      setAiFen(result.fen)
      if (result.status === "finished") {
        setAiGameOver(true)
        if (result.winner === "player") setAiResult("win")
        else if (result.winner === "ai") setAiResult("loss")
        else setAiResult("draw")
      }
    }
  } else {
    sendMove(uciMove)
    addMoveToHistory(uciMove)
  }
}

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!isAiMode && !gameId) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const currentFen    = isAiMode ? aiFen : fen
  const boardDisabled = isAiMode
    ? (aiGameOver || aiThinking)
    : (!isMyTurn || status !== "playing")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 p-3 sm:p-4 lg:p-8 pt-6">
        <div className="max-w-7xl mx-auto">

          {/* Статусные баннеры */}
          {!isAiMode && error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}
          {!isAiMode && status === "disconnected" && (
            <div className="mb-4 p-3 rounded-lg bg-chart-4/10 text-chart-4 text-sm text-center">
              Opponent disconnected — trying to reconnect...
            </div>
          )}
          {!isAiMode && status === "game_over" && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm text-center font-semibold">
              {winner === user.id ? "🏆 You won!" : winner === null ? "Draw!" : "You lost!"}
            </div>
          )}

          {/* AI баннеры */}
          {isAiMode && aiGameOver && (
            <div className={`mb-4 p-3 rounded-lg text-sm text-center font-semibold ${
              aiResult === "win"  ? "bg-primary/10 text-primary" :
              aiResult === "loss" ? "bg-destructive/10 text-destructive" :
                                   "bg-chart-4/10 text-chart-4"
            }`}>
              {aiResult === "win"  ? "🏆 You won!" :
               aiResult === "loss" ? "You lost!" :
                                     "Draw!"}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px_300px] gap-4 lg:gap-6">

            {/* Main Game Area */}
            <div className="flex flex-col items-center gap-3 sm:gap-4">

              {/* Opponent Info */}
              <Card className="w-full max-w-lg bg-card border-border">
                <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-border">
                      <AvatarFallback className="bg-secondary text-foreground text-xs sm:text-sm">
                        {isAiMode ? <Bot className="w-4 h-4" /> : "OP"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-sm sm:text-base">
  {isAiMode
    ? isNeural
      ? "🧠 OguzAI"
      : `AI Bot (${difficulty})`
    : (isWhite ? "Black Player" : "White Player")}
</p>
<div className="flex items-center gap-1 text-xs sm:text-sm">
  <Trophy className="w-3 h-3 text-primary" />
  <span className="text-muted-foreground">
    {isNeural
      ? "Neural Network"
      : difficulty === "easy" ? "800-1200"
      : difficulty === "medium" ? "1200-1600"
      : "1600-2200"} ELO
  </span>
</div>
                    </div>
                  </div>
{isAiMode ? (
  <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-mono text-base sm:text-xl font-bold bg-secondary text-foreground">
    <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2" />
    ∞
  </div>
) : (
  <div className={cn(
    "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-mono text-base sm:text-xl font-bold transition-colors duration-300",
    !isMyTurn ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
  )}>
    <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2" />
    {formatTime(blackTime)}
  </div>
)}

{isAiMode ? (
  <div className={cn(
    "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-mono text-base sm:text-xl font-bold transition-colors duration-300",
    whiteTime < 30 ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
  )}>
    <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2" />
    {formatTime(whiteTime)}
  </div>
) : (
  <div className={cn(
    "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-mono text-base sm:text-xl font-bold transition-colors duration-300",
    isMyTurn ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
  )}>
    <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2" />
    {formatTime(whiteTime)}
  </div>
)}
                </CardContent>
              </Card>

              {/* Chessboard */}
              <div className="w-full max-w-lg">
                <Chessboard
                  fen={currentFen}
                  onMove={handleMove}
                  disabled={boardDisabled}
                  flipped={isAiMode ? false : !isWhite}
                />
              </div>

              {/* Player Info */}
              <Card className="w-full max-w-lg bg-card border-border">
                <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs sm:text-sm">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-sm sm:text-base">
                        {user.username} ({t("playYou")})
                      </p>
                      <div className="flex items-center gap-1 text-xs sm:text-sm">
                        <Trophy className="w-3 h-3 text-primary" />
                        <span className="text-muted-foreground">{user.elo_rating} ELO</span>
                      </div>
                    </div>
                  </div>
                  {!isAiMode && (
                    <div className={cn(
                      "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-mono text-base sm:text-xl font-bold transition-colors duration-300",
                      isMyTurn ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    )}>
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2" />
                      {formatTime(whiteTime)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Move History — Mobile */}
              <Card className="w-full max-w-lg bg-card border-border lg:hidden">
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">{t("playMoveHistory")}</h3>
                  <div className="max-h-32 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {moves.map((move) => (
                        <div key={move.number} className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="text-muted-foreground font-medium w-5">{move.number}.</span>
                          <span className="text-foreground font-mono">{move.white}</span>
                          {move.black && <span className="text-muted-foreground font-mono">{move.black}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Game Controls */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-destructive hover:text-destructive text-xs sm:text-sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to resign?")) {
                      if (isAiMode) { setAiGameOver(true); setAiResult("loss") }
                      else wsRef.current?.send(JSON.stringify({ type: "resign" }))
                    }
                  }}
                >
                  <Flag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {t("playResign")}
                </Button>
                {!isAiMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:border-chart-4 hover:text-chart-4 text-xs sm:text-sm"
                    onClick={() => wsRef.current?.send(JSON.stringify({ type: "offer_draw" }))}
                  >
                    <Handshake className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {t("playOfferDraw")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-primary hover:text-primary text-xs sm:text-sm"
                  onClick={() => router.push(isAiMode ? "/ai" : "/lobby")}
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {t("playRematch")}
                </Button>
              </div>
            </div>

            {/* Move History — Desktop */}
            <Card className="hidden lg:flex bg-card border-border h-fit lg:h-[500px] xl:h-[600px] flex-col">
              <CardContent className="p-4 flex-1 overflow-hidden flex flex-col">
                <h3 className="font-semibold text-foreground mb-4">{t("playMoveHistory")}</h3>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {moves.map((move) => (
                    <div key={move.number} className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50 text-sm transition-colors">
                      <span className="w-6 text-muted-foreground font-medium">{move.number}.</span>
                      <span className="w-16 text-foreground font-mono">{move.white}</span>
                      <span className="w-16 text-muted-foreground font-mono">{move.black || ""}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat — Desktop (только мультиплеер) */}
            {!isAiMode && (
              <div className="hidden xl:block h-[600px]">
                <GameChat
                  gameId={gameId ?? 0}
                  userId={user.id}
                  username={user.username}
                  ws={wsRef.current}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile Chat — только мультиплеер */}
      {!isAiMode && (
        <>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn(
              "xl:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-50 transition-all duration-300 hover:scale-105",
              isChatOpen && "bg-secondary text-foreground"
            )}
          >
            {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </button>

          <div className={cn(
            "xl:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-in-out",
            isChatOpen ? "translate-y-0" : "translate-y-full"
          )}>
            <div className="h-[70vh] bg-card/95 backdrop-blur-md border-t border-border rounded-t-2xl shadow-2xl">
              <div className="h-full p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    {t("playGameChat")}
                  </h3>
                  <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="h-[calc(100%-3rem)]">
                  <GameChat
                    gameId={gameId ?? 0}
                    userId={user.id}
                    username={user.username}
                    ws={wsRef.current}
                  />
                </div>
              </div>
            </div>
          </div>

          {isChatOpen && (
            <div className="xl:hidden fixed inset-0 bg-background/50 backdrop-blur-sm z-30" onClick={() => setIsChatOpen(false)} />
          )}
        </>
      )}
    </div>
  )
}
