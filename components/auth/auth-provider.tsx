"use client"

import * as React from "react"
import { User } from "@/lib/types/auth"

interface LoginResponse {
  user: User
  token: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (name: string, password: string) => Promise<LoginResponse>
  completeLogin: (data: LoginResponse) => void
  register: (name: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const userStr = localStorage.getItem("user")

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr)
          setUser(userData)
        } catch (error) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
    } catch (error) {
      console.warn("Failed to access localStorage:", error)
    }

    setLoading(false)
  }, [])

  const persistSession = (data: LoginResponse) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
      } catch (error) {
        console.warn("Failed to save to localStorage:", error)
      }
    }
    setUser(data.user)
  }

  const login = async (name: string, password: string): Promise<LoginResponse> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "登录失败")
    }

    const data: LoginResponse = await response.json()
    persistSession(data)
    return data
  }

  const completeLogin = (data: LoginResponse) => {
    persistSession(data)
  }

  const register = async (name: string, password: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "注册失败")
    }

    const data: LoginResponse = await response.json()
    persistSession(data)
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      } catch (error) {
        console.warn("Failed to remove from localStorage:", error)
      }
    }
    setUser(null)
  }

  const value = React.useMemo(
    () => ({
      user,
      loading,
      login,
      completeLogin,
      register,
      logout,
      isAuthenticated: !!user,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
