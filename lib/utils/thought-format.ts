/**
 * 碎碎念内容排版工具
 *
 * 场景：admin 端可能随手输入一长段没换行的话，存进 DB 直接展示会很长一行、
 * 失去手记的「诗化短行」气质。保存时调用 formatThoughtContent 做轻量智能断句，
 * blog 端按换行（whitespace-pre-wrap）自然居中成行。
 *
 * 规则（保守，不强加风格）：
 * 1. 先按用户已有的换行 / 空行分段，尊重作者本意。
 * 2. 段内再按中文句末标点（。！？）断句，每句独占一行。
 * 3. 单行若过长（> maxChars，默认 22），按逗号 / 分号再切，尽量不破坏语义。
 * 4. 连续空行折叠为单个空行；移除行首尾空白。
 *
 * 这是「保存时规整」，原文含义不变，只调视觉节奏。
 */

const SENTENCE_END = /([。！？!?])/g
const SOFT_PAUSE = /([，,；;])/g

/**
 * 把一段文本按句末标点断成多行，标点保留在句尾。
 * "今天很好。虽然什么都没发生。" → ["今天好。", "虽然什么都没发生。"]
 */
function splitBySentence(text: string): string[] {
  if (!text.trim()) return []
  // 用正则切：保留分隔符
  const parts = text.split(SENTENCE_END).filter(Boolean)
  const sentences: string[] = []
  for (let i = 0; i < parts.length; i += 2) {
    const head = parts[i] ?? ""
    const punct = parts[i + 1] ?? ""
    const s = (head + punct).trim()
    if (s) sentences.push(s)
  }
  // 若整段没有句末标点，split 会返回原文整体 → 返回单元素
  if (sentences.length === 0 && text.trim()) return [text.trim()]
  return sentences
}

/** 单行过长时按逗号/分号再切 */
function wrapLongLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line]
  const parts = line.split(SOFT_PAUSE).filter(Boolean)
  if (parts.length <= 1) return [line] // 没有软停顿，不再强行切
  const out: string[] = []
  let cur = ""
  for (let i = 0; i < parts.length; i += 2) {
    const frag = (parts[i] ?? "") + (parts[i + 1] ?? "")
    if ((cur + frag).length > maxChars && cur) {
      out.push(cur.trim())
      cur = frag
    } else {
      cur += frag
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

/**
 * 主入口：规整碎碎念内容。
 * @param raw 原始输入
 * @param maxChars 单行最大字数（默认 22）
 */
export function formatThoughtContent(raw: string, maxChars = 22): string {
  if (!raw) return ""
  const normalized = raw.replace(/\r\n/g, "\n")
  // 按空行分段（一段内可能多句）
  const paragraphs = normalized.split(/\n\s*\n/)

  const formattedParas: string[] = []
  for (const para of paragraphs) {
    // 段内若用户已手动换行，逐行处理；否则按句末标点断句
    const userLines = para.split("\n").map((l) => l.trim()).filter(Boolean)
    const lines: string[] = []
    for (const ul of userLines) {
      const sentences = splitBySentence(ul)
      for (const s of sentences) {
        lines.push(...wrapLongLine(s, maxChars))
      }
    }
    if (lines.length) formattedParas.push(lines.join("\n"))
  }

  return formattedParas.join("\n\n")
}
