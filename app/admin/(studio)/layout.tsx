"use client"

/**
 * 写作区布局（独立于管理后台框架）
 *
 * - 路由组 (studio) 让写作页脱离 (dashboard) 侧边栏，URL 保持不变
 * - 本层只做 admin 鉴权守卫（页面级 UX 防线，API 层仍是最终权限边界）
 * - 视觉世界由各编辑器自带：
 *   · 博文编辑器（writing-studio）→ 科技简约，随全站明暗主题
 *   · 树洞编辑器（life-writing-studio）→ 人文书房纸感 + 手写字体
 */
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PenLine } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/admin/login")
    }
  }, [loading, isAuthenticated, user, router])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {loading ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <PenLine className="h-7 w-7 animate-pulse text-primary/70" />
          <p className="text-sm tracking-widest text-muted-foreground">
            正在打开写作台……
          </p>
        </div>
      ) : !isAuthenticated || user?.role !== "admin" ? null : (
        children
      )}
    </div>
  )
}
