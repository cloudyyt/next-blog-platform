"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/ui/image-uploader"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"
import { Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types/auth"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * 带 token 的 fetch（不走 authFetch，避免 401 硬跳 admin 登录页）
 */
async function authedFetch(url: string, init?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  })
  if (res.status === 401) {
    throw new Error("登录已过期，请重新登录")
  }
  return res
}

type TabKey = "profile" | "security"

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = React.useState<TabKey>("profile")

  // ── 资料 ──
  const [name, setName] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState<string>("")
  const [savingProfile, setSavingProfile] = React.useState(false)

  // ── 密码 ──
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [savingPassword, setSavingPassword] = React.useState(false)

  // 每次 open 时从最新 user 初始化 + 重置到资料 tab
  React.useEffect(() => {
    if (open && user) {
      setName(user.name)
      setBio(user.bio ?? "")
      setAvatarUrl(user.avatar ?? "")
      setTab("profile")
    }
  }, [open, user])

  // 资料是否有变化（决定保存按钮可用）
  const profileDirty =
    name.trim() !== (user?.name ?? "") || (bio || "") !== (user?.bio ?? "")

  // 密码即时校验
  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword
  const passwordReady =
    currentPassword.length >= 6 &&
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    !passwordMismatch

  const handleAvatarUploaded = (data: { url: string; [k: string]: unknown }) => {
    const nextUser = data.user as User | undefined
    if (nextUser) {
      updateUser(nextUser)
      setAvatarUrl(nextUser.avatar ?? "")
    } else {
      updateUser({ ...user!, avatar: data.url })
      setAvatarUrl(data.url)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSavingProfile(true)
    try {
      const payload: { name?: string; bio?: string } = {}
      if (name.trim() !== user.name) payload.name = name.trim()
      if ((bio || "") !== (user.bio ?? "")) payload.bio = bio

      if (Object.keys(payload).length === 0) {
        toast.info("资料没有变化")
        return
      }
      const res = await authedFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "保存失败")
      if (data.token) localStorage.setItem("token", data.token)
      updateUser(data.user)
      toast.success("资料已保存")
    } catch (err: any) {
      toast.error(err.message || "保存失败")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordMismatch) {
      toast.error("两次输入的新密码不一致")
      return
    }
    setSavingPassword(true)
    try {
      const res = await authedFetch("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "修改失败")
      toast.success("密码修改成功")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error(err.message || "修改失败")
    } finally {
      setSavingPassword(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[92vh] flex flex-col">
        {/* ── 头部：头像 + 名字 + 简介 ── */}
        <div className="relative px-6 pt-7 pb-5 border-b border-border/50">
          {/* 背景柔光 */}
          <div
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"
            aria-hidden
          />
          <div className="relative flex flex-col items-center text-center">
            <ImageUploader
              value={avatarUrl}
              onChange={() => {}}
              onUploaded={handleAvatarUploaded}
              endpoint="/api/auth/upload-avatar"
              folder="avatar"
              shape="circle"
              size={84}
              label=""
            />
            <h2 className="mt-3 text-lg font-bold font-display">{user.name}</h2>
            {user.bio ? (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 max-w-[16rem]">
                {user.bio}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground/60">
                还没有简介
              </p>
            )}
          </div>
        </div>

        {/* ── Tab 切换 ── */}
        <div className="flex border-b border-border/50">
          {(
            [
              { key: "profile" as const, label: "个人资料" },
              { key: "security" as const, label: "账号安全" },
            ]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors relative",
                tab === t.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab 内容 ── */}
        <div className="overflow-y-auto px-6 py-5">
          {tab === "profile" ? (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs text-muted-foreground">
                  昵称
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="h-10"
                />
                <p className="text-[11px] text-muted-foreground/70">
                  中文 / 英文 / 数字 / 下划线，2-20 字符，不可与已有用户重复
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs text-muted-foreground">
                  个人简介
                </Label>
                <Textarea
                  id="bio"
                  placeholder="介绍一下自己……"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                    {bio.length}/200
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={savingProfile || !profileDirty}
                className="w-full h-10"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    保存中…
                  </>
                ) : (
                  "保存资料"
                )}
              </Button>
              {!profileDirty && (
                <p className="text-center text-[11px] text-muted-foreground/60">
                  资料暂无变化
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="pd-current"
                  className="text-xs text-muted-foreground"
                >
                  当前密码
                </Label>
                <Input
                  id="pd-current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="输入当前密码"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pd-new" className="text-xs text-muted-foreground">
                  新密码
                </Label>
                <Input
                  id="pd-new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="至少 6 个字符"
                  className="h-10"
                />
                {/* 密码强度可视化 */}
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            newPassword.length >= 10
                              ? "bg-primary"
                              : newPassword.length >= 8
                                ? i < 2
                                  ? "bg-primary"
                                  : "bg-muted"
                                : newPassword.length >= 6
                                  ? i < 1
                                    ? "bg-primary"
                                    : "bg-muted"
                                  : "bg-muted",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground/70 tabular-nums w-10 text-right">
                      {newPassword.length >= 10
                        ? "强"
                        : newPassword.length >= 8
                          ? "中"
                          : newPassword.length >= 6
                            ? "弱"
                            : ""}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="pd-confirm"
                  className="text-xs text-muted-foreground"
                >
                  确认新密码
                </Label>
                <Input
                  id="pd-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
                  className={cn(
                    "h-10",
                    passwordMismatch && "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {passwordMismatch ? (
                  <p className="text-[11px] text-destructive">两次输入的密码不一致</p>
                ) : confirmPassword.length >= 6 && (
                  <p className="text-[11px] text-emerald-500 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    两次密码一致
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={savingPassword || !passwordReady}
                variant="outline"
                className="w-full h-10"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    修改中…
                  </>
                ) : (
                  "修改密码"
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
