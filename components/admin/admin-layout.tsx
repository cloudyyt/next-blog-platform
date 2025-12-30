"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { 
  LayoutDashboard, 
  FileText, 
  Tag, 
  FolderTree, 
  Users, 
  MessageSquare,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { toast } from "sonner"

const navigation = [
  { name: "仪表盘", href: "/admin", icon: LayoutDashboard },
  { name: "文章管理", href: "/admin/posts", icon: FileText },
  { name: "评论管理", href: "/admin/comments", icon: MessageSquare },
  { name: "分类管理", href: "/admin/categories", icon: FolderTree },
  { name: "标签管理", href: "/admin/tags", icon: Tag },
  { name: "用户管理", href: "/admin/users", icon: Users },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isAuthenticated, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 如果是登录页面，不执行权限检查
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    // 登录页面不需要权限检查
    if (isLoginPage) return
    
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/admin/login")
    }
  }, [loading, isAuthenticated, user, router, isLoginPage])

  const handleLogout = () => {
    logout()
    toast.success("退出登录成功")
    router.push("/admin/login")
  }

  // 如果是登录页面，直接渲染children，不显示侧边栏等
  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 移动端顶部栏 */}
      <div className="lg:hidden border-b bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">管理后台</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* 侧边栏 */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b">
              <h2 className="text-xl font-bold">管理后台</h2>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* 底部用户信息 */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">管理员</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </aside>

        {/* 遮罩层（移动端） */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 顶部栏 */}
          <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b">
            <div className="flex items-center justify-between px-6 h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold hidden lg:block">
                  {navigation.find((item) => item.href === pathname)?.name || "管理后台"}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{user?.name}</span>
                </div>
              </div>
            </div>
          </header>

          {/* 内容区域 */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

