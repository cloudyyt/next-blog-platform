import Link from "next/link"
import { BookOpen, ExternalLink, FileText, Library, NotebookPen } from "lucide-react"
import { TreeholeAdminShell } from "@/components/admin/treehole/treehole-admin-shell"
import { elementLabel } from "@/components/admin/treehole/types"
import { getTreeholeAdminData } from "@/lib/treehole/admin-data"

export const dynamic = "force-dynamic"

export default async function AdminTreeholeOverviewPage() {
  const { config, sections } = await getTreeholeAdminData()
  const entries = sections.flatMap((section) => section.entries)
  const articles = entries.filter((entry) => entry.kind === "article")
  const notes = entries.filter((entry) => entry.kind === "note")
  const drafts = entries.filter((entry) => !entry.published)

  const cards = [
    {
      href: "/admin/life/settings",
      icon: BookOpen,
      title: "书籍设置",
      description: "书名、作者、简介、封面风格与默认阅读入口。",
    },
    {
      href: "/admin/life/sections",
      icon: Library,
      title: "章节结构",
      description: "维护二级标题、元素、情感基调、排序和待写篇目。",
    },
    {
      href: "/admin/life/content",
      icon: NotebookPen,
      title: "内容库",
      description: "管理正式文章与短记插页，支持筛选、排序和发布状态。",
    },
  ]

  return (
    <TreeholeAdminShell
      active="overview"
      title="树洞电子书"
      description="把配置、结构和内容分开管理；每一块只做一件事，减少互相干扰。"
      actions={
        <Link
          href="/treehole"
          target="_blank"
          className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-secondary"
        >
          <ExternalLink className="h-4 w-4" /> 预览前台
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-xl border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold group-hover:text-primary">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">章节概览</h2>
            <Link href="/admin/life/sections" className="text-sm text-primary hover:underline">
              管理结构
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center gap-3 rounded-lg border bg-background/60 px-4 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                  {elementLabel(section.element)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{section.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{section.tone}</p>
                </div>
                <span className="text-xs text-muted-foreground">{section.entries.length} 条</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold">当前书况</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">书名</dt>
                <dd className="max-w-[60%] truncate text-right font-medium">{config.title}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">章节</dt>
                <dd>{sections.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> 正式文章
                </dt>
                <dd>{articles.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">短记插页</dt>
                <dd>{notes.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">未发布草稿</dt>
                <dd>{drafts.length}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-dashed bg-background/60 p-6">
            <h2 className="text-sm font-semibold">推荐流程</h2>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>1. 先在章节结构里调整书的骨架</li>
              <li>2. 再到内容库写正式文章或短记</li>
              <li>3. 最后回书籍设置微调入口与封面</li>
            </ol>
          </section>
        </aside>
      </div>
    </TreeholeAdminShell>
  )
}
