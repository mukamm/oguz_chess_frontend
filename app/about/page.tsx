"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import { Users, Bot, Globe, Trophy } from "lucide-react"

export default function AboutPage() {
  const { t } = useI18n()

  const features = [
    { icon: Users, title: t("aboutFeature1Title"), desc: t("aboutFeature1Desc") },
    { icon: Bot, title: t("aboutFeature2Title"), desc: t("aboutFeature2Desc") },
    { icon: Globe, title: t("aboutFeature3Title"), desc: t("aboutFeature3Desc") },
    { icon: Trophy, title: t("aboutFeature4Title"), desc: t("aboutFeature4Desc") },
  ]

  const stats = [
    { value: "50K+", label: t("aboutStats1") },
    { value: "1M+", label: t("aboutStats2") },
    { value: "24/7", label: t("aboutStats3") },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            {t("aboutTitle")}
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
            {t("aboutSubtitle")}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t("aboutMission")}</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">{t("aboutMissionText")}</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card/30">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">
            {t("aboutFeatures")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <Card
                  key={f.title}
                  className="bg-card border-border hover:border-primary/50 transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
