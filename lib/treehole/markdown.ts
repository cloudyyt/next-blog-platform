/**
 * 树洞手记 Markdown 归一化。
 *
 * Pages / 备忘录 / IM 粘贴过来的散文常带段首 4 空格缩进；CommonMark 会把它
 * 解析成 indented code block，导致整篇作品前台变成代码块。树洞是生活书，
 * 代码块应通过编辑器 toolbar 生成 fenced code block，因此保存时移除 fenced
 * block 之外的段首缩进，同时保留 fenced block 内的真实缩进。
 */
export function normalizeTreeholeMarkdown(content: string) {
  const normalized = content.replace(/\r\n?/g, "\n")
  const lines = normalized.split("\n")
  let inFencedCode = false

  return lines
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFencedCode = !inFencedCode
        return line
      }

      if (inFencedCode) return line
      // 只移除会把普通段落误判为 indented code block 的 4+ 空格 / tab 缩进。
      return line.replace(/^(?: {4,}|\t+)/, "")
    })
    .join("\n")
}
