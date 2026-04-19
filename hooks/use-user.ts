import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export type User = {
  id: number
  username: string
  email: string
  elo_rating: number
  games_played: number
  wins: number
  losses: number
  draws: number
  best_streak: number
  avg_time_seconds: number
  created_at: string
  last_seen_at: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMe()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}

export type GameHistory = {
  id: number
  opponent_name: string
  opponent_id: number | null
  result: "win" | "loss" | "draw"
  rating_change: number
  played_at: string
}

export function useMyGames(limit = 10) {
  const [games, setGames] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyGames(limit)
      .then(setGames)
      .finally(() => setLoading(false))
  }, [limit])

  return { games, loading }
}