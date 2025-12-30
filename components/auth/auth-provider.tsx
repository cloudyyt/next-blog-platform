"use client"

import * as React from "react"
import { User } from "@/lib/types/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (name: string, password: string) => Promise<void>
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

  // 初始化：从 localStorage 读取用户信息
  React.useEffect(() => {
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
    
    setLoading(false)
  }, [])

  const login = async (name: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "登录失败")
    }

    const data = await response.json()
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    setUser(data.user)
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

    const data = await response.json()
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  const value = React.useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

