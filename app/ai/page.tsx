"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Brain, Zap, Crown, ChevronRight, Clock, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { api } from "@/lib/api"

export default function AIModePage() {
  const router = useRouter()
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState("5")
  const { t } = useI18n()
  

  const difficulties = [
    {
      id: "easy",
      nameKey: "aiEasy",
      descKey: "aiEasyDesc",
      icon: Zap,
      rating: "800-1200",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      borderColor: "border-chart-2/50",
      hoverBorder: "hover:border-chart-2",
    },
    {
      id: "medium",
      nameKey: "aiMedium",
      descKey: "aiMediumDesc",
      icon: Brain,
      rating: "1200-1600",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      borderColor: "border-chart-4/50",
      hoverBorder: "hover:border-chart-4",
    },
    {
      id: "hard",
      nameKey: "aiHard",
      descKey: "aiHardDesc",
      icon: Crown,
      rating: "1600-2200",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/50",
      hoverBorder: "hover:border-destructive",
    },
    {
      id: "neural",
      nameKey: "aiNeural",
      descKey: "aiNeuralDesc",
      icon: Bot,
      rating: "OguzAI",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/50",
      hoverBorder: "hover:border-purple-500",
      neural: true,
    },
  ]

  const timeControls = [
    { id: "3",         labelKey: null,        label: "3 min",   descKey: "aiBullet" },
    { id: "5",         labelKey: null,        label: "5 min",   descKey: "aiBlitz"  },
    { id: "10",        labelKey: null,        label: "10 min",  descKey: "aiRapid"  },
    { id: "unlimited", labelKey: "aiNoLimit", label: null,      descKey: "aiCasual" },
  ]

const handleStartGame = async () => {
  if (!selectedDifficulty) return
  const game = await api.createAiGame()
  if (game) {
    const isNeural = selectedDifficulty === "neural"
    const mode = isNeural ? "neural" : "ai"
    const difficulty = isNeural ? "medium" : selectedDifficulty
    router.push(`/play?game_id=${game.id}&mode=${mode}&difficulty=${difficulty}&time=${selectedTime}`)
  }
}

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-8 sm:pt-10">
          <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">

            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("aiTitle")}</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">{t("aiSubtitle")}</p>
            </div>

            {/* Difficulty Selection */}
<div className="space-y-4">
  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
    <Cpu className="w-5 h-5 text-primary" />
    {t("aiSelectDifficulty")}
  </h2>

  {/* 3 карточки сверху */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {difficulties.filter(d => !d.neural).map((difficulty) => {
      const Icon = difficulty.icon
      const isSelected = selectedDifficulty === difficulty.id
      return (
        <Card
          key={difficulty.id}
          className={cn(
            "cursor-pointer transition-all duration-200 border-2",
            isSelected
              ? `${difficulty.borderColor} ${difficulty.bgColor}`
              : `border-border ${difficulty.hoverBorder}`
          )}
          onClick={() => setSelectedDifficulty(difficulty.id)}
        >
          <CardContent className="p-6 text-center">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4", difficulty.bgColor)}>
              <Icon className={cn("w-7 h-7", difficulty.color)} />
            </div>
            <h3 className="font-semibold text-foreground text-lg">{t(difficulty.nameKey as any)}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t(difficulty.descKey as any)}</p>
            <div className={cn("mt-3 text-sm font-medium", difficulty.color)}>
              {difficulty.rating} ELO
            </div>
          </CardContent>
        </Card>
      )
    })}
  </div>

  {/* OguzAI — полная ширина */}
  {difficulties.filter(d => d.neural).map((difficulty) => {
    const Icon = difficulty.icon
    const isSelected = selectedDifficulty === difficulty.id
    return (
      <Card
        key={difficulty.id}
        className={cn(
          "cursor-pointer transition-all duration-200 border-2 relative",
          isSelected
            ? `${difficulty.borderColor} ${difficulty.bgColor}`
            : `border-border ${difficulty.hoverBorder}`,
          "ring-1 ring-purple-500/30"
        )}
        onClick={() => setSelectedDifficulty(difficulty.id)}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
          Neural Network
        </div>
        <CardContent className="p-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0", difficulty.bgColor)}>
              <Icon className={cn("w-7 h-7", difficulty.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">OguzAI</h3>
              <p className="text-sm text-muted-foreground mt-1">{t(difficulty.descKey as any)}</p>
            </div>
          </div>
          <div className={cn("text-sm font-medium shrink-0", difficulty.color)}>
            🧠 Trained on 835K games
          </div>
        </CardContent>
      </Card>
    )
  })}
</div>

            {/* Time Control */}
<div className="space-y-4">
  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
    <Clock className="w-5 h-5 text-primary" />
    {t("aiTimeControl")}
  </h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {timeControls.map((time) => (
      <Button
        key={time.id}
        variant="outline"
        className={cn(
          "h-auto py-4 flex flex-col items-center gap-1 transition-all",
          selectedTime === time.id
            ? "border-primary bg-primary/10 text-primary dark:bg-primary/25 dark:text-white pointer-events-none"
            : "border-border hover:border-primary hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-white"
        )}
        onClick={() => setSelectedTime(time.id)}
      >
        <span className="font-semibold text-lg">
          {time.labelKey ? t(time.labelKey as any) : time.label}
        </span>
        <span className="text-xs text-muted-foreground">{t(time.descKey as any)}</span>
      </Button>
    ))}
  </div>
</div>

            {/* Start Game Button */}
            <div className="pt-4">
              <Button
                onClick={handleStartGame}
                disabled={!selectedDifficulty}
                className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {t("aiStartGame")}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Tips */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-base">{t("aiTipsTitle")}</CardTitle>
                <CardDescription className="text-muted-foreground">{t("aiTipsSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {(["aiTip1", "aiTip2", "aiTip3", "aiTip4"] as const).map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="text-primary">-</span>
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
    
  )
  
}