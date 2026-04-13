export const SITE_PROFILE = {
  site: {
    title: "大胖天的树洞",
    tagline: "写下学习路上的小收获，也留住生活里的小心情。",
    topics: ["前端与全栈", "工程化", "生活随笔"],
  },
  copy: {
    filterTagPrefix: "此刻在读：",
    filterCategoryPrefix: "这一页的主题：",
    heroOneLiner: "慢慢写，慢慢变好。",
  },
  author: {
    name: "大胖天",
    role: "记录者 · 全栈学习中",
    sidebarPromise: "不追热点，只写自己走过的路。",
    sidebarNote: "写给未来的自己，也写给路过的你。",
  },
  links: {
    about: "/blog/about",
    rss: "/blog/feed.xml",
    randomPost: "/api/blog/random",
  },
} as const

