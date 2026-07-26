/**
 * App Router 根页面（必须存在）
 * Next.js 13+ 使用 App Router 时，app/page.tsx 为必需文件。
 * 根路径 / 重定向到 /blog。
 */
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default function HomePage() {
  // 本地管理员端口：重定向到 /admin（通过 PORT 或 ADMIN_PORT 环境变量识别）
  const isAdminPort =
    process.env.PORT === "3001" || process.env.ADMIN_PORT === "true"

  if (isAdminPort) {
    redirect("/admin")
  }

  // 其他情况：重定向到博客首页
  redirect("/blog")
}

