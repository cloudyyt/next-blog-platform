import { TreePine } from "lucide-react"
import { DocsHeader } from "@/app/guides/components/docs-header"
import { ThemeShell } from "@/app/guides/components/theme-shell"

/**
 * /treehole 树洞（生活区）layout
 *
 * 独立于书架的轻站点：同主题系统 + 同款 header（品牌「树洞」），
 * 无章节侧边栏——杂志式浏览流。
 */
export default function TreeholeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeShell>
      <DocsHeader
        brandHref="/treehole"
        brandText="树洞"
        brandIcon={<TreePine className="w-5 h-5 text-primary" />}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 sm:py-12">{children}</div>
      </main>

      <footer className="relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground text-center">
          zijieLeo 的树洞 · 技术之外，所见所闻所感
        </div>
      </footer>
    </ThemeShell>
  )
}
