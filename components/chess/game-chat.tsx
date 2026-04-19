"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  username: string
  text: string
  isOwn: boolean
  timestamp: Date
}

interface GameChatProps {
  gameId: number
  userId: number
  username: string
  ws: WebSocket | null  // передаём существующий WebSocket
}

export function GameChat({ gameId, userId, username, ws }: GameChatProps) {
  const [messages, setMessages]   = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // слушаем чат сообщения из WebSocket
  useEffect(() => {
    if (!ws) return

    const originalOnMessage = ws.onmessage

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "chat") {
        setMessages(prev => [...prev, {
          id: Date.now(),
          username: data.username,
          text: data.text,
          isOwn: data.user_id === userId,
          timestamp: new Date(),
        }])
      } else {
        // передаём остальные сообщения оригинальному обработчику
        originalOnMessage?.(event)
      }
    }

    return () => {
      if (ws) ws.onmessage = originalOnMessage
    }
  }, [ws, userId])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !ws) return
    ws.send(JSON.stringify({ type: "chat", text: newMessage.trim() }))
    setNewMessage("")
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border hidden lg:block">
        <CardTitle className="text-foreground flex items-center gap-2 text-base">
          <MessageCircle className="w-4 h-4 text-primary" />
          Game Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No messages yet. Say hello!
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex flex-col", message.isOwn ? "items-end" : "items-start")}
            >
              {!message.isOwn && (
                <span className="text-xs text-muted-foreground mb-1">{message.username}</span>
              )}
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2",
                message.isOwn
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-foreground rounded-bl-sm"
              )}>
                <p className="text-sm">{message.text}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-input border-border flex-1"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}