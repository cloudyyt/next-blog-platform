import Link from "next/link"
import { BookOpen, LayoutList, Library, NotebookPen } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { href: "/admin/life", label: "总览", icon: LayoutList },
  { href: "/admin/life/settings", label: "书籍设置", icon: BookOpen },
  { href: "/admin/life/sections", label: "章节结构", icon: Library },
  { href: "/admin/life/content", label: "内容库", icon: NotebookPen },
]

export function TreeholeAdminShell({
  active,
  title,
  description,
  actions,
  children,
}: {
  active: "overview" | "settings" | "sections" | "content"
  title: string
  description: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[.18em] text-primary">TREEHOLE BOOK</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>

      <nav className="flex flex-wrap gap-2 rounded-xl border bg-card p-2 shadow-soft">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = item.href === `/admin/life${active === "overview" ? "" : `/${active}`}`
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
