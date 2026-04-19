import { useState, useEffect, useRef } from "react"
import { api } from "@/lib/api"

export type LobbyPlayer = {
  id: number
  username: string
  elo_rating: number
  status: "online" | "in-game"
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000"

export function useLobby() {
  const [players, setPlayers] = useState<LobbyPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    api.lobbyHeartbeat()
    api.getLobbyPlayers().then(data => {
      setPlayers(data)
      setLoading(false)
    })

    // WS уведомлений — с JWT токеном
    const token = api.getWsToken()
    if (token) {
      const socket = new WebSocket(`${WS_URL}/ws/notifications?token=${token}`)
      wsRef.current = socket
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.type === "challenge") {
          // Обрабатывается в use-notifications через header
          window.dispatchEvent(new CustomEvent("chess:challenge", { detail: msg }))
        }
      }
    }

    const interval = setInterval(() => {
      api.lobbyHeartbeat()
      api.getLobbyPlayers().then(setPlayers)
    }, 5000)

    return () => {
      clearInterval(interval)
      wsRef.current?.close()
    }
  }, [])

  return { players, loading }
}
