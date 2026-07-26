/**
 * 内联 SVG 渲染支持 —— react-markdown components 映射
 *
 * 为什么不用 rehype-sanitize 放行 SVG：
 *   rehype-sanitize 默认 schema 不处理 SVG 命名空间（foreign namespace），
 *   即使把 svg/rect/text 加进 tagNames，sanitize 仍会把整个 <svg> 当非法删掉，
 *   只留子元素的文字残骸。自定义 SVG-aware schema 复杂且脆弱。
 *
 * 本方案（采纳）：
 *   PostContent 只渲染博主（admin 鉴权后写入 DB）的内容，非用户输入，XSS 风险极低。
 *   所以只用 rehype-raw 解析原始 HTML/SVG，不接 sanitize；
 *   转而在 react-markdown 的 components 里把 SVG 白名单标签透传为对应小写元素，
 *   既能渲染 SVG，又有标签级白名单防护（不在白名单的标签，如 script，不渲染）。
 *
 * 文档见 docs/0725-oss-接入调研与接入草案.md。
 */

/**
 * 允许渲染的 SVG 标签白名单（小写）。
 * 不在白名单的标签会被 react-markdown 忽略（不渲染），起到基础防护作用。
 */
export const ALLOWED_SVG_TAGS = [
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "defs",
  "linearGradient",
  "radialGradient",
  "stop",
  "marker",
  "use",
  "symbol",
  "title",
  "desc",
] as const

/**
 * figure / figcaption 不是 SVG 标签，但常和 SVG 一起用做图文容器。
 * 单独列出（react-markdown 默认会渲染 figure/figcaption，无需映射，
 * 这里导出仅用于文档说明）。
 */
export const FIGURE_TAGS = ["figure", "figcaption"] as const
