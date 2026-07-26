"use client"

/**
 * Agent 指南章节元信息子表单
 *
 * 在 GuideChapterEditor 右侧 sidebar 渲染。
 * 所有 GuideChapterInput 字段（除 title/slug/content）都在这里。
 */
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUploader } from "@/components/ui/image-uploader"
import {
  DEFAULT_GROUP_KEY_ORDER,
  DIFFICULTY_LABELS,
  type GuideChapterInput,
  type GuideGroupMeta,
  type GroupKey,
  type Difficulty,
} from "@/lib/types/guide"

interface GuideMetaEditorProps {
  value: Omit<GuideChapterInput, "title" | "slug" | "content">
  onChange: (next: Omit<GuideChapterInput, "title" | "slug" | "content">) => void
  /** 5 大阶段定义（由 server 查 GuideSeriesConfig 传入） */
  groups: GuideGroupMeta[]
}

export function GuideMetaEditor({ value, onChange, groups }: GuideMetaEditorProps) {
  const update = <K extends keyof typeof value>(
    key: K,
    v: (typeof value)[K]
  ) => onChange({ ...value, [key]: v })

  // 分组下拉显示顺序按 DEFAULT_GROUP_KEY_ORDER
  const groupOptions = DEFAULT_GROUP_KEY_ORDER.map((k) => {
    const meta = groups.find((g) => g.key === k)
    return { key: k, label: meta?.label ?? k }
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">章节元信息</h3>
        <p className="text-[11px] text-muted-foreground/70">
          这些字段决定章节在前端 /agent-guide 的展示
        </p>
      </div>

      {/* 分组 */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">所属阶段</Label>
        <Select
          value={value.group}
          onValueChange={(v) => update("group", v as GroupKey)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groupOptions.map((g) => (
              <SelectItem key={g.key} value={g.key}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 难度 */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">难度</Label>
        <Select
          value={value.difficulty}
          onValueChange={(v) => update("difficulty", v as Difficulty)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_LABELS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 排序 */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          分组内排序（小→大）
        </Label>
        <Input
          type="number"
          min={0}
          step={10}
          value={value.order}
          onChange={(e) => update("order", Number(e.target.value))}
          className="h-9"
        />
      </div>

      {/* 阅读时长 */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          预计阅读（分钟，留空自动估算）
        </Label>
        <Input
          type="number"
          min={1}
          value={value.readingTime ?? ""}
          onChange={(e) =>
            update(
              "readingTime",
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
          placeholder="自动"
          className="h-9"
        />
      </div>

      {/* 摘要 */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          摘要（sidebar tooltip / 总览页副标题）
        </Label>
        <textarea
          value={value.description ?? ""}
          onChange={(e) => update("description", e.target.value || null)}
          placeholder="一句话描述这一章在讲什么"
          rows={3}
          className="w-full text-sm bg-background rounded-md border border-input px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* OG image */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          章节 OG 图片（可选，留空 fallback 系列封面）
        </Label>
        <ImageUploader
          folder="cover/guide"
          shape="square"
          aspect={16 / 9}
          value={value.ogImage ?? undefined}
          onChange={(url) => update("ogImage", url || null)}
        />
      </div>

      {/* Coming Soon + Published 双开关 */}
      <div className="pt-3 border-t space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Coming Soon</div>
            <p className="text-[11px] text-muted-foreground/70 leading-snug">
              开启后 sidebar 灰显不可点
            </p>
          </div>
          <Switch
            checked={value.comingSoon}
            onCheckedChange={(v) => update("comingSoon", v)}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">已发布</div>
            <p className="text-[11px] text-muted-foreground/70 leading-snug">
              关闭后前端不可见（下架）
            </p>
          </div>
          <Switch
            checked={value.published}
            onCheckedChange={(v) => update("published", v)}
          />
        </div>

        {/* 状态组合提示 */}
        <StatusHint comingSoon={value.comingSoon} published={value.published} />
      </div>
    </div>
  )
}

/** 4 种组合的可视化提示（来自决策 Q6） */
function StatusHint({
  comingSoon,
  published,
}: {
  comingSoon: boolean
  published: boolean
}) {
  let label: string
  let cls: string
  if (comingSoon && published) {
    label = "当前：sidebar 灰显但已对读者可见（准备中）"
    cls = "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  } else if (comingSoon && !published) {
    label = "当前：草稿（前端完全看不到）"
    cls = "bg-muted text-muted-foreground"
  } else if (!comingSoon && published) {
    label = "当前：正常发布"
    cls = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  } else {
    label = "当前：草稿"
    cls = "bg-muted text-muted-foreground"
  }
  return (
    <div className={`text-[11px] px-2 py-1.5 rounded ${cls}`}>{label}</div>
  )
}
