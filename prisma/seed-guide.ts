/**
 * 电子书内容 seed（多系列，可重复执行）
 *
 * 内容流决策（docs_memo/0901 决策三）：
 * - md 文件是内容唯一真相：manifest.ts（元数据）+ {slug}.md（正文）
 * - 每次执行全量 upsert（按 series+slug），改完 md 跑一次即生效
 * - admin 后台不作为内容生产路径，仅应急查看
 *
 * 用法：
 *   pnpm db:seed:guide          # 同步全部系列的章节内容与元数据；config 缺失才创建
 *   pnpm db:seed:guide --force  # 额外用 manifest 默认值覆盖已存在的系列 config 文案
 */
import { promises as fs } from "fs"
import path from "path"
import { PrismaClient, Prisma } from "@prisma/client"
import { chapters as agentGuideChapters } from "../docs/agent-guide/manifest"
import { chapters as agentStackChapters } from "../docs/agent-stack/manifest"
import type { GuideGroupMeta } from "../lib/types/guide"

const prisma = new PrismaClient()
const force = process.argv.includes("--force")

/** 各系列 seed 定义：目录 / 章节 / 篇结构 / 系列文案默认值 */
const SERIES_SEEDS = [
  {
    key: "agent-guide",
    docsDir: path.join(process.cwd(), "docs", "agent-guide"),
    chapters: agentGuideChapters,
    groups: [
      { key: "map", label: "全景地图", hint: "3 分钟知道 Agent 世界长什么样", icon: "Map", order: 1 },
      { key: "terms", label: "术语速查", hint: "卡片式，一词一卡", icon: "Layers", order: 2 },
      { key: "principles", label: "原理直觉", hint: "图解，不讲数学", icon: "Lightbulb", order: 3 },
      { key: "industry", label: "岗位与生态", hint: "国内真实图景", icon: "Briefcase", order: 4 },
      { key: "action", label: "行动路线", hint: "转岗怎么做", icon: "Rocket", order: 5 },
    ],
    config: {
      title: "Agent 认知地图",
      subtitle: "转岗 Agent 前的认知速览：一张地图、一叠术语卡、一点原理直觉、一份岗位图景。",
      coverImage: null,
      badge: "连载中",
      cta: null,
      valueCard1: "前端 / TS 工程师",
      valueCard2: "概念 · 术语 · 岗位认知",
      valueCard4: "每章 20-30 分钟",
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
    },
  },
  {
    key: "agent-stack",
    docsDir: path.join(process.cwd(), "docs", "agent-stack"),
    chapters: agentStackChapters,
    groups: [
      { key: "overview", label: "全局观", hint: "看懂地图 + 打好地基", icon: "Compass", order: 1 },
      { key: "dify", label: "Dify 篇", hint: "平台层 · 可视化建立全局流程", icon: "Blocks", order: 2 },
      { key: "langchain", label: "LangChain 篇", hint: "框架层 · 基础件 + MCP 标准", icon: "Link2", order: 3 },
      { key: "langgraph", label: "LangGraph 篇", hint: "编排层 · 图状态与多 Agent", icon: "Workflow", order: 4 },
      { key: "engineering", label: "工程化篇", hint: "落地 · RAG 深水区 / 观测 / 求职", icon: "Hammer", order: 5 },
    ],
    config: {
      title: "Agent 实战：从 Dify 到 LangGraph",
      subtitle: "平台起步，代码深入——Dify · LangChain · LangGraph，全程长在真实项目上。",
      coverImage: null,
      badge: "连载中",
      cta: null,
      valueCard1: "全栈 / 前端工程师",
      valueCard2: "TypeScript · DeepSeek",
      valueCard4: "每章 15-20 分钟",
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
    },
  },
] as const

async function readMd(dir: string, slug: string): Promise<string> {
  try {
    return await fs.readFile(path.join(dir, `${slug}.md`), "utf-8")
  } catch {
    // md 缺失：正文留空（章节若非 comingSoon，前端显示「正文即将上线」）
    return ""
  }
}

async function main() {
  console.log("🌱 电子书内容同步（多系列，md 为唯一真相）...")
  console.log(`   模式：${force ? "--force（config 一并覆盖）" : "默认（章节全量 upsert，config 缺失才建）"}\n`)

  const admin = await prisma.user.findFirst({ where: { role: "admin" } })
  if (!admin) {
    throw new Error("未找到 admin 用户，请先执行 pnpm db:seed（建管理员）")
  }

  for (const seed of SERIES_SEEDS) {
    console.log(`📖 系列「${seed.key}」：${seed.chapters.length} 章`)

    // 1. 章节全量 upsert（series+slug）
    const orderCounter: Record<string, number> = {}
    let created = 0,
      updated = 0
    const missingMd: string[] = []

    for (const c of seed.chapters) {
      orderCounter[c.group] = (orderCounter[c.group] ?? 0) + 10
      const order = orderCounter[c.group]

      const content = await readMd(seed.docsDir, c.slug)
      if (!content) missingMd.push(c.slug)

      const data = {
        series: seed.key,
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

      const existing = await prisma.guideChapter.findUnique({
        where: { series_slug: { series: seed.key, slug: c.slug } },
      })
      if (existing) {
        await prisma.guideChapter.update({
          where: { series_slug: { series: seed.key, slug: c.slug } },
          data,
        })
        updated++
      } else {
        await prisma.guideChapter.create({ data })
        created++
      }
    }
    console.log(
      `   ✅ 新建 ${created} · 更新 ${updated}` +
        (missingMd.length
          ? ` · md 缺失(正文空) ${missingMd.length}: ${missingMd.join(", ")}`
          : ""),
    )

    // manifest 即真相：清理该系列下不在 manifest 里的库内章节（如重定位砍掉的旧章）
    const manifestSlugs = seed.chapters.map((c) => c.slug)
    const orphans = await prisma.guideChapter.findMany({
      where: { series: seed.key, slug: { notIn: manifestSlugs } },
      select: { id: true, slug: true },
    })
    if (orphans.length) {
      await prisma.guideChapter.deleteMany({
        where: { id: { in: orphans.map((o) => o.id) } },
      })
      console.log(
        `   🧹 清理 ${orphans.length} 个不在 manifest 的旧章: ${orphans.map((o) => o.slug).join(", ")}`,
      )
    }

    // 2. 系列 config（多行，id = 系列 key）
    const configData = {
      title: seed.config.title,
      subtitle: seed.config.subtitle,
      coverImage: seed.config.coverImage,
      badge: seed.config.badge,
      cta: seed.config.cta,
      valueCard1: seed.config.valueCard1,
      valueCard2: seed.config.valueCard2,
      valueCard4: seed.config.valueCard4,
      ogTitle: seed.config.ogTitle,
      ogDescription: seed.config.ogDescription,
      ogImage: seed.config.ogImage,
      groups: seed.groups as unknown as Prisma.InputJsonValue,
    }
    const config = await prisma.guideSeriesConfig.findUnique({
      where: { id: seed.key },
    })
    if (!config) {
      await prisma.guideSeriesConfig.create({
        data: { id: seed.key, ...configData },
      })
      console.log(`   ✅ 系列配置已创建`)
    } else if (force) {
      await prisma.guideSeriesConfig.update({
        where: { id: seed.key },
        data: configData,
      })
      console.log(`   ✅ 系列配置已覆盖（--force）`)
    } else {
      console.log(`   ⏭️  系列配置已存在，保留（--force 可覆盖）`)
    }
    console.log("")
  }

  // 3. 统计
  const total = await prisma.guideChapter.count()
  const readable = await prisma.guideChapter.count({
    where: { published: true, comingSoon: false },
  })
  const wip = await prisma.guideChapter.count({ where: { comingSoon: true } })
  const seriesCount = await prisma.guideSeriesConfig.count()

  console.log("🎉 电子书内容同步完成！")
  console.log("📊 数据统计:")
  console.log(`   - 系列: ${seriesCount} 本`)
  console.log(`   - 章节总数: ${total}（可读 ${readable} · 建设中 ${wip}）`)
  console.log("   - 提醒：部署时 release 包已含 docs/，服务器执行 pnpm db:seed:guide 即同步")
}

main()
  .catch((e) => {
    console.error("❌ 电子书 seed 失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
