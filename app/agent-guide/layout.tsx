import type { Metadata } from "next"
import { DocsShell } from "./components/docs-shell"
import { getGuideSidebarData, getGuideSeriesConfig } from "@/lib/guide/data"

/**
 * 系列级 SEO：读 admin 配置的 ogTitle/ogDescription/ogImage，
 * 缺省 fallback 到系列标题/副标题（与 settings 表单 placeholder 语义一致）。
 * title.template 保留，章节页 title 会套成 "{章节} · zijieLeo Docs"。
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getGuideSeriesConfig()
  const title = config?.title ?? "Agent 开发指南"
  const ogTitle = config?.ogTitle ?? title
  const description =
    config?.ogDescription ??
    config?.subtitle ??
    "前端工程师转型 Agent 开发的完整路径——从术语地基到工程化实战。"
  const ogImage = config?.ogImage ?? undefined

  return {
    title: {
      default: `${title} · zijieLeo Docs`,
      template: "%s · zijieLeo Docs",
    },
    description,
    openGraph: {
      title: ogTitle,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

/**
 * /agent-guide 路由段 layout（async server）
 *
 * 在此一次性查 DB 取 sidebar 数据，下传给 DocsShell → DocsSidebar（方案 A）：
 * 桌面常驻 + 移动抽屉用同一份数据，避免 client fetch 闪烁与不一致。
 *
 * 根 layout 已挂载 ThemeProvider / VisualThemeProvider / AuthProvider，自动继承。
 */
export default async function AgentGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarData = await getGuideSidebarData()
  return <DocsShell sidebarData={sidebarData}>{children}</DocsShell>
}
