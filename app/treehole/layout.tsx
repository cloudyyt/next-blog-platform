import Link from "next/link"
import { TreePine } from "lucide-react"
import "lxgw-wenkai-webfont/style.css"

/**
 * /treehole 树洞电子书世界。
 * 与书房同源的暖纸质感，但入口是一册「生活书」，不再使用全站视觉主题。
 */
export default function TreeholeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="study-scope flex h-screen flex-col overflow-hidden bg-background text-foreground"
      style={{ colorScheme: "light" }}
    >
      <header className="z-40 flex h-12 shrink-0 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-sm">
        <Link
          href="/blog"
          className="rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          ← 博客
        </Link>
        <Link
          href="/treehole"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-handwriting text-lg font-bold transition hover:text-primary"
        >
          <TreePine className="h-4 w-4 text-primary" />
          树洞
        </Link>
        <span aria-hidden className="w-[64px]" />
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(120,90,40,.05) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(140% 90% at 50% -10%, rgba(255,248,230,.55), transparent 55%), radial-gradient(120% 60% at 50% 115%, rgba(90,60,25,.10), transparent 60%)",
          }}
        />
        <main
          data-treehole-scroll
          className="relative flex-1 overflow-y-auto"
        >
          {children}
        </main>

        <footer className="relative z-10 flex shrink-0 items-center justify-center border-t border-border/50 bg-background/70 py-3 backdrop-blur-sm">
          <p className="font-handwriting text-xs tracking-wide text-muted-foreground">
            zijieLeo 的树洞 · 因为这就是你的人生
          </p>
        </footer>
      </div>
    </div>
  )
}
