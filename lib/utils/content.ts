/**
 * 内容渲染辅助工具
 */

/**
 * 剥离 markdown 正文开头的首个 H1（可能紧跟一条引用行之上/之下的空行一并清理）。
 *
 * 为什么需要：电子书章节 / 树洞长文的 md 源文件习惯以 `# 标题` 开头，
 * 而页面模板已经渲染了标题 H1 与描述——正文再出一个 H1 就是"双标题"。
 * 在渲染层统一剥离（不改内容文件），博文等其他使用方不受影响。
 */
export function stripLeadingH1(content: string): string {
  const stripped = content
    .replace(/^\s*#\s+[^\n]*\n/, "") // 首个 # 标题行
    .replace(/^\n+/, "") // 其后的空行
  return stripped
}
