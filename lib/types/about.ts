/**
 * 关于页（碎碎念 + 页面配置）相关类型
 */

/**
 * 天气图标 key。
 * 与 components/blog/whisper-timeline.tsx 的 WEATHER_ICONS 映射一一对应，
 * 渲染层据此映射到 lucide 图标。admin 端用下拉选择。
 */
export type WeatherKey =
  | "sunny"
  | "cloudy"
  | "partly-cloudy"
  | "overcast"
  | "rain"
  | "drizzle"
  | "thunder"
  | "snow"
  | "fog"
  | "wind"
  | "clear-night"

/** 合法天气 key 白名单（API 校验用） */
export const WEATHER_KEYS: WeatherKey[] = [
  "sunny",
  "cloudy",
  "partly-cloudy",
  "overcast",
  "rain",
  "drizzle",
  "thunder",
  "snow",
  "fog",
  "wind",
  "clear-night",
]

/** 天气 key → 中文标签（admin 下拉用） */
export const WEATHER_LABELS: Record<WeatherKey, string> = {
  sunny: "晴",
  cloudy: "多云",
  "partly-cloudy": "晴间多云",
  overcast: "阴",
  rain: "雨",
  drizzle: "小雨",
  thunder: "雷阵雨",
  snow: "雪",
  fog: "雾",
  wind: "大风",
  "clear-night": "晴夜",
}

/** 碎碎念（前端展示用，日期为 ISO 串） */
export interface Thought {
  id: string
  content: string
  weather: WeatherKey | null
  published: boolean
  createdAt: string
  updatedAt: string
}

/** 关于页配置（singleton；不含 id/updatedAt，仅业务字段） */
export interface AboutConfig {
  tagline: string | null
  intro: string | null
}

/** AboutConfig 默认值（singleton 缺失时 fallback） */
export const DEFAULT_ABOUT_CONFIG: AboutConfig = {
  tagline: "不追热点，只写自己走过的路。",
  intro: "你好，欢迎来到我的树洞。\n\n这里没有精心打磨的教程，也没有非说不可的大道理。只是一个普通人在写字——记录走过的路、想不通的事，和那些转瞬即逝的小心情。\n\n技术文章写在另一边，这里留给更柔软的部分。如果你也偶尔有些话无处安放，那么，我们或许算同行一段。",
}
