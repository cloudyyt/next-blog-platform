"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Zap, BookMarked, Search, ArrowRight } from "lucide-react"

/**
 * 三种读法入口卡
 *
 * 把 intro.md 里的「三种读法」表格提升为可点的入口卡，
 * 让不同目的的读者第一时间找到属于自己的路线。
 *
 * 路线常量在此硬编码（YAGNI，不做 admin 可配）：
 * - 速通（1 周）→ Phase 0：先建全景，跑通一个 API
 * - 精读（1 月）→ 卷首 intro：系统掌握，能独立做项目
 * - 查阅（随时）→ 锚点 #chapter-list：已入门，遇到问题回查
 */
const MODES = [
  {
    key: "fast",
    icon: Zap,
    title: "速通",
    duration: "1 周",
    desc: "先建立全景，知道有哪些坑，跑通第一个 API",
    href: "/agent-guide/phase-0-terminology",
    cta: "从 Phase 0 开始",
    accent: "text-amber-500 dark:text-amber-400",
    ring: "hover:border-amber-500/40 hover:bg-amber-500/5",
  },
  {
    key: "deep",
    icon: BookMarked,
    title: "精读",
    duration: "1 个月",
    desc: "想真正掌握，能独立做项目，按顺序读到核心能力",
    href: "/agent-guide/intro",
    cta: "从卷首开始",
    accent: "text-emerald-500 dark:text-emerald-400",
    ring: "hover:border-emerald-500/40 hover:bg-emerald-500/5",
  },
  {
    key: "ref",
    icon: Search,
    title: "查阅",
    duration: "随时",
    desc: "已经入门，遇到具体问题直接跳到对应章节",
    href: "#chapter-list",
    cta: "查看全部章节",
    accent: "text-sky-500 dark:text-sky-400",
    ring: "hover:border-sky-500/40 hover:bg-sky-500/5",
  },
] as const

export function ReadingModeCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-14">
      {MODES.map((mode, i) => {
        const Icon = mode.icon
        const isAnchor = mode.href.startsWith("#")
        const Wrapper = isAnchor ? "a" : Link
        return (
          <motion.div
            key={mode.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
          >
            <Wrapper
              {...(isAnchor
                ? { href: mode.href }
                : { href: mode.href })}
              className={`group block h-full rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm px-4 py-4 transition-all cursor-pointer ${mode.ring}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${mode.accent}`} />
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  {mode.duration}
                </span>
              </div>
              <h3 className="text-base font-bold font-display mb-1">
                {mode.title}
              </h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3 min-h-[2.5rem]">
                {mode.desc}
              </p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${mode.accent}`}
              >
                {mode.cta}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Wrapper>
          </motion.div>
        )
      })}
    </div>
  )
}
