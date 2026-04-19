"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n"
import { Crown, Menu, X, LogOut, LayoutDashboard, Users, Swords, Bot, History, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { useUser } from "@/hooks/use-user"
import { useNotifications } from "@/hooks/use-notifications"

interface HeaderProps {
  showAuthButtons?: boolean
  isLoggedIn?: boolean
}

const dashboardLinks = [
  { href: "/lobby",   label: "Game Lobby",   icon: Users    },
  { href: "/play",    label: "Play Now",      icon: Swords   },
  { href: "/ai",      label: "Play vs AI",    icon: Bot      },
  { href: "/history", label: "Game History",  icon: History  },
]

export function Header({ showAuthButtons = true }: HeaderProps) {

  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false)
  const [dashboardOpen, setDashboardOpen]       = useState(false)
  const [mobileDashOpen, setMobileDashOpen]     = useState(false)
  const [isLoggedIn, setIsLoggedIn]             = useState(false)
  const { t }    = useI18n()
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useUser()
  useNotifications(user?.id ?? 0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) setIsLoggedIn(true)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDashboardOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const navLinks = [
    { href: "/",       label: t("home")    },
    { href: "/about",  label: t("about")   },
    { href: "/contact",label: t("contact") },
  ]


  const handleLogout = async () => {
    await api.logout()
    setMobileMenuOpen(false)
    router.push("/")
  }
  const isDashboardActive =
    pathname === "/dashboard" ||
    dashboardLinks.some((l) => pathname === l.href)

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground">Oguz Chess</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-foreground bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Dashboard dropdown (desktop) */}
          {isLoggedIn && (
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setDashboardOpen(true)}
              onMouseLeave={() => setDashboardOpen(false)}
            >
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isDashboardActive
                    ? "text-foreground bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    dashboardOpen && "rotate-180"
                  )}
                />
              </Link>

              {/* Dropdown panel */}
              <div
                className={cn(
                  "absolute left-0 top-full pt-1 transition-all duration-200 origin-top",
                  dashboardOpen
                    ? "opacity-100 scale-y-100 pointer-events-auto"
                    : "opacity-0 scale-y-95 pointer-events-none"
                )}
              >
                <div className="bg-card border border-border rounded-lg shadow-lg py-1 min-w-[170px]">
                  {dashboardLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors",
                        pathname === href
                          ? "text-foreground bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      onClick={() => setDashboardOpen(false)}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t("logout")}
            </Button>
          ) : showAuthButtons ? (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  {t("signIn")}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t("getStarted")}
                </Button>
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[32rem] border-t border-border" : "max-h-0"
        )}
      >
        <nav className="px-4 py-4 space-y-1 bg-card">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-foreground bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Dashboard accordion (mobile) */}
          {isLoggedIn && (
            <div>
              <button
                onClick={() => setMobileDashOpen(!mobileDashOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isDashboardActive
                    ? "text-foreground bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    mobileDashOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  mobileDashOpen ? "max-h-60" : "max-h-0"
                )}
              >
                <div className="pl-4 mt-1 space-y-1">
                  {dashboardLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        pathname === href
                          ? "text-foreground bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-border space-y-2">
            {isLoggedIn ? (
              <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                {t("logout")}
              </Button>
            ) : showAuthButtons ? (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t("signIn")}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {t("getStarted")}
                  </Button>
                </Link>
              </>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  )
}