import { redirect } from "next/navigation"

// 确保这是动态路由
export const dynamic = 'force-dynamic'

export default function Home() {
  // 在 Vercel 上（包括预览和生产环境），重定向到 /blog
  // 在本地开发时，可以通过环境变量控制重定向到 /admin
  const isAdminPort = 
    !process.env.VERCEL && (
      process.env.PORT === "3001" || 
      process.env.ADMIN_PORT === "true"
    )
  
  if (isAdminPort) {
    redirect("/admin")
  } else {
    // 默认重定向到博客主页（包括所有 Vercel 环境）
    redirect("/blog")
  }
}

