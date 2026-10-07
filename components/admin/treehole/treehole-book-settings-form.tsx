"use client"

import { useState } from "react"
import { ExternalLink, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { authFetch } from "@/lib/admin-fetch"
import type { TreeholeAdminConfig } from "./types"

export function TreeholeBookSettingsForm({ initialConfig }: { initialConfig: TreeholeAdminConfig }) {
  const [config, setConfig] = useState(initialConfig)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await authFetch("/api/admin/treehole/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.message || "保存失败")
        return
      }
      toast.success("书籍设置已保存")
    } catch {
      toast.error("网络错误")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="rounded-xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">基础信息</h2>
          <p className="mt-1 text-sm text-muted-foreground">这些内容会出现在封面入口和目录页。</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="book-title">书名</Label>
              <Input
                id="book-title"
                value={config.title}
                onChange={(event) => setConfig({ ...config, title: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="book-author">作者</Label>
              <Input
                id="book-author"
                value={config.author}
                onChange={(event) => setConfig({ ...config, author: event.target.value })}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="book-subtitle">主题</Label>
              <Input
                id="book-subtitle"
                value={config.subtitle}
                onChange={(event) => setConfig({ ...config, subtitle: event.target.value })}
                placeholder="风与云"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="book-description">书籍简介</Label>
              <Textarea
                id="book-description"
                rows={5}
                value={config.description}
                onChange={(event) => setConfig({ ...config, description: event.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">阅读入口</h2>
          <p className="mt-1 text-sm text-muted-foreground">控制读者进入树洞时首先看到的界面。</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>默认视图</Label>
              <Select value={config.defaultView} onValueChange={(value) => setConfig({ ...config, defaultView: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">封面入口</SelectItem>
                  <SelectItem value="toc">直接目录</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>封面风格</Label>
              <Select value={config.coverStyle} onValueChange={(value) => setConfig({ ...config, coverStyle: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wind-cloud">风与云</SelectItem>
                  <SelectItem value="four-seasons">四季</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border bg-card p-5 shadow-soft">
          <h3 className="text-sm font-semibold">操作</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            保存后前台缓存会立即刷新。可以先去预览，再回来微调。
          </p>
          <Button className="mt-4 w-full" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            保存设置
          </Button>
          <Button variant="outline" className="mt-2 w-full" asChild>
            <a href="/treehole" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" /> 预览前台
            </a>
          </Button>
        </div>

        <div className="rounded-xl border border-dashed bg-background/60 p-5">
          <h3 className="text-sm font-semibold">当前状态</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">默认视图</dt>
              <dd>{config.defaultView === "toc" ? "直接目录" : "封面入口"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">封面风格</dt>
              <dd>{config.coverStyle === "four-seasons" ? "四季" : "风与云"}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  )
}
