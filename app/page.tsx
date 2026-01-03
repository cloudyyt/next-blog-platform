import { redirect } from "next/navigation"

// 确保这是动态路由
export const dynamic = 'force-dynamic'

export default function Home() {
  // 根据环境变量判断是admin端口还是blog端口
  // 如果是admin端口（PORT=3001），重定向到/admin
  // 否则重定向到/blog
  const isAdminPort = process.env.PORT === "3001" || process.env.ADMIN_PORT === "true"
  
  if (isAdminPort) {
    redirect("/admin")
  } else {
    redirect("/blog")
  }
}

