export type InspirationItemType = "text" | "image" | "audio"
export type InspirationItemStatus = "inbox" | "topic" | "draft" | "incubated" | "archived"
export type InspirationTopicStatus = "growing" | "draft" | "published" | "archived"

export interface InspirationTopicSummary {
  id: string
  title: string
  description: string | null
  status: InspirationTopicStatus
  createdAt: string
  updatedAt: string
  itemCount: number
  draftEntry: {
    id: string
    title: string | null
    published: boolean
  } | null
}

export interface InspirationItem {
  id: string
  type: InspirationItemType
  content: string | null
  imageUrl: string | null
  audioUrl: string | null
  audioSeconds: number | null
  tags: string[]
  status: InspirationItemStatus
  source: string
  createdAt: string
  updatedAt: string
  topics: InspirationTopicSummary[]
}

export interface InspirationListResponse {
  items: InspirationItem[]
  topics: InspirationTopicSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UploadedInspirationFile {
  url: string
  key: string
  filename: string
  size: number
}
