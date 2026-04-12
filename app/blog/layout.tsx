"use client"

import { Suspense, useContext } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { VisualThemeSelector } from "@/components/ui/visual-theme-selector"
import { ThemeBackground } from "@/components/ui/theme-background"
import { useAuth } from "@/components/auth/auth-provider"
import { VisualThemeContext } from "@/components/providers/visual-theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, LogOut, Rss, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { SearchInput } from "@/components/blog/search-input"

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, logout, loading } = useAuth()
  const visualThemeContext = useContext(VisualThemeContext)
  const visualTheme = visualThemeContext?.theme ?? "cyber-neon"

  const handleLogout = () => {
    logout()
    toast.success("已退出登录")
    router.push("/blog")
  }

  return (
    <div
      className="h-screen relative flex flex-col overflow-hidden"
      data-visual-theme={visualTheme}
    >
      {/* 视觉主题背景 */}
      <ThemeBackground />
      
      {/* 内容层 */}
      <div className="theme-content relative flex flex-col h-full">
        {/* 固定Header */}
        <header className="border-b backdrop-blur-sm bg-background/80 z-50 flex-shrink-0">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <a href="/blog" className="text-xl font-bold font-display">
                大胖天的树洞
              </a>
              <div className="flex items-center gap-2 sm:gap-4">
                <a
                  href="/blog"
                  className="text-sm sm:text-base hover:text-primary transition-colors duration-200 px-2 py-1 rounded-md hover:bg-accent/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  首页
                </a>
                <a
                  href="/blog/about"
                  className="text-sm sm:text-base hover:text-primary transition-colors duration-200 px-2 py-1 rounded-md hover:bg-accent/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hidden sm:inline-block"
                >
                  关于
                </a>
                <Suspense fallback={<div className="w-36 sm:w-44 h-9" />}>
                  <SearchInput />
                </Suspense>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{user?.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {user?.name}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        退出登录
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <a
                    href="/blog/login"
                    className="text-sm sm:text-base hover:text-primary transition-colors duration-200 px-2 py-1 rounded-md hover:bg-accent/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    登录
                  </a>
                )}
                <VisualThemeSelector />
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </header>
        
        {/* 可滚动的主内容区 */}
        <main className="relative z-10 flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-sm flex-shrink-0">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>&copy; {new Date().getFullYear()} 大胖天的树洞</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/blog/about"
                  className="hover:text-primary transition-colors duration-200 cursor-pointer"
                >
                  关于
                </a>
                <a
                  href="/blog/feed.xml"
                  className="hover:text-primary transition-colors duration-200 cursor-pointer inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Rss className="w-3.5 h-3.5" />
                  RSS
                </a>
                <a
                  href="/blog/sitemap.xml"
                  className="hover:text-primary transition-colors duration-200 cursor-pointer"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sitemap
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

