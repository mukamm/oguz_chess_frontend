"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useI18n } from "@/lib/i18n"
import { 
  Users, 
  Bot, 
  Zap, 
  Trophy,
  ChevronRight,
  Swords,
  Globe,
  Crown
} from "lucide-react"

export default function HomePage() {
  const { t } = useI18n()

  const features = [
    {
      icon: Users,
      title: "Play with Friends",
      description: "Invite your friends and compete in private matches"
    },
    {
      icon: Bot,
      title: "Challenge AI",
      description: "Test your skills against our adaptive chess engine"
    },
    {
      icon: Zap,
      title: "Quick Match",
      description: "Find opponents instantly with our matchmaking system"
    },
    {
      icon: Trophy,
      title: "Track Progress",
      description: "Monitor your ELO rating and improve your game"
    }
  ]

  const stats = [
    { value: "50K+", label: "Active Players" },
    { value: "1M+", label: "Games Played" },
    { value: "24/7", label: "Online" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-14 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              {t("playWorldwide")}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance">
              {t("heroTitle1")}
              <span className="text-primary"> {t("heroTitle2")}</span>
            </h1>
            <p className="text-xl text-muted-foreground mt-6 text-pretty">
              {t("heroDesc")}
            </p>
            <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                  {t("startPlaying")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/lobby">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-border hover:border-primary hover:!bg-primary hover:!text-white px-8"
                >
                  <Swords className="w-5 h-5 mr-2" />
                  {t("findMatch")}
                </Button>
              </Link>
            </div>
          </div>
          
          
        </div>
      </section>
      
      {/* Features Section */}
      <section className="pt-8 pb-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">{t("featuresTitle")}</h2>
            <p className="text-muted-foreground mt-3">
              {t("featuresSubtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="bg-card border-border hover:border-primary/50 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="bg-card border-border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
            <CardContent className="p-12 text-center relative z-10">
              <Crown className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-foreground">{t("readyToPlay")}</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                {t("readyToPlayDesc")}
              </p>
              <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                <Link href="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                    {t("createAccount")}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-border hover:border-primary">
                    {t("signIn")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
