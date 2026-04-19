"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Zap, Loader2, X } from "lucide-react"

interface MatchmakingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MatchmakingModal({ open, onOpenChange }: MatchmakingModalProps) {
  const router = useRouter()
  const [searching, setSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [playersSearching, setPlayersSearching] = useState(127)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (searching) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1)
        // Simulate finding a match after random time
        if (searchTime > 3 && Math.random() > 0.7) {
          setSearching(false)
          onOpenChange(false)
          router.push("/play?matched=true")
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [searching, searchTime, onOpenChange, router])

  useEffect(() => {
    // Simulate fluctuating player count
    const interval = setInterval(() => {
      setPlayersSearching(prev => prev + Math.floor(Math.random() * 10) - 5)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleStartSearch = () => {
    setSearching(true)
    setSearchTime(0)
  }

  const handleCancelSearch = () => {
    setSearching(false)
    setSearchTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) handleCancelSearch()
      onOpenChange(open)
    }}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Quick Match</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Find an opponent at your skill level
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {!searching ? (
            <>
              {/* Time Controls */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Time Control</label>
                <div className="grid grid-cols-3 gap-2">
                  {["3 min", "5 min", "10 min"].map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className="border-border hover:border-primary hover:bg-primary/10"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <span className="text-primary font-medium">{playersSearching}</span> players searching
              </div>
              
              <Button
                onClick={handleStartSearch}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Zap className="w-4 h-4 mr-2" />
                Find Match
              </Button>
            </>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-border" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              
              <div>
                <p className="text-lg font-semibold text-foreground">Searching for opponent...</p>
                <p className="text-2xl font-bold text-primary mt-2">{formatTime(searchTime)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated wait: {"< 30 seconds"}
                </p>
              </div>
              
              <Button
                onClick={handleCancelSearch}
                variant="outline"
                className="border-border hover:border-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Search
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
