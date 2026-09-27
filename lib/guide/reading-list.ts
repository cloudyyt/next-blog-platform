/**
 * 书房「我在读」书单（配置驱动）
 *
 * 展示博主手边真实在读/读完的书：竖色脊 + 一句话短评。
 * 新增/修改一本书只需在数组里加一行；link 用豆瓣搜索链接（无需维护具体条目 ID）。
 */

export interface ReadingBook {
  title: string
  author: string
  /** 一句话短评（书房口吻，不写官方简介） */
  comment: string
  status: "reading" | "done"
  /** 书脊色（Tailwind 任意值用） */
  color: string
  /** 外链（豆瓣搜索，防条目失效） */
  link: string
}

const douban = (q: string) =>
  `https://search.douban.com/book/subject_search?search_text=${encodeURIComponent(q)}`

export const READING_LIST: ReadingBook[] = [
  {
    title: "代码整洁之道",
    author: "Robert C. Martin",
    comment: "重读第二遍。这次最受触动的不是规则本身，而是「代码是写给人看的」这件事需要练习。",
    status: "reading",
    color: "#3E7C6B",
    link: douban("代码整洁之道"),
  },
  {
    title: "埃隆·马斯克",
    author: "沃尔特·艾萨克森",
    comment: "把不可能拆成工程问题，再一层层往前拱。当小说读，也当方法读。",
    status: "reading",
    color: "#8A4F3D",
    link: douban("埃隆·马斯克传 艾萨克森"),
  },
]
