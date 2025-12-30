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

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const redirectTo = searchParams.get("redirect") || "/blog"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("请填写完整信息")
      return
    }

    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }

    setLoading(true)
    try {
      await register(name.trim(), password)
      toast.success("注册成功")
      router.push(redirectTo)
    } catch (error: any) {
      toast.error(error.message || "注册失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">注册</h1>
          <p className="mt-2 text-muted-foreground">创建账号以发表评论</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">昵称</Label>
            <Input
              id="name"
              type="text"
              placeholder="2-20个字符，支持中文、英文、数字、下划线"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              minLength={2}
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              昵称将用于显示在评论中
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="至少6个字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
              maxLength={50}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">已有账号？</span>{" "}
          <Link
            href={`/blog/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="text-primary hover:underline"
          >
            立即登录
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <RegisterForm />
    </Suspense>
  )
}

