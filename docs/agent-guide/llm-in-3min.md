# LLM 原理 3 分钟

> 一张图 + 一个旋钮 + 一条推论。不讲数学。

## 全部原理就这条流水线


<figure>
<svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="LLM 生成流水线：Prompt 切成 token 后循环生成，温度控制随机性，直到结束">
<defs>
<marker id="llm-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#8A7A5E"/>
</marker>
<marker id="llm-arr-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#C9973F"/>
</marker>
</defs>
<rect width="800" height="300" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="298" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<!-- 主流水线（上排） -->
<rect x="24" y="24" width="120" height="52" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="84" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">你的 Prompt</text>
<text x="84" y="64" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">一段文字</text>
<line x1="144" y1="50" x2="172" y2="50" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#llm-arr)"/>
<rect x="176" y="24" width="110" height="52" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<text x="231" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">切成 token</text>
<text x="231" y="64" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">最小字块</text>
<line x1="286" y1="50" x2="314" y2="50" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#llm-arr)"/>
<rect x="318" y="24" width="160" height="52" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1.5"/>
<text x="398" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">算出概率分布</text>
<text x="398" y="64" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">下一个词的可能性</text>
<line x1="478" y1="50" x2="506" y2="50" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#llm-arr)"/>
<rect x="510" y="24" width="130" height="52" rx="10" fill="#FEF3EB" stroke="#E8C9B0" stroke-width="1.5"/>
<text x="575" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">吐出 1 个 token</text>
<text x="575" y="64" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">一个字一个字长</text>
<line x1="640" y1="50" x2="668" y2="50" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#llm-arr)"/>
<rect x="672" y="24" width="104" height="52" rx="10" fill="#E8F5E8" stroke="#A8C9A8" stroke-width="1.5"/>
<text x="724" y="48" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C5232">完整回答</text>
<text x="724" y="64" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">生成结束</text>
<!-- 温度分支（中排） -->
<text x="398" y="110" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#C9973F">温度旋钮</text>
<line x1="340" y1="76" x2="340" y2="120" stroke="#C9973F" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="456" y1="76" x2="456" y2="120" stroke="#C9973F" stroke-width="1.5" stroke-dasharray="4,3"/>
<rect x="248" y="120" width="180" height="44" rx="10" fill="#F5F1E8" stroke="#C9BFA8"/>
<text x="338" y="140" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#2C2416">温度 = 0</text>
<text x="338" y="156" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">永远选最高概率 · 确定性</text>
<rect x="448" y="120" width="180" height="44" rx="10" fill="#FDF0E7" stroke="#E0B498"/>
<text x="538" y="140" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#2C2416">温度高</text>
<text x="538" y="156" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">偶尔选低概率 · 有花样</text>
<!-- 循环箭头（下排） -->
<path d="M 575 76 L 575 220 L 398 220 L 398 84" fill="none" stroke="#C9973F" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#llm-arr-gold)"/>
<rect x="420" y="200" width="130" height="24" rx="12" fill="#FDF5E6" stroke="#DBCB9A"/>
<text x="485" y="216" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#C9973F">还没结束 → 再来一轮</text>
<!-- 底部注释 -->
<text x="400" y="272" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">逐 token 生成 · 每次都是概率 · 没有查资料这个动作</text>
</svg>
</figure>

记住三个要点：

1. **逐 token 生成**——你看到的"流式输出"不是网速快，是它本来就是一个字一个字长出来的
2. **每次选择都是概率**——所以同一问题两个答案不是 bug，是机制
3. **它没有"查资料"这个动作**——每个字都是从概率里"续写"出来的，事实性没有任何保证

## 一条重要推论：幻觉为什么必然

> 模型是续写机器，不是查询机器。
> 你问它不知道的事，它不会返回 404，它会**续写一个格式完美的答案**。

| 你问 | 它的内在动作 | 结果 |
|---|---|---|
| "JS 是什么" | 训练里见过一万次 | 答得好 |
| "我们公司报销流程" | 没见过 → 续写一个"像样的" | **一本正经胡说** |
| "19.7 × 24.3" | 逐字续写数字 | 大概率算错 |

对号入座三个解法：**私有知识 → RAG**（先检索再答）；**精确计算 → 工具调用**（交给代码）；**要引用 → 强制溯源**（只准基于检索结果回答）。

## 温度就是唯一的"创意旋钮"

| | 温度 0 | 温度高 |
|---|---|---|
| 行为 | 永远选最稳的词 | 给冷门词机会 |
| 用在 | 代码 / JSON / 分类 | 文案 / 起名 |
| 常见坑 | 以为 = 确定性（≠，仍有微小抖动） | 以为更聪明（只是更跳） |

## 推理模型：先打草稿的一类

| | 普通模型（V3 / 4o） | 推理模型（R1 / o 系列） |
|---|---|---|
| 打草稿 | ❌ 脱口而出 | ✅ 先生成思维链 |
| 贵/慢 | 便宜快 | 贵且慢 |
| 值得用 | 抽取/分类/改写 | 多步推理/复杂调试/方案比选 |

工程上常见做法：**普通模型当路由，难题升级给推理模型**。

→ 账单和窗口的直觉：[上下文与账单](/guides/agent-guide/context-bill)
