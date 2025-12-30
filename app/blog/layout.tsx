"use client"

import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { VisualThemeSelector } from "@/components/ui/visual-theme-selector"
import { ThemeBackground } from "@/components/ui/theme-background"
import { useAuth } from "@/components/auth/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, logout, loading } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success("已退出登录")
    router.push("/blog")
  }

  return (
    <div className="h-screen relative flex flex-col overflow-hidden">
      {/* 视觉主题背景 */}
      <ThemeBackground />
      
      {/* 内容层 */}
      <div className="theme-content relative flex flex-col h-full">
        {/* 固定Header */}
        <header className="border-b backdrop-blur-sm bg-background/80 z-50 flex-shrink-0">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <a href="/blog" className="text-xl font-bold">
                {loading ? (
                  "大胖天的树洞"
                ) : isAuthenticated && user ? (
                  <span>
                    您好，<span className="text-primary">{user.name}</span>，欢迎来到大胖天的树洞
                  </span>
                ) : (
                  "大胖天的树洞"
                )}
              </a>
              <div className="flex items-center gap-2 sm:gap-4">
                <a 
                  href="/blog" 
                  className="text-sm sm:text-base hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-accent/50"
                >
                  首页
                </a>
                <a 
                  href="/blog/about" 
                  className="text-sm sm:text-base hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-accent/50 hidden sm:inline-block"
                >
                  关于
                </a>
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
                    className="text-sm sm:text-base hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-accent/50"
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
      </div>
    </div>
  )
}

