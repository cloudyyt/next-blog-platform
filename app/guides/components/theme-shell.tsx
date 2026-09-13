"use client"

import { useContext } from "react"
import { VisualThemeContext } from "@/components/providers/visual-theme-provider"
import { ThemeBackground } from "@/components/ui/theme-background"

/**
 * 书架页主题外壳（与 DocsShell 同构，去掉章节侧边栏）
 *
 * 职责：挂视觉主题背景 + data-visual-theme 属性 + 内容层容器。
 */
export function ThemeShell({ children }: { children: React.ReactNode }) {
  const ctx = useContext(VisualThemeContext)
  const theme = ctx?.theme ?? "cyber-neon"

  return (
    <div
      className="h-screen relative flex flex-col overflow-hidden"
      data-visual-theme={theme}
    >
      <ThemeBackground />
      <div className="theme-content relative flex flex-col h-full">
        {children}
      </div>
    </div>
  )
}
