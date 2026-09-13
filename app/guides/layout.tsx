import { DocsHeader } from "./components/docs-header"
import { ThemeShell } from "./components/theme-shell"

/**
 * /guides 总 layout（书架 + 所有书共用）
 *
 * 统一提供：主题背景 + 唯一 header + footer。
 * 书架页 children 自带 main 滚动容器；
 * 系列页 children 是 DocsBody（sidebar 两栏，见 [series]/layout.tsx）。
 * 这样嵌套 layout 只有一个 header。
 */
export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeShell>
      {/* 全站唯一 header：品牌「zijieLeo Docs」点击回书架 */}
      <DocsHeader brandHref="/guides" />

      {children}

      <footer className="relative z-10 border-t border-border/40 bg-background/60 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground text-center">
          zijieLeo Docs · 我的电子书架
        </div>
      </footer>
    </ThemeShell>
  )
}
