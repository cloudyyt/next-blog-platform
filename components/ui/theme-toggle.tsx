"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { VisualThemeContext } from "@/components/providers/visual-theme-provider"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const visualTheme = React.useContext(VisualThemeContext)?.theme
  const [mounted, setMounted] = React.useState(false)

  // 避免 hydration 不匹配
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // cyber-neon 恒为深色（provider 已强制锁夜间），明暗切换无意义 → 隐藏，避免假开关
  if (mounted && visualTheme === "cyber-neon") {
    return null
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">切换主题</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">切换主题</span>
    </Button>
  )
}

