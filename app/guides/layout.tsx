import Link from "next/link"
import { Library } from "lucide-react"
import "lxgw-wenkai-webfont/style.css"

/**
 * /guides 书房世界总 layout（书架 + 书目 + 章节共用）
 *
 * 整域固定「暖纸书房」视觉：墙 #F5EFE3、木质主色、暖金点缀、文楷正文。
 * 不再使用全站视觉主题/明暗切换——从书架点进目录、章节，
 * 视觉一脉相承（微信读书式：书架和阅读页是同一个世界）。
 */
export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="study-scope flex h-screen flex-col overflow-hidden bg-background text-foreground"
      style={{ colorScheme: "light" }}
    >
      {/* 顶栏：极简（阅读世界不需要主题切换器） */}
      <header className="z-40 flex h-12 shrink-0 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-sm">
        <Link
          href="/blog"
          className="rounded-md px-2 py-1 text-sm text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← 博客
        </Link>
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-handwriting text-lg font-bold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Library className="h-4 w-4 text-primary" />
          书房
        </Link>
        {/* 右侧占位，保持品牌居中 */}
        <span aria-hidden className="w-[64px]" />
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* 墙面质感：极淡纸纹 + 底部渐暗，营造灯下书房 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(120,90,40,0.05) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(140% 90% at 50% -10%, rgba(255,248,230,0.55), transparent 55%), radial-gradient(120% 60% at 50% 115%, rgba(90,60,25,0.10), transparent 60%)",
          }}
        />
        <div className="relative flex flex-1 flex-col overflow-y-auto">
          {children}
        </div>

        <footer className="relative z-10 flex shrink-0 items-center justify-center border-t border-border/50 bg-background/70 py-3 backdrop-blur-sm">
          <p className="font-handwriting text-xs tracking-wide text-muted-foreground">
            zijieLeo 的书房 · 有空来读两章
          </p>
        </footer>
      </div>
    </div>
  )
}
