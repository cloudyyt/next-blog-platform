"use client"

import * as React from "react"
import { VisualThemeContext } from "@/components/providers/visual-theme-provider"
import { defaultVisualTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"

/**
 * 视觉主题背景组件
 * 根据当前选择的视觉主题显示不同的背景效果
 */
export function ThemeBackground() {
  const [mounted, setMounted] = React.useState(false)

  // 安全地获取主题 Context，如果不存在则使用默认值
  const context = React.useContext(VisualThemeContext)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 如果 Context 不存在，返回 null（优雅降级）
  if (!context) {
    return null
  }

  const { theme, useSimplified } = context

  if (!mounted) {
    return null
  }

  return (
    <div
      className="theme-background"
      data-visual-theme={theme}
      data-simplified={useSimplified}
    >
      {theme === "cyber-neon" && <CyberNeonBackground simplified={useSimplified} />}
      {theme === "tranquil-ink" && <TranquilInkBackground />}
    </div>
  )
}

/**
 * 赛博霓虹背景
 */
function CyberNeonBackground({ simplified }: { simplified: boolean }) {
  const gridLines = simplified ? 8 : 15
  const particles = simplified ? 8 : 20

  return (
    <>
      {/* 霓虹网格 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--theme-neon-primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--theme-neon-primary) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          opacity: "var(--theme-grid-opacity)",
          animation: "neonGrid 3s ease-in-out infinite",
        }}
      />

      {/* 数字粒子 */}
      {Array.from({ length: particles }).map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 5
        const duration = Math.random() * 3 + 2
        const digit = Math.floor(Math.random() * 10)

        return (
          <div
            key={`particle-${i}`}
            className="absolute font-mono text-xs"
            style={{
              left: `${left}%`,
              top: "-20px",
              color: i % 3 === 0
                ? "var(--theme-neon-primary)"
                : i % 3 === 1
                ? "var(--theme-neon-secondary)"
                : "var(--theme-neon-accent)",
              textShadow: `0 0 10px currentColor`,
              animation: `digitalRain ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              opacity: "var(--theme-particle-opacity)",
            }}
          >
            {digit}
          </div>
        )
      })}

      {/* 霓虹线条装饰 */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`line-${i}`}
          className="absolute"
          style={{
            left: `${20 + i * 30}%`,
            top: "0",
            width: "2px",
            height: "100%",
            background: `linear-gradient(
              to bottom,
              transparent 0%,
              var(--theme-neon-primary) 20%,
              var(--theme-neon-secondary) 50%,
              var(--theme-neon-primary) 80%,
              transparent 100%
            )`,
            opacity: "0.3",
            animation: `neonPulse ${2 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            filter: "blur(1px)",
          }}
        />
      ))}

      {/* 渐变遮罩层 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, var(--theme-overlay-opacity)) 100%
          )`,
        }}
      />
    </>
  )
}

/**
 * 清风竹韵 — 溪山薄雾风格
 * 远山叠影 + 薄雾渐变 + 零露珠点 + 零动画
 */
function TranquilInkBackground() {
  return (
    <>
      {/* Layer 0: Cool mist gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            175deg,
            var(--theme-mist-base) 0%,
            var(--theme-mist-mid) 50%,
            var(--theme-mist-deep) 100%
          )`,
        }}
      />

      {/* Layer 1: Far mountain silhouette — wide, low opacity */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: "45%", opacity: 1 }}
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
      >
        <path
          d="M0 400 L0 280 Q120 200 240 250 Q360 180 480 220 Q600 160 720 200 Q840 140 960 190 Q1080 130 1200 180 Q1320 150 1440 200 L1440 400 Z"
          fill="var(--theme-hill-far)"
        />
      </svg>

      {/* Layer 2: Mid mountain — slightly closer, different curve */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: "35%", opacity: 1 }}
        viewBox="0 0 1440 350"
        preserveAspectRatio="none"
      >
        <path
          d="M0 350 L0 260 Q180 180 360 230 Q540 160 720 210 Q900 140 1080 190 Q1260 160 1440 220 L1440 350 Z"
          fill="var(--theme-hill-mid)"
        />
      </svg>

      {/* Layer 3: Near hill — foreground, widest */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: "22%", opacity: 1 }}
        viewBox="0 0 1440 250"
        preserveAspectRatio="none"
      >
        <path
          d="M0 250 L0 180 Q200 120 400 160 Q600 100 800 140 Q1000 90 1200 130 Q1350 110 1440 150 L1440 250 Z"
          fill="var(--theme-hill-near)"
        />
      </svg>

      {/* Layer 4: Dewdrop accents — tiny static circles like morning dew */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }}>
        <circle cx="12%" cy="25%" r="2" fill="var(--theme-dewdrop)" />
        <circle cx="28%" cy="18%" r="1.5" fill="var(--theme-dewdrop)" />
        <circle cx="45%" cy="30%" r="2.5" fill="var(--theme-dewdrop)" />
        <circle cx="62%" cy="15%" r="1.5" fill="var(--theme-dewdrop)" />
        <circle cx="78%" cy="28%" r="2" fill="var(--theme-dewdrop)" />
        <circle cx="90%" cy="22%" r="1.5" fill="var(--theme-dewdrop)" />
        <circle cx="35%" cy="45%" r="1" fill="var(--theme-dewdrop)" />
        <circle cx="55%" cy="50%" r="1.5" fill="var(--theme-dewdrop)" />
        <circle cx="72%" cy="42%" r="1" fill="var(--theme-dewdrop)" />
      </svg>

      {/* Layer 5: Soft top vignette — draws eye down to content */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse 80% 50% at 50% 0%,
            transparent 50%,
            var(--theme-mist-base) 100%
          )`,
          opacity: 0.4,
        }}
      />
    </>
  )
}
