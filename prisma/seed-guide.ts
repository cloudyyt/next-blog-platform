/**
 * Agent 指南一次性内容迁移脚本（seed-guide）
 *
 * 把 docs/agent-guide/manifest.ts 的章节元信息 + docs/agent-guide/*.md 的正文
 * 灌入数据库（GuideChapter + GuideSeriesConfig）。
 *
 * ⚠️ 一次性使用：首次迁移后不要再跑（会覆盖 admin 的手动编辑）。
 *    若确需强制覆盖已存在数据，加 --force 参数。
 *
 * 用法：
 *   pnpm db:seed:guide          # 首次/安全：只插入不存在的章节，跳过已存在
 *   pnpm db:seed:guide --force  # 强制：覆盖已存在的章节正文与配置
 */
import { promises as fs } from "fs"
import path from "path"
import { PrismaClient, Prisma } from "@prisma/client"
import { chapters } from "../docs/agent-guide/manifest"
import type { GuideGroupMeta } from "../lib/types/guide"

const prisma = new PrismaClient()
const DOCS_DIR = path.join(process.cwd(), "docs", "agent-guide")
const force = process.argv.includes("--force")

// 5 阶段定义（系列初始配置；与 manifest GROUPS 同步，带 icon/order）
const INITIAL_GROUPS: GuideGroupMeta[] = [
  { key: "intro", label: "起步", hint: "搭建认知地基，知道接下来要学什么", icon: "Compass", order: 1 },
  { key: "foundation", label: "基础", hint: "动手前的工具与思维准备", icon: "Layers", order: 2 },
  { key: "core", label: "核心能力", hint: "Agent 开发的三大支柱：工具调用 / Prompt / RAG", icon: "Sparkles", order: 3 },
  { key: "system", label: "系统化", hint: "从单次调用到自主系统，再到工程上线", icon: "BookOpen", order: 4 },
  { key: "appendix", label: "参考", hint: "速查与延伸阅读", icon: "BookOpen", order: 5 },
]

// 系列初始配置（与原 v1 manifest 文案一致）
const INITIAL_SERIES_CONFIG = {
  title: "前端工程师转型 Agent 开发指南",
  subtitle:
    "一份用前端工程师熟悉的概念作脚手架的实战地图。从术语地基开始，一步步走到能独立交付 Agent 应用。",
  coverImage: null,
  badge: "连载中",
  cta: null,
  valueCard1: "前端 / TS 工程师",
  valueCard2: "Python · Qwen · 阿里云",
  valueCard4: "每章 20-30 分钟",
  ogTitle: null,
  ogDescription: null,
  ogImage: null,
}

async function readMd(slug: string): Promise<string> {
  try {
    return await fs.readFile(path.join(DOCS_DIR, `${slug}.md`), "utf-8")
  } catch {
    // 容错：appendix-glossary.md 等缺失文件，正文留空（该章 comingSoon，不影响读者）
    return ""
  }
}

async function main() {
  console.log("🌱 开始迁移 Agent 指南内容到数据库...")

  // 1. 取 admin 用户作作者（兼容 seed.ts 建的「博主」或任意 admin）
  const admin = await prisma.user.findFirst({ where: { role: "admin" } })
  if (!admin) {
    throw new Error("未找到 admin 用户，请先执行 pnpm db:seed（建管理员）")
  }

  // 2. 迁移章节
  console.log(`📚 处理 ${chapters.length} 个章节（${force ? "强制覆盖" : "仅插入新章"}）...`)
  const orderCounter: Record<string, number> = {}
  let created = 0,
    updated = 0,
    skipped = 0
  let missingMd: string[] = []

  for (const c of chapters) {
    // manifest 无 order 字段 → 按 group 内出现顺序 ×10 推导
    orderCounter[c.group] = (orderCounter[c.group] ?? 0) + 10
    const order = orderCounter[c.group]

    const content = await readMd(c.slug)
    if (!content) missingMd.push(c.slug)

    const existing = await prisma.guideChapter.findUnique({
      where: { slug: c.slug },
    })

    // seed 语义：manifest 中所有章节都标记为 published（comingSoon 的会在
    // sidebar 灰显、总览页隐藏、章节页 404，由前端数据层按 comingSoon 过滤）
    const data = {
      title: c.title,
      slug: c.slug,
      content,
      description: c.description,
      group: c.group,
      difficulty: c.difficulty,
      order,
      readingTime: c.readingTime ?? null,
      comingSoon: c.comingSoon ?? false,
      published: true,
      ogImage: null,
      authorId: admin.id,
    }

    if (existing && !force) {
      skipped++
      continue
    }
    if (existing) {
      await prisma.guideChapter.update({ where: { slug: c.slug }, data })
      updated++
    } else {
      await prisma.guideChapter.create({ data })
      created++
    }
  }

  console.log(
    `   ✅ 新建 ${created} · 更新 ${updated} · 跳过 ${skipped}` +
      (missingMd.length ? ` · 正文缺失(置空) ${missingMd.length}: ${missingMd.join(", ")}` : "")
  )

  // 3. 迁移系列配置（singleton）
  console.log("⚙️  写入系列配置（singleton）...")
  const config = await prisma.guideSeriesConfig.findUnique({
    where: { id: "singleton" },
  })

  const configData = {
    title: INITIAL_SERIES_CONFIG.title,
    subtitle: INITIAL_SERIES_CONFIG.subtitle,
    coverImage: INITIAL_SERIES_CONFIG.coverImage,
    badge: INITIAL_SERIES_CONFIG.badge,
    cta: INITIAL_SERIES_CONFIG.cta,
    valueCard1: INITIAL_SERIES_CONFIG.valueCard1,
    valueCard2: INITIAL_SERIES_CONFIG.valueCard2,
    valueCard4: INITIAL_SERIES_CONFIG.valueCard4,
    ogTitle: INITIAL_SERIES_CONFIG.ogTitle,
    ogDescription: INITIAL_SERIES_CONFIG.ogDescription,
    ogImage: INITIAL_SERIES_CONFIG.ogImage,
    groups: INITIAL_GROUPS as unknown as Prisma.InputJsonValue,
  }

  if (!config) {
    await prisma.guideSeriesConfig.create({ data: { id: "singleton", ...configData } })
    console.log("   ✅ 系列配置已创建")
  } else if (force) {
    await prisma.guideSeriesConfig.update({ where: { id: "singleton" }, data: configData })
    console.log("   ✅ 系列配置已覆盖更新")
  } else {
    console.log("   ⏭️  系列配置已存在，跳过（--force 可覆盖）")
  }

  // 4. 统计
  const total = await prisma.guideChapter.count()
  const publishedCount = await prisma.guideChapter.count({
    where: { published: true, comingSoon: false },
  })
  const wipCount = await prisma.guideChapter.count({ where: { comingSoon: true } })

  console.log("\n🎉 Agent 指南迁移完成！")
  console.log("📊 数据统计:")
  console.log(`   - 章节总数: ${total}`)
  console.log(`   - 已发布(可访问): ${publishedCount}`)
  console.log(`   - WIP(comingSoon): ${wipCount}`)
  console.log(`   - 系列配置: ${config || force ? "已写入" : "已存在"}`)
}

main()
  .catch((e) => {
    console.error("❌ Agent 指南迁移失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
