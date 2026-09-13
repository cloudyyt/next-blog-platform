"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Coffee, BookMarked, Search, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 三种读法（贴合「上班摸鱼、碎片时间」的使用场景）
 *
 * - 摸鱼：每章 15-20 分钟，通勤/午休刷一章
 * - 系统：按篇顺序读，TS 主线 + Python 对照
 * - 查阅：已入门，遇到具体问题跳章
 */

const MODES = [
  {
    key: "sneak",
    icon: Coffee,
    title: "摸鱼读",
    duration: "每章 15-20 分钟",
    desc: "通勤 / 午休刷一章，章节粒度专为碎片时间设计",
    href: "/guides/agent-stack/stack-map",
    cta: "从第 1 章开始",
    accent: "text-amber-500 dark:text-amber-400",
    ring: "hover:border-amber-500/40 hover:bg-amber-500/5",
  },
  {
    key: "system",
    icon: BookMarked,
    title: "系统读",
    duration: "按篇推进",
    desc: "Dify → LangChain → LangGraph 顺序走，TS 主线 + Python 对照",
    href: "/guides/agent-stack/stack-map",
    cta: "从全局观开始",
    accent: "text-emerald-500 dark:text-emerald-400",
    ring: "hover:border-emerald-500/40 hover:bg-emerald-500/5",
  },
  {
    key: "ref",
    icon: Search,
    title: "查阅",
    duration: "随时",
    desc: "做项目卡住了，直接跳到工具调用 / RAG / HITL 对应章节",
    href: "#chapter-list",
    cta: "查看全部章节",
    accent: "text-sky-500 dark:text-sky-400",
    ring: "hover:border-sky-500/40 hover:bg-sky-500/5",
  },
] as const

export function ReadingModes() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {MODES.map((mode, i) => {
        const Icon = mode.icon
        const isAnchor = mode.href.startsWith("#")
        const Wrapper = isAnchor ? "a" : Link
        return (
          <motion.div
            key={mode.key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <Wrapper
              href={mode.href as never}
              className={cn(
                "group flex flex-col h-full rounded-xl border border-border/60",
                "bg-card/70 backdrop-blur-sm p-4 transition-all cursor-pointer",
                mode.ring,
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("flex items-center gap-1.5 text-sm font-bold", mode.accent)}>
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  {mode.title}
                </span>
                <span className="text-[10px] text-muted-foreground/60">{mode.duration}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {mode.desc}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground/70 group-hover:text-primary transition-colors">
                {mode.cta}
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Wrapper>
          </motion.div>
        )
      })}
    </div>
  )
}
