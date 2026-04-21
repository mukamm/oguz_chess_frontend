const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export const api = {
  // --- Токены ---
  getToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
  getWsToken: () => localStorage.getItem("access_token") ?? "",
  setTokens: (access: string, refresh?: string) => {
    localStorage.setItem("access_token", access)
    if (refresh) localStorage.setItem("refresh_token", refresh)
  },
  clearTokens: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  },

  // --- Refresh ---
  refresh: async (): Promise<boolean> => {
    const refreshToken = api.getRefreshToken()
    if (!refreshToken) return false

    try {
      const res = await fetch(`${API_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!res.ok) { api.clearTokens(); return false }

      const data = await res.json()
      // Бэкенд /refresh возвращает ТОЛЬКО access_token, refresh остаётся прежним
      api.setTokens(data.access_token)
      return true
    } catch {
      api.clearTokens()
      return false
    }
  },

  // --- Базовый fetch с авто-refresh при 401 ---
  fetch: async (path: string, options: RequestInit = {}) => {
    const token = api.getToken()
    const makeHeaders = (t: string | null) => ({
      "Content-Type": "application/json",
      accept: "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...options.headers,
    })

    const res = await fetch(`${API_URL}${path}`, { ...options, headers: makeHeaders(token) })

    if (res.status === 401) {
      const refreshed = await api.refresh()
      if (!refreshed) return res
      return fetch(`${API_URL}${path}`, { ...options, headers: makeHeaders(api.getToken()) })
    }
    return res
  },

  // --- Auth ---
  login: async (username: string, password: string) => {
    const res = await api.fetch("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error("Login failed")
    const data = await res.json()
    api.setTokens(data.access_token, data.refresh_token)
    return data
  },

  register: async (username: string, email: string, password: string) => {
    const res = await api.fetch("/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || "Registration failed")
    return data
  },

  logout: async () => {
    await api.fetch("/logout", { method: "POST" })
    api.clearTokens()
    window.location.href = "/"
  },

  // --- User ---
  getMe: async () => {
    const res = await api.fetch("/me")
    if (!res.ok) return null
    return res.json()
  },

  getMyGames: async (limit = 10) => {
    const res = await api.fetch(`/games/me?limit=${limit}`)
    if (!res.ok) return []
    return res.json()
  },

  // --- Games ---
  createChessGame: async (opponentId?: number) => {
    const res = await api.fetch("/chess/create", {
      method: "POST",
      body: JSON.stringify({ black_player_id: opponentId ?? null }),
    })
    if (!res.ok) return null
    return res.json()
  },

  createAiGame: async () => {
    const res = await api.fetch("/chess/ai/create", { method: "POST" })
    if (!res.ok) return null
    return res.json()
  },

  // Возвращает { id, fen, status, winner: "player"|"ai"|"draw"|null }
  makeAiMove: async (gameId: number, uciMove: string, difficulty: string) => {
    const res = await api.fetch(
      `/chess/ai/${gameId}/move?uci_move=${encodeURIComponent(uciMove)}&difficulty=${difficulty}`,
      { method: "POST" }
    )
    if (!res.ok) return null
    return res.json()
  },

  // --- Lobby ---
  getLobbyPlayers: async () => {
    const res = await api.fetch("/lobby/players")
    if (!res.ok) return []
    return res.json()
  },

  lobbyHeartbeat: async () => {
    await api.fetch("/lobby/heartbeat", { method: "POST" })
  },
  
  makeNeuralMove: async (gameId: number, uciMove: string, difficulty: string) => {
    const res = await api.fetch(
      `/chess/neural/${gameId}/move?uci_move=${encodeURIComponent(uciMove)}&difficulty=${difficulty}`,
      { method: "POST" }
    )
    if (!res.ok) return null
    return res.json()
  },
}