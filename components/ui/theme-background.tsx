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
  
  // 如果 Context 不存在，返回 null（优雅降级）
  if (!context) {
    return null
  }
  
  const { theme, useSimplified } = context

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div
      className="theme-background"
      data-visual-theme={theme}
      data-simplified={useSimplified}
    >
      {theme === "deep-space" && <DeepSpaceBackground simplified={useSimplified} />}
      {theme === "mountain-clouds" && <MountainCloudsBackground simplified={useSimplified} />}
      {theme === "cyber-neon" && <CyberNeonBackground simplified={useSimplified} />}
      {theme === "dusk-shore" && <DuskShoreBackground simplified={useSimplified} />}
      {theme === "default" && <DefaultBackground />}
    </div>
  )
}

/**
 * 深邃星空背景
 */
function DeepSpaceBackground({ simplified }: { simplified: boolean }) {
  // 根据性能决定星星和粒子数量
  const starCount = simplified ? 30 : 60
  const particleCount = simplified ? 5 : 12
  const meteorCount = simplified ? 1 : 3

  return (
    <>
      {/* 星星 */}
      {Array.from({ length: starCount }).map((_, i) => {
        // 为每颗星星生成随机参数，使闪烁更自然
        const baseSize = Math.random() * 2 + 1
        const glowSize = Math.random() * 3 + 2
        const duration = Math.random() * 2 + 2 // 2-4秒
        const delay = Math.random() * 3 // 0-3秒延迟
        
        return (
          <div
            key={`star-${i}`}
            className="star absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${baseSize}px`,
              height: `${baseSize}px`,
              animation: `twinkle ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              boxShadow: `0 0 ${glowSize}px rgba(255, 255, 255, 0.9), 0 0 ${glowSize * 2}px rgba(255, 255, 255, 0.5)`,
            }}
          />
        )
      })}

      {/* 流动粒子 */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={`particle-${i}`}
          className="particle absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: "100%",
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: `radial-gradient(circle, var(--theme-particles-color) 0%, transparent 70%)`,
            opacity: `var(--theme-particles-opacity)`,
            animation: `particleFlow ${Math.random() * 10 + 15}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            filter: "blur(1px)",
          }}
        />
      ))}

      {/* 流星雨 */}
      <MeteorShower count={meteorCount} />

      {/* 渐变遮罩层，确保内容可读性 */}
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
 * 流星雨组件
 */
function MeteorShower({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        // 随机生成流星参数
        // 从右上往左下：起始位置在右侧上方
        // 和水平面呈45-60°夹角（从右上到左下，尾巴在左下）
        const startX = Math.random() * 20 + 80 // 80-100% 起始位置（右侧，右上角区域）
        const angle = -(Math.random() * 15 - 30) // -45到-60度角（从右上往左下，东北到西南）
        const delay = Math.random() * 10 // 0-10秒初始延迟
        const duration = 4 + Math.random() * 3 // 2-4秒划过时间（更慢）
        const interval = 15 + Math.random() * 10 // 12-20秒间隔（下一次出现）
        
        return (
          <Meteor
            key={`meteor-${i}`}
            startX={startX}
            angle={angle}
            delay={delay}
            duration={duration}
            interval={interval}
          />
        )
      })}
    </>
  )
}

/**
 * 单个流星组件
 */
function Meteor({
  startX,
  angle,
  delay,
  duration,
  interval,
}: {
  startX: number
  angle: number
  delay: number
  duration: number
  interval: number
}) {
  // 计算流星的移动距离
  // 从东北（右上）到西南（左下）：角度为负，translateX 为负值（向左），translateY 为正值（向下）
  // 角度 -45 到 -60 度：从右上到左下，和水平面呈 45-60° 夹角
  // 注意：CSS rotate 中，负角度是顺时针旋转
  const angleRad = (Math.abs(angle) * Math.PI) / 180
  // 计算水平移动距离：tan(角度) * 垂直距离
  // 从右上到左下，需要向左移动，所以是负值
  const translateX = -Math.tan(angleRad) * 100 // 100vh 对应的水平距离（vw，负值表示向左）
  
  // 起始位置在可视区右上角（从可视区域内开始）
  // 右上角：右侧（80-100%），顶部（0-10%可视区域）
  const startTop = Math.random() * 10 // 0-10% 从可视区顶部开始
  
  return (
    <div
      className="meteor absolute pointer-events-none"
      style={{
        left: `${startX}%`, // 从右侧（80-100%）开始，右上角区域
        top: `${startTop}%`, // 从可视区顶部（0-10%）开始
        width: "2px",
        height: "150px",
        transform: `rotate(${angle}deg)`, // -45 到 -60 度，从右上到左下（东北到西南）
        transformOrigin: "bottom center", // 从底部（头部，右下）开始，尾巴在顶部（左上）
        // 使用 CSS 变量传递角度和移动距离
        ["--meteor-angle" as any]: `${angle}deg`,
        ["--meteor-translate-x" as any]: `${translateX}vw`,
        animation: `meteorFall ${duration}s ease-out ${delay}s infinite`,
      }}
    >
      {/* 流星头部（亮点）- 在底部（运动方向的前端，朝着左下方向） */}
      <div
        className="absolute bottom-0 left-1/2 w-1.5 h-1.5 rounded-full bg-white"
        style={{
          transform: "translate(-50%, 50%)",
          boxShadow: "0 0 8px rgba(255, 255, 255, 1), 0 0 16px rgba(173, 216, 230, 0.8), 0 0 24px rgba(135, 206, 250, 0.6)",
        }}
      />
      
      {/* 流星尾迹（渐变线条）- 从底部（头部）到顶部（尾部），沿着运动方向 */}
      <div
        className="absolute bottom-0 left-1/2 w-0.5 h-full"
        style={{
          transform: "translateX(-50%)",
          background: `linear-gradient(
            to top,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(173, 216, 230, 0.8) 20%,
            rgba(135, 206, 250, 0.6) 40%,
            rgba(100, 149, 237, 0.4) 60%,
            transparent 100%
          )`,
          filter: "blur(0.5px)",
        }}
      />
      
      {/* 流星尾迹光晕（增强效果） */}
      <div
        className="absolute bottom-0 left-1/2 w-1.5 h-full"
        style={{
          transform: "translateX(-50%)",
          background: `linear-gradient(
            to top,
            rgba(255, 255, 255, 0.7) 0%,
            rgba(173, 216, 230, 0.5) 30%,
            rgba(135, 206, 250, 0.3) 50%,
            transparent 100%
          )`,
          filter: "blur(2px)",
        }}
      />
    </div>
  )
}

/**
 * 高山凌云背景 - 改进版，更写实
 */
function MountainCloudsBackground({ simplified }: { simplified: boolean }) {
  const cloudCount = simplified ? 3 : 6

  return (
    <>
      {/* 多层云朵 - 更写实 */}
      {Array.from({ length: cloudCount }).map((_, i) => {
        const size = Math.random() * 300 + 150
        const top = Math.random() * 50 + 5
        const left = Math.random() * 120 - 10
        const speed = Math.random() * 40 + 30
        const layer = i % 3 // 分层，创造深度感

        return (
          <div
            key={`cloud-${i}`}
            className="cloud absolute"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size * 0.5}px`,
              background: `radial-gradient(
                ellipse at center,
                var(--theme-clouds-color) 0%,
                rgba(255, 255, 255, 0.3) 40%,
                transparent 70%
              )`,
              opacity: `calc(var(--theme-clouds-opacity) * ${1 - layer * 0.2})`,
              animation: `cloudMove ${speed}s linear infinite, cloudFloat ${speed * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              filter: `blur(${20 + layer * 5}px)`,
              borderRadius: "50%",
            }}
          />
        )
      })}

      {/* 山峰剪影 - 更写实的多层山峰 */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "40%",
          background: `linear-gradient(
            to top,
            var(--theme-mountain-color) 0%,
            rgba(74, 90, 74, 0.8) 30%,
            transparent 100%
          )`,
          clipPath: "polygon(0% 100%, 5% 85%, 15% 75%, 25% 80%, 35% 65%, 45% 70%, 55% 55%, 65% 60%, 75% 50%, 85% 55%, 95% 45%, 100% 50%, 100% 100%)",
          boxShadow: "0 -10px 30px var(--theme-mountain-shadow)",
        }}
      />
      
      {/* 远山层 - 增加深度 */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "25%",
          background: `linear-gradient(
            to top,
            rgba(74, 90, 74, 0.6) 0%,
            transparent 100%
          )`,
          clipPath: "polygon(0% 100%, 10% 90%, 20% 85%, 30% 88%, 40% 82%, 50% 85%, 60% 78%, 70% 80%, 80% 75%, 90% 78%, 100% 72%, 100% 100%)",
          opacity: 0.5,
        }}
      />

      {/* 渐变遮罩层 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255, 255, 255, var(--theme-overlay-opacity)) 100%
          )`,
        }}
      />
    </>
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
 * 暮色海岸背景
 */
function DuskShoreBackground({ simplified }: { simplified: boolean }) {
  const waveCount = simplified ? 3 : 5

  return (
    <>
      {/* 太阳光晕 */}
      <div
        className="absolute rounded-full"
        style={{
          right: "15%",
          top: "10%",
          width: "200px",
          height: "200px",
          background: `radial-gradient(
            circle,
            rgba(255, 200, 100, 0.4) 0%,
            rgba(255, 150, 50, 0.2) 40%,
            transparent 70%
          )`,
          animation: "sunGlow 4s ease-in-out infinite",
          filter: "blur(30px)",
        }}
      />

      {/* 海浪 */}
      {Array.from({ length: waveCount }).map((_, i) => {
        const bottom = 20 + i * 15
        const speed = 10 + i * 2
        const delay = i * 0.5

        return (
          <div
            key={`wave-${i}`}
            className="absolute left-0 right-0"
            style={{
              bottom: `${bottom}%`,
              height: "20px",
              background: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 50px,
                var(--theme-wave-color) 50px,
                var(--theme-wave-color) 100px
              )`,
              animation: `waveMove ${speed}s linear infinite, waveRise ${speed * 2}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              opacity: 0.6 - i * 0.1,
              filter: "blur(2px)",
            }}
          />
        )
      })}

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
 * 默认背景
 */
function DefaultBackground() {
  return null
}

