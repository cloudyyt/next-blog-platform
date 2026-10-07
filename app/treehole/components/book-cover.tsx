import { cn } from "@/lib/utils"

const elementColors: Record<string, string> = {
  spring: "#71906d",
  summer: "#bf6a36",
  cloud: "#6c788e",
  winter: "#8c8c83",
  wind: "#b98539",
  autumn: "#a98b45",
  rain: "#6d7f92",
  snow: "#9a9a92",
}

export function BookCover({
  title,
  author,
  elements = ["spring", "summer", "cloud", "winter", "wind"],
  coverStyle = "wind-cloud",
  className,
}: {
  title: string
  author: string
  elements?: string[]
  coverStyle?: string
  className?: string
}) {
  const windCloud = coverStyle !== "four-seasons"
  return (
    <div
      className={cn(
        "relative aspect-[2/3] [container-type:inline-size] overflow-hidden rounded-l-[3px] rounded-r-lg bg-[#f5ead7]",
        "shadow-[0_30px_58px_-32px_rgba(69,42,16,.78),0_6px_16px_-8px_rgba(69,42,16,.32)]",
        className,
      )}
      aria-label={`${title}封面`}
    >
      <svg viewBox="0 0 300 450" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="treehole-cover-paper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f8f2e2" />
            <stop offset=".58" stopColor="#eee0c6" />
            <stop offset="1" stopColor="#e0cfad" />
          </linearGradient>
          <linearGradient id="treehole-cover-cloud-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".72" />
            <stop offset="1" stopColor="#d7cbb6" stopOpacity=".3" />
          </linearGradient>
          <linearGradient id="treehole-cover-wind" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#bc8f55" />
            <stop offset=".5" stopColor="#8b6a45" />
            <stop offset="1" stopColor="#5d5040" />
          </linearGradient>
        </defs>
        <rect width="300" height="450" fill="url(#treehole-cover-paper)" />
        <path d="M293 54c60-16 119 4 164 42-50-6-98 2-144 18-32 10-66 4-86-16 16-22 40-36 66-44z" fill="url(#treehole-cover-cloud-a)" opacity={windCloud ? 1 : .28} />
        <path d="M272 203c78-20 154 2 212 48-62-8-124 2-180 22-42 14-84 4-108-20 26-26 54-40 76-50z" fill="#f7fbff" opacity={windCloud ? .42 : .18} />
        <path d="M299 737c58-14 118 4 159 42-50-8-97 0-141 16-32 10-66 4-85-16 17-22 40-34 67-42z" fill="url(#treehole-cover-cloud-a)" opacity=".7" />
        <g fill="none" stroke="url(#treehole-cover-wind)" strokeLinecap="round" opacity={windCloud ? 1 : .28}>
          <path d="M51 206c81-36 175-40 275-16 62 16 118 10 170-16" strokeWidth="4.3" opacity=".56" />
          <path d="M34 307c107-40 227-42 333-12 60 16 114 10 160-14" strokeWidth="2.3" opacity=".31" />
          <path d="M69 628c88-32 192-36 285-14 54 14 104 10 150-12" strokeWidth="3.6" opacity=".35" />
        </g>
        {elements.slice(0, 5).map((element, index) => (
          <path
            key={element}
            d={
              [
                "M301 373c62-20 126 6 158 52-60-12-118-4-172 14-36 12-74 2-94-22 26-24 64-36 108-44z",
                "M307 448c56-16 116 4 148 44-56-10-110-2-160 14-34 10-70 2-88-20 24-22 60-32 100-38z",
                "M313 522c52-14 108 4 138 40-52-10-102-2-150 14-32 10-66 2-82-18 24-22 56-30 94-36z",
                "M318 592c48-12 100 4 128 36-48-8-94-2-138 12-15 5-31 1-38-8 11-10 26-14 43-16z",
                "M322 624c42-10 89 4 113 33-43-7-83-1-122 11-13 4-27 1-33-7 10-9 23-12 37-14z",
              ][index]
            }
            fill={elementColors[element] ?? "#b98539"}
            opacity=".84"
          />
        ))}
        <path d="M206 552c-44-14-78-48-86-94-8-44 14-90 56-116 38-24 88-26 128-6 46 22 72 70 64 118-6 42-32 78-70 96" fill="#463626" opacity=".89" />
        <path d="M180 510c-10-24-2-52 16-68 18-16 46-18 66-4 22 16 30 44 20 70-10 28-40 44-68 38" fill="#2b2118" />
        <path d="M194 496c-4-16 2-32 16-40 14-8 32-4 42 8 10 14 8 32-4 42" fill="#f8dda3" opacity=".76" />
        <rect x="24" y="20" width="252" height="410" fill="none" stroke="#8b765d" strokeWidth=".8" opacity=".18" />
      </svg>
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[18px] bg-gradient-to-r from-[rgba(72,46,19,.5)] via-[rgba(72,46,19,.14)] to-transparent"
      />
      <span
        aria-hidden
        className="absolute inset-y-[5px] right-0 w-2 rounded-r-lg bg-[repeating-linear-gradient(180deg,#f6ebd6_0_2px,#d6c4a1_2px_3px)] shadow-[-2px_0_5px_rgba(86,56,24,.22)]"
      />
      <span className="absolute left-[50px] top-[48px] [writing-mode:vertical-rl] font-handwriting text-[clamp(20px,7cqw,40px)] leading-[1.08] tracking-[.09em] text-[#383021] drop-shadow-[0_1px_0_rgba(255,255,255,.55)]">
        {title}
      </span>
      <span className="absolute right-[28px] top-[158px] [writing-mode:vertical-rl] text-xs font-medium tracking-[.28em] text-[#6f5e46]">
        {author} 著
      </span>
    </div>
  )
}
