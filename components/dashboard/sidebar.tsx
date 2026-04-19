"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { 
  Crown, 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  Bot, 
  History, 
  Settings, 
  LogOut,
  Trophy,
  Menu,
  X
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lobby", label: "Game Lobby", icon: Users },
  { href: "/play", label: "Play Now", icon: Gamepad2 },
  { href: "/ai", label: "Play vs AI", icon: Bot },
  { href: "/history", label: "Game History", icon: History },
]

interface SidebarProps {
  user?: {
    name: string
    avatar?: string
    rating: number
  }
}

export function Sidebar({ user = { name: "GrandMaster", rating: 1847 } }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">ChessMaster</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            </div>
            <span className="text-lg lg:text-xl font-bold text-sidebar-foreground">ChessMaster</span>
          </Link>
        </div>
        
        {/* User Profile */}
        <div className="p-3 lg:p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 p-2 lg:p-3 rounded-xl bg-sidebar-accent">
            <Avatar className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-primary/30">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm lg:text-base">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sidebar-foreground truncate text-sm lg:text-base">{user.name}</p>
              <div className="flex items-center gap-1 text-xs lg:text-sm">
                <Trophy className="w-3 h-3 text-primary" />
                <span className="text-primary font-medium">{user.rating}</span>
                <span className="text-muted-foreground">ELO</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        
        {/* Theme Toggle - Desktop */}
        <div className="hidden lg:flex p-4 border-t border-sidebar-border items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        
        {/* Bottom Actions */}
        <div className="p-3 lg:p-4 border-t border-sidebar-border space-y-1">
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button className="w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
