import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000"

export function useNotifications(userId: number) {
  const ws = useRef<WebSocket | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!userId) return

    const token = api.getWsToken()
    if (!token) return

    // Токен в query-param, не user_id в URL
    ws.current = new WebSocket(`${WS_URL}/ws/notifications?token=${token}`)

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === "challenge") {
        const accept = window.confirm(
          `${msg.from_username} challenges you! Accept?`
        )
        if (accept) {
          router.push(`/play?game_id=${msg.game_id}`)
        }
      }
    }

    ws.current.onclose = () => { ws.current = null }

    return () => ws.current?.close()
  }, [userId, router])
}
