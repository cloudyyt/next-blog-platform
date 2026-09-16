/**
 * 树洞（生活区）相关类型
 * 设计见 docs_memo/0917-树洞生活区设计方案.md
 */

/** 分区 */
export interface LifeCategoryView {
  key: string
  name: string
  icon: string
}

/** 帖子（前端视图；title 空 = 短记，有 = 长文） */
export interface LifePostView {
  id: string
  categoryKey: string
  categoryName: string
  /** 长文标题；短记为 null */
  title: string | null
  /** 长文摘要（列表大卡用）；短记为 null */
  description: string | null
  /** markdown 正文 */
  content: string
  /** 图片 URL 数组（短记配图 / 长文封面取第一张） */
  images: string[]
  /** 展示日期 ISO */
  date: string
}

/** 列表条目的额外派生 */
export interface LifeFeedItem extends LifePostView {
  /** 长文列表用摘要（description 或截取正文） */
  excerpt: string
}
