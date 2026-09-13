"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SidebarGroup } from "@/lib/types/guide"
import { DocsSidebar } from "./docs-sidebar"

/**
 * 书内主体：桌面两栏（sidebar + content）+ 移动端抽屉
 *
 * header / footer / 主题背景由外层 app/guides/layout.tsx 统一提供——
 * 书架页与系列页共用同一个 header（修复嵌套 layout 双 header）。
 */
export function DocsBody({
  children,
  sidebarData,
  basePath,
  storagePrefix,
}: {
  children: React.ReactNode
  sidebarData: SidebarGroup[]
  basePath: string
  storagePrefix: string
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex-1 overflow-hidden">
      <div className="container mx-auto px-4 h-full">
        <div className="flex h-full gap-6 py-6">
          {/* 桌面端 sidebar 常驻 */}
          <aside className="hidden lg:block w-60 flex-shrink-0 overflow-y-auto pb-8">
            <DocsSidebar
              data={sidebarData}
              basePath={basePath}
              storagePrefix={storagePrefix}
            />
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-8">
            {/* 移动端目录入口（桌面 sidebar 常驻，不需要） */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden sticky top-0 z-10 -mt-2 mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-background/90 backdrop-blur-sm text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
              目录
            </button>
            {children}
          </main>
        </div>
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
          drawerOpen ? "translate-x-0" : "-translate-x-full",
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
            basePath={basePath}
            storagePrefix={storagePrefix}
          />
        </div>
      </div>
    </div>
  )
}
