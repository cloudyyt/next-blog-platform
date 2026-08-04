"use client"

import { UserAvatar } from "@/components/ui/user-avatar"
import { WhisperTimeline } from "@/components/blog/whisper-timeline"
import { Github, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Thought } from "@/lib/types/about"

/**
 * 关于页（client 渲染层）
 * 数据由 server page 通过 props 传入。
 *
 * 结构（文学手记风，精简两块）：
 * ① 关于我（置顶）：头像 + 名 + tagline + 关于我文案（按空行分段）+ 极简联系（无 RSS）
 * ② 碎碎念（主角）：时间线（文学手记风，按需加载）
 */
interface AboutClientProps {
  authorName: string
  authorAvatar: string | null
  tagline: string | null
  intro: string | null
  github: string | null
  website: string | null
  initialWhispers: Thought[]
  total: number
}

export function AboutClient({
  authorName,
  authorAvatar,
  tagline,
  intro,
  github,
  website,
  initialWhispers,
  total,
}: AboutClientProps) {
  // 关于我文案按空行分段
  const introParagraphs = (intro ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/*
        整页包进一张柔和的毛玻璃阅读面板，与首页 hero / 作者卡同一视觉语言：
        bg-card/60 backdrop-blur-md + border-border/60 + shadow-soft。
        这样赛博霓虹的网格/数字雨、清风竹韵的山雾都能柔和透出，
        手记内容落在干净的"纸面"上，两套主题都协调。
      */}
      <div className="max-w-2xl mx-auto rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-soft px-6 py-12 sm:px-12 sm:py-16">
        {/*
          整页两部分：关于我（置顶）+ 碎碎念（主角）。
          内栏用 max-w-xl，手记风居中窄栏最舒服。
        */}
        <div className="max-w-xl mx-auto space-y-20">

          {/* ① 关于我（置顶）：头像 + 名 + tagline + 真诚短文 + 极简联系（无 RSS） */}
          <section className="text-center space-y-6">
            <header className="flex flex-col items-center text-center space-y-4">
              <UserAvatar
                src={authorAvatar}
                name={authorName}
                size={96}
                className="ring-2 ring-primary/15"
              />
              <div className="space-y-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold">
                  {authorName}
                </h1>
                {tagline && (
                  <p className="font-display text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {tagline}
                  </p>
                )}
              </div>
            </header>

            {introParagraphs.length > 0 && (
              <div className="space-y-5 text-muted-foreground leading-loose pt-2">
                {introParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {/* 极简联系（仅已配置项，无 RSS） */}
            {(github || website) && (
              <div className="pt-2">
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  {github && (
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1.5 transition-colors",
                        "hover:text-primary",
                      )}
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1.5 transition-colors",
                        "hover:text-primary",
                      )}
                    >
                      <Globe className="w-4 h-4" />
                      <span>个人网站</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ② 碎碎念（主角） */}
          {total > 0 && (
            <section className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-display text-xl tracking-[0.4em] text-foreground/80">
                  碎 碎 念
                </h2>
                <p className="text-sm text-muted-foreground/70">
                  一些没说出口的话。
                </p>
              </div>

              <WhisperTimeline initialWhispers={initialWhispers} total={total} />
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
