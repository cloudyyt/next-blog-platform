export interface TreeholeAdminConfig {
  title: string
  author: string
  subtitle: string
  description: string
  coverStyle: string
  defaultView: string
}

export interface TreeholeAdminEntry {
  id: string
  slug: string
  sectionId: string
  kind: "article" | "note"
  title: string | null
  excerpt: string | null
  content: string
  weather: string | null
  date: string
  published: boolean
  order: number
}

export interface TreeholeAdminSection {
  id: string
  slug: string
  element: string
  title: string
  tone: string
  plannedTitles: string
  published: boolean
  order: number
  entries: TreeholeAdminEntry[]
}

export const treeholeElementOptions = [
  { value: "spring", label: "春" },
  { value: "summer", label: "夏" },
  { value: "autumn", label: "秋" },
  { value: "winter", label: "冬" },
  { value: "wind", label: "风" },
  { value: "cloud", label: "云" },
  { value: "rain", label: "雨" },
  { value: "snow", label: "雪" },
] as const

export function elementLabel(value: string) {
  return treeholeElementOptions.find((item) => item.value === value)?.label ?? value
}
