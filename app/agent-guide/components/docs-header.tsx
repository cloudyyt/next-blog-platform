"use client"

import { Suspense, useContext } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { VisualThemeSelector } from "@/components/ui/visual-theme-selector"
import { VisualThemeContext } from "@/components/providers/visual-theme-provider"

/**
 * 文档站顶部 header
 * - 左：返回博客 + Docs 标识
 * - 右：完整主题切换器（与博客 header 一致）
 *
 * 注意：文档站有自己的 layout，不复用 blog layout，
 * 但视觉上保持同一套主题系统。
 */
export function DocsHeader({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const visualThemeContext = useContext(VisualThemeContext)
  const visualTheme = visualThemeContext?.theme ?? "cyber-neon"

  return (
    <header
      data-visual-theme={visualTheme}
      className="border-b backdrop-blur-sm bg-background/80 z-50 flex-shrink-0"
    >
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between gap-4">
          {/* 左侧：移动端汉堡 + 返回博客 + Docs 标识 */}
          <div className="flex items-center gap-3">
            {/* 移动端 sidebar 抽屉触发按钮 */}
            {onOpenSidebar && (
              <button
                onClick={onOpenSidebar}
                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                aria-label="打开章节导航"
              >
                <BookOpen className="w-5 h-5" />
              </button>
            )}

            <Link
              href="/blog"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent/50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">返回博客</span>
            </Link>

            <div className="h-5 w-px bg-border" />

            <Link
              href="/agent-guide"
              className="flex items-center gap-2 text-base sm:text-lg font-bold font-display hover:text-primary transition-colors"
            >
              <BookOpen className="w-5 h-5 text-primary" />
              <span>zijieLeo Docs</span>
            </Link>
          </div>

          {/* 右侧：主题切换器（与博客完全一致） */}
          <div className="flex items-center gap-2">
            <VisualThemeSelector />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
