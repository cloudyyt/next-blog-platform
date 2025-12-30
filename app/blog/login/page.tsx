"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import { Loading } from "@/components/ui/loading"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const redirectTo = searchParams.get("redirect") || "/blog"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !password.trim()) {
      toast.error("请填写完整信息")
      return
    }

    setLoading(true)
    try {
      await login(name.trim(), password)
      toast.success("登录成功")
      router.push(redirectTo)
    } catch (error: any) {
      toast.error(error.message || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">登录</h1>
          <p className="mt-2 text-muted-foreground">登录以发表评论</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">昵称</Label>
            <Input
              id="name"
              type="text"
              placeholder="请输入昵称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
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
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">还没有账号？</span>{" "}
          <Link
            href={`/blog/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="text-primary hover:underline"
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <LoginForm />
    </Suspense>
  )
}

