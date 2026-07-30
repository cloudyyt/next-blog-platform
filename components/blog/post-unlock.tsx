"use client"

import * as React from "react"
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostContent } from "@/components/blog/post-content"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface PostUnlockProps {
  slug: string
  /** 标题，用于解锁后的正文回显标题（可选） */
  title?: string
}

/**
 * 加密文章解锁组件
 *
 * 进入加密文章详情页时，正文不下发到客户端，由此组件代替渲染：
 * - 输入密码 → POST /api/blog/decrypt/[slug] 校验
 * - 正确 → 拿到 content，渲染正文
 * - 错误 → 输入框下方就近反馈
 *
 * UX（遵循 ui-ux-pro-max）：
 * - 密码显隐切换（Password Visibility）
 * - 错误就近明确反馈（Error Feedback）
 * - 校验中 loading 态 + 按钮禁用（Loading States）
 */
export function PostUnlock({ slug }: PostUnlockProps) {
  const [password, setPassword] = React.useState("")
  const [show, setShow] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [content, setContent] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError("请输入密码")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/blog/decrypt/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "密码错误")
        return
      }
      setContent(data.content)
      toast.success("已解锁")
    } catch {
      setError("网络错误，请重试")
    } finally {
      setLoading(false)
    }
  }

  // 已解锁 → 渲染正文
  if (content !== null) {
    return (
      <div className="prose prose-lg max-w-none">
        <PostContent content={content} />
      </div>
    )
  }

  // 未解锁 → 密码输入卡
  return (
    <div className="not-prose flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-8 text-center shadow-soft">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold font-display mb-1.5">这篇内容已加密</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          输入密码即可阅读全文
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError(null)
              }}
              placeholder="输入密码"
              autoFocus
              disabled={loading}
              className={cn(
                "h-11 pr-11",
                error && "border-destructive focus-visible:ring-destructive",
              )}
              aria-label="文章密码"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={show ? "隐藏密码" : "显示密码"}
              tabIndex={-1}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <span aria-hidden>⚠</span>
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !password}
            className="w-full h-11"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                解锁中…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                解锁阅读
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
