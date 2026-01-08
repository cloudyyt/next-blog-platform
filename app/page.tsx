import { redirect } from "next/navigation"

// 确保这是动态路由
export const dynamic = 'force-dynamic'

export default function Home() {
  // 备用重定向方案（如果 next.config.js 中的重定向不工作）
  // 在本地开发时，可以通过环境变量控制重定向到 /admin
  // 在 Vercel 生产环境，默认重定向到 /blog
  const isAdminPort = 
    !process.env.VERCEL && (
      process.env.PORT === "3001" || 
      process.env.ADMIN_PORT === "true"
    )
  
  if (isAdminPort) {
    redirect("/admin")
  } else {
    // 默认重定向到博客主页
    redirect("/blog")
  }
}

