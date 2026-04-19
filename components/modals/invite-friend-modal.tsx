"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserPlus, Copy, Check, Mail } from "lucide-react"

interface InviteFriendModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteFriendModal({ open, onOpenChange }: InviteFriendModalProps) {
  const [email, setEmail] = useState("")
  const [copied, setCopied] = useState(false)
  const gameLink = "https://chessmaster.app/invite/abc123"

  const handleCopy = () => {
    navigator.clipboard.writeText(gameLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = () => {
    // Handle sending email invite
    setEmail("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Invite a Friend</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share a game link or send an email invitation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Game Link</label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={gameLink}
                className="bg-input border-border text-sm"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                className="border-border hover:border-primary shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          {/* Email Invite */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Send Email Invite</label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="friend@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border"
              />
              <Button
                onClick={handleSendInvite}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
