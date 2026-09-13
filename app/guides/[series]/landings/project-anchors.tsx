"use client"

import { motion } from "framer-motion"
import { ChefHat, PawPrint, ShoppingBag, FolderGit2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 实战锚点（新书的核心差异点）
 *
 * 全书贯穿桌面 3 个真实项目：所有知识点都长在真实代码上，
 * 不是虚构的 demo。此区块在 landing 展示「哪个项目 × 用在哪几章」。
 */

const PROJECTS = [
  {
    icon: ChefHat,
    name: "cooking-app",
    kind: "Flutter + NestJS 烹饪助手",
    tech: ["NestJS", "OpenAI SDK", "已有 AI 集成"],
    accent: "text-amber-500 dark:text-amber-400",
    tint: "bg-amber-500/10",
    usage: "Dify 篇实战复刻（第 5 章）· LangChain 篇裸 SDK → 框架重构（第 6/10 章）",
  },
  {
    icon: PawPrint,
    name: "lovelyPet",
    kind: "React Native 萌宠社区",
    tech: ["Expo", "NestJS", "SSE 流式已落地"],
    accent: "text-emerald-500 dark:text-emerald-400",
    tint: "bg-emerald-500/10",
    usage: "LangGraph 多 Agent 日记工作流（第 15 章）· TS/Python 决策复盘（第 16 章）",
  },
  {
    icon: ShoppingBag,
    name: "hakka-ecommerce",
    kind: "客家特产电商 Monorepo",
    tech: ["Next.js", "NestJS", "无 AI（待改造）"],
    accent: "text-sky-500 dark:text-sky-400",
    tint: "bg-sky-500/10",
    usage: "Dify 知识库 RAG 的真实语料（第 3 章）：商品 FAQ 问答机器人",
  },
] as const

export function ProjectAnchors() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {PROJECTS.map((p, i) => {
        const Icon = p.icon
        return (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className={cn(
              "rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm p-4",
              "flex flex-col",
            )}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  p.tint,
                  p.accent,
                )}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold font-display font-mono">{p.name}</div>
                <div className="text-[11px] text-muted-foreground/80 truncate">{p.kind}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {p.tech.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded-full border border-border/60 text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed flex-1">
              <FolderGit2 className="w-3 h-3 inline mr-1 -mt-0.5 text-muted-foreground/50" />
              {p.usage}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
