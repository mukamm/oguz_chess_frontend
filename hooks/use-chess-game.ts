import { useEffect, useRef, useState, useCallback } from "react"
import { api } from "@/lib/api"

export type GameMessage =
  | { type: "joined";               fen: string; white_id: number; black_id: number | null; user_id: number }
  | { type: "move";                 fen: string; move: string }
  | { type: "game_over";            fen: string; winner: number | null }
  | { type: "opponent_disconnected" }
  | { type: "error";                message: string }

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000"

// Exponential backoff: 1s → 2s → 4s → 8s
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000]

export function useChessGame(gameId: number, userId: number) {
  const ws           = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptRef   = useRef(0)
  const unmountedRef = useRef(false)
  const statusRef    = useRef<string>("connecting")

  const [fen,      setFen]      = useState<string>("start")
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [isWhite,  setIsWhite]  = useState(false)
  const [status,   setStatus]   = useState<"connecting" | "playing" | "game_over" | "disconnected">("connecting")
  const [winner,   setWinner]   = useState<number | null | undefined>(undefined)
  const [error,    setError]    = useState<string | null>(null)

  const connect = useCallback(() => {
    if (!gameId || !userId) return

    const token = api.getWsToken()
    if (!token) { setStatus("disconnected"); return }

    const socket = new WebSocket(`${WS_URL}/ws/game/${gameId}?token=${token}`)
    ws.current = socket

    socket.onopen = () => { attemptRef.current = 0 }

    socket.onmessage = (event) => {
      const msg: GameMessage = JSON.parse(event.data)

      if (msg.type === "joined") {
        setFen(msg.fen)
        const amWhite = msg.white_id === userId
        setIsWhite(amWhite)
        setIsMyTurn(amWhite)
        setStatus("playing")
        statusRef.current = "playing"
      }
      if (msg.type === "move") {
        setFen(msg.fen)
        setIsMyTurn(prev => !prev)
      }
      if (msg.type === "game_over") {
        setFen(msg.fen)
        setWinner(msg.winner)
        setStatus("game_over")
        statusRef.current = "game_over"
      }
      if (msg.type === "opponent_disconnected") {
        setStatus("disconnected")
        statusRef.current = "disconnected"
      }
      if (msg.type === "error") {
        setError(msg.message)
        setTimeout(() => setError(null), 3000)
      }
    }

    socket.onclose = (e) => {
      if (unmountedRef.current) return
      // 4001 = Unauthorized, 4003 = Forbidden — не переподключаемся
      if (e.code === 4001 || e.code === 4003) { setStatus("disconnected"); return }
      // Игра завершена — тоже не переподключаемся
      if (statusRef.current === "game_over") return

      setStatus("disconnected")
      const delay = RECONNECT_DELAYS[Math.min(attemptRef.current, RECONNECT_DELAYS.length - 1)]
      attemptRef.current++
      reconnectRef.current = setTimeout(connect, delay)
    }
  }, [gameId, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    unmountedRef.current = false
    connect()
    return () => {
      unmountedRef.current = true
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      ws.current?.close()
    }
  }, [connect])

  const sendMove = useCallback((uciMove: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "move", move: uciMove }))
    }
  }, [])

  const sendChat = useCallback((text: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "chat", text }))
    }
  }, [])

  return { fen, isMyTurn, isWhite, status, winner, error, sendMove, sendChat, wsRef: ws }
}
