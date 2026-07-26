"use client"

/**
 * Agent 指南系列配置表单
 *
 * 设计原则（原则 2.3）：
 * - 前端展示的每一个字段都有对应的 admin 入口
 * - 字段分组：基础信息 / SEO / 价值卡片 / 5 大阶段
 * - 5 大阶段（Q3 决策）：只允许编辑现有 5 个，不能加/删
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUploader } from "@/components/ui/image-uploader"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { toast } from "sonner"
import { authFetch } from "@/lib/admin-fetch"
import { GROUP_ICON_OPTIONS, type GuideSeriesConfig } from "@/lib/types/guide"

interface GuideSeriesConfigFormProps {
  initial: GuideSeriesConfig
}

export function GuideSeriesConfigForm({ initial }: GuideSeriesConfigFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [config, setConfig] = useState<GuideSeriesConfig>(initial)

  const update = <K extends keyof GuideSeriesConfig>(
    key: K,
    value: GuideSeriesConfig[K]
  ) => setConfig((prev) => ({ ...prev, [key]: value }))

  const updateGroup = <K extends keyof GuideSeriesConfig["groups"][number]>(
    index: number,
    key: K,
    value: GuideSeriesConfig["groups"][number][K]
  ) => {
    setConfig((prev) => {
      const groups = [...prev.groups]
      groups[index] = { ...groups[index], [key]: value }
      return { ...prev, groups }
    })
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      const res = await authFetch("/api/admin/guide/series-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message ?? "保存失败")
        setSubmitting(false)
        return
      }
      toast.success("系列配置已保存")
      router.push("/admin/guide")
    } catch (err) {
      console.error(err)
      toast.error("网络错误，保存失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/guide")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回章节列表
          </Button>
          <h1 className="text-2xl font-bold">系列设置</h1>
        </div>
        <Button onClick={handleSave} disabled={submitting}>
          <Save className="h-4 w-4 mr-2" />
          {submitting ? "保存中..." : "保存"}
        </Button>
      </div>

      {/* 1. 基础信息 */}
      <Section title="基础信息" desc="系列级的标题、副标题、封面、徽章、CTA">
        <Field label="系列标题" hint="首页 PostCard 标题 / /agent-guide Hero H1">
          <Input
            value={config.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="前端工程师转型 Agent 开发指南"
          />
        </Field>
        <Field label="系列副标题" hint="首页 PostCard excerpt / Hero 副标题">
          <Textarea
            value={config.subtitle ?? ""}
            onChange={(e) => update("subtitle", e.target.value || null)}
            placeholder="一份用前端工程师熟悉的概念作脚手架..."
            rows={3}
          />
        </Field>
        <Field
          label="系列封面"
          hint="为空时前端 fallback 到品牌渐变。上传图片到 OSS"
        >
          <ImageUploader
            folder="cover/guide"
            shape="square"
            aspect={16 / 9}
            value={config.coverImage ?? undefined}
            onChange={(url) => update("coverImage", url || null)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="徽章文案" hint="默认『连载中』">
            <Input
              value={config.badge}
              onChange={(e) => update("badge", e.target.value)}
            />
          </Field>
          <Field
            label="CTA 文案"
            hint="为空时前端用『从 {第一章} 开始』"
          >
            <Input
              value={config.cta ?? ""}
              onChange={(e) => update("cta", e.target.value || null)}
              placeholder="从 Phase 0 开始"
            />
          </Field>
        </div>
      </Section>

      {/* 2. SEO */}
      <Section
        title="SEO"
        desc="Open Graph 信息（缺省时前端用系列标题/副标题 fallback）"
      >
        <Field label="og:title">
          <Input
            value={config.ogTitle ?? ""}
            onChange={(e) => update("ogTitle", e.target.value || null)}
            placeholder="（默认用系列标题）"
          />
        </Field>
        <Field label="og:description">
          <Textarea
            value={config.ogDescription ?? ""}
            onChange={(e) => update("ogDescription", e.target.value || null)}
            rows={2}
            placeholder="（默认用副标题）"
          />
        </Field>
        <Field label="og:image">
          <ImageUploader
            folder="cover/guide"
            shape="square"
            aspect={16 / 9}
            value={config.ogImage ?? undefined}
            onChange={(url) => update("ogImage", url || null)}
          />
        </Field>
      </Section>

      {/* 3. 价值卡片 */}
      <Section
        title="价值卡片（首页 Hero 4 张事实卡片）"
        desc="卡片 3『已发布数』由系统自动计算，不需要配置"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="卡片 1 · 目标读者">
            <Input
              value={config.valueCard1 ?? ""}
              onChange={(e) => update("valueCard1", e.target.value || null)}
              placeholder="前端 / TS 工程师"
            />
          </Field>
          <Field label="卡片 2 · 技术栈">
            <Input
              value={config.valueCard2 ?? ""}
              onChange={(e) => update("valueCard2", e.target.value || null)}
              placeholder="Python · Qwen · 阿里云"
            />
          </Field>
          <Field label="卡片 4 · 阅读时长">
            <Input
              value={config.valueCard4 ?? ""}
              onChange={(e) => update("valueCard4", e.target.value || null)}
              placeholder="每章 20-30 分钟"
            />
          </Field>
        </div>
      </Section>

      {/* 4. 5 大阶段 */}
      <Section
        title="5 大学习阶段"
        desc="⚠️ 不允许加新阶段或删除现有阶段（决策 Q3），只能编辑 label/hint/icon/顺序"
      >
        <div className="space-y-2">
          {config.groups
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((group, idx) => {
              const originalIndex = config.groups.findIndex(
                (g) => g.key === group.key
              )
              return (
                <div
                  key={group.key}
                  className="grid grid-cols-[2rem_1fr_2fr_8rem_6rem] gap-2 items-start p-3 rounded-md border border-border/60 bg-background/40"
                >
                  <div className="text-xs text-muted-foreground/70 pt-2 text-right tabular-nums">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      名称
                    </Label>
                    <Input
                      value={group.label}
                      onChange={(e) =>
                        updateGroup(originalIndex, "label", e.target.value)
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      一句话说明
                    </Label>
                    <Input
                      value={group.hint}
                      onChange={(e) =>
                        updateGroup(originalIndex, "hint", e.target.value)
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      图标
                    </Label>
                    <Select
                      value={group.icon}
                      onValueChange={(v) =>
                        updateGroup(originalIndex, "icon", v)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GROUP_ICON_OPTIONS.map((ic) => (
                          <SelectItem key={ic} value={ic}>
                            {ic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      顺序
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={group.order}
                      onChange={(e) =>
                        updateGroup(
                          originalIndex,
                          "order",
                          Number(e.target.value)
                        )
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              )
            })}
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-2 flex items-center gap-1">
          <Eye className="w-3 h-3" />
          阶段数量固定为 5 个。如果真的需要加/删阶段，请联系开发做 DB migration。
        </p>
      </Section>
    </div>
  )
}

/** 单个 section 卡片 */
function Section({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/80 backdrop-blur-sm p-5">
      <div className="mb-4">
        <h2 className="text-base font-bold">{title}</h2>
        {desc && <p className="text-xs text-muted-foreground/70 mt-1">{desc}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

/** 单个字段（label + input + hint） */
function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}
