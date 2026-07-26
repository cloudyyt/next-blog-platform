"use client"

import { useState, useContext } from "react"
import { X } from "lucide-react"
import { VisualThemeContext } from "@/components/providers/visual-theme-provider"
import { ThemeBackground } from "@/components/ui/theme-background"
import { cn } from "@/lib/utils"
import type { SidebarGroup } from "@/lib/types/guide"
import { DocsHeader } from "./docs-header"
import { DocsSidebar } from "./docs-sidebar"

/**
 * 文档站整体外壳（client 组件，管理移动端 sidebar 抽屉状态）
 *
 * 结构：
 * ┌─────────────────────────────────────────────┐
 * │  DocsHeader (含返回博客 + 主题切换)          │
 * ├──────────┬──────────────────────────────────┤
 * │          │                                  │
 * │ Sidebar  │   {children}                     │
 * │ (常驻)   │   （页面自己决定是否带右侧 TOC）  │
 * │          │                                  │
 * └──────────┴──────────────────────────────────┘
 */
export function DocsShell({
  children,
  sidebarData,
}: {
  children: React.ReactNode
  sidebarData: SidebarGroup[]
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const visualThemeContext = useContext(VisualThemeContext)
  const visualTheme = visualThemeContext?.theme ?? "cyber-neon"

  return (
    <div
      className="h-screen relative flex flex-col overflow-hidden"
      data-visual-theme={visualTheme}
    >
      {/* 视觉主题背景 */}
      <ThemeBackground />

      {/* 内容层 */}
      <div className="theme-content relative flex flex-col h-full">
        {/* Header */}
        <DocsHeader onOpenSidebar={() => setDrawerOpen(true)} />

        {/* 主体：桌面端两栏（sidebar + content），移动端只有 content */}
        <div className="flex-1 overflow-hidden">
          <div className="container mx-auto px-4 h-full">
            <div className="flex h-full gap-6 py-6">
              {/* 桌面端 sidebar 常驻 */}
              <aside className="hidden lg:block w-60 flex-shrink-0 overflow-y-auto pb-8">
                <DocsSidebar data={sidebarData} />
              </aside>

              {/* 主内容区 */}
              <main className="flex-1 min-w-0 overflow-y-auto pb-8">
                {children}
              </main>
            </div>
          </div>
        </div>

        {/* Footer（精简版） */}
        <footer className="relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-sm flex-shrink-0">
          <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground text-center">
            zijieLeo Docs · 前端工程师的 Agent 开发指南
          </div>
        </footer>
      </div>

      {/* 移动端 sidebar 抽屉（覆盖层） */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[80vw]",
          "bg-background border-r border-border/60 shadow-xl",
          "transition-transform duration-300 ease-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 抽屉头部 */}
        <div className="sticky top-0 bg-background flex items-center justify-between px-4 py-3 border-b border-border/40">
          <span className="font-semibold font-display">章节导航</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 -mr-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label="关闭导航"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* 抽屉内容 */}
        <div className="overflow-y-auto p-4 h-[calc(100%-3.5rem)]">
          <DocsSidebar
            data={sidebarData}
            onNavigate={() => setDrawerOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}
