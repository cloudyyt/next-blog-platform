"use client"

import * as React from "react"
import { VisualTheme, defaultVisualTheme, detectDevicePerformance, visualThemes } from "@/lib/themes"

interface VisualThemeContextType {
  theme: VisualTheme
  setTheme: (theme: VisualTheme) => void
  performance: "high" | "medium" | "low"
  useSimplified: boolean
}

export const VisualThemeContext = React.createContext<VisualThemeContextType | undefined>(undefined)

export function useVisualTheme() {
  const context = React.useContext(VisualThemeContext)
  if (!context) {
    throw new Error("useVisualTheme must be used within VisualThemeProvider")
  }
  return context
}

interface VisualThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: VisualTheme
}

export function VisualThemeProvider({
  children,
  defaultTheme = defaultVisualTheme,
}: VisualThemeProviderProps) {
  const [theme, setThemeState] = React.useState<VisualTheme>(defaultTheme)
  const [performance, setPerformance] = React.useState<"high" | "medium" | "low">("medium")
  const [mounted, setMounted] = React.useState(false)

  // 初始化：从 localStorage 读取主题，检测性能
  React.useEffect(() => {
    setMounted(true)

    // 读取保存的主题
    const savedTheme = localStorage.getItem("visual-theme") as VisualTheme | null
    if (savedTheme && Object.keys(visualThemes).includes(savedTheme)) {
      setThemeState(savedTheme)
    }

    // 检测设备性能
    const perf = detectDevicePerformance()
    setPerformance(perf)
  }, [])

  // 保存主题到 localStorage
  const setTheme = React.useCallback((newTheme: VisualTheme) => {
    setThemeState(newTheme)
    localStorage.setItem("visual-theme", newTheme)
  }, [])

  // 更新 body 的 data 属性，用于 CSS 选择器
  React.useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-visual-theme", theme)
    }
  }, [theme, mounted])

  // 判断是否使用简化效果
  const useSimplified = React.useMemo(() => {
    if (typeof window === "undefined") return false
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return true
    if (performance === "low") return true
    if (performance === "medium") {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      return isMobile
    }
    return false
  }, [performance])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      performance,
      useSimplified,
    }),
    [theme, setTheme, performance, useSimplified]
  )

  // 即使在未 mounted 时也提供 Context，避免组件报错
  // 使用默认值，mounted 后会更新为实际值
  const defaultValue = React.useMemo(
    () => ({
      theme: defaultTheme,
      setTheme: () => {}, // 占位函数，mounted 后会替换
      performance: "medium" as const,
      useSimplified: false,
    }),
    [defaultTheme]
  )

  return (
    <VisualThemeContext.Provider value={mounted ? value : defaultValue}>
      {children}
    </VisualThemeContext.Provider>
  )
}

