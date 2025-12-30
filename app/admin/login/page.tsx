"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !password.trim()) {
      toast.error("请填写完整信息")
      return
    }

    setLoading(true)
    try {
      await login(name.trim(), password)
      // 验证是否为管理员
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role !== "admin") {
          toast.error("您没有管理员权限")
          return
        }
      }
      toast.success("登录成功")
      router.push("/admin")
    } catch (error: any) {
      toast.error(error.message || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">管理后台登录</CardTitle>
          <CardDescription className="text-center">
            使用您的管理员账号登录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">用户名</Label>
              <Input
                id="name"
                type="text"
                placeholder="请输入用户名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

