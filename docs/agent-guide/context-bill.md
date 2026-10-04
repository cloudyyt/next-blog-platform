# 上下文与账单

> 两个工程事实：窗口是工作记忆；输入也全款计费。

## 事实一：窗口 = 工作记忆，不是硬盘


<figure>
<svg viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="上下文窗口：窗口内是工作记忆，窗口外彻底忘记，超长会溢出">
<defs>
<linearGradient id="cb-fade" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#EDC9A0" stop-opacity="0.6"/><stop offset="1" stop-color="#EDC9A0" stop-opacity="0"/>
</linearGradient>
</defs>
<rect width="800" height="260" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="258" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<!-- 窗口区（左侧，温暖明亮） -->
<rect x="24" y="24" width="420" height="180" rx="12" fill="#FDF5E6" stroke="#C9973F" stroke-width="2"/>
<text x="234" y="52" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#C9973F">上下文窗口内（工作记忆）</text>
<rect x="48" y="70" width="170" height="34" rx="8" fill="#F5E8CE" stroke="#D4B880"/>
<text x="133" y="91" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2C2416">System 提示</text>
<rect x="234" y="70" width="170" height="34" rx="8" fill="#F5E8CE" stroke="#D4B880"/>
<text x="319" y="91" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2C2416">最近几轮对话</text>
<rect x="48" y="116" width="170" height="34" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="133" y="137" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2A3420">RAG 检索资料</text>
<rect x="234" y="116" width="170" height="34" rx="8" fill="#DCE6EF" stroke="#94B0C8"/>
<text x="319" y="137" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1E2E3E">工具返回结果</text>
<text x="234" y="182" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">桌上摊开的资料 · 收走就忘</text>
<!-- 溢出箭头 -->
<rect x="444" y="80" width="60" height="40" fill="url(#cb-fade)"/>
<path d="M 444 100 L 500 100" stroke="#C9973F" stroke-width="2" stroke-dasharray="6,4"/>
<path d="M 494 94 L 504 100 L 494 106" fill="none" stroke="#C9973F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<text x="472" y="70" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#C9973F">超长溢出</text>
<!-- 窗口外（右侧，灰色淡忘） -->
<rect x="508" y="24" width="268" height="180" rx="12" fill="#F0EDE5" stroke="#C9BFA8" stroke-width="1" stroke-dasharray="6,4"/>
<text x="642" y="52" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="600" fill="#A89878">窗口外 · 彻底忘记</text>
<rect x="532" y="70" width="180" height="34" rx="8" fill="#E8E4DA" stroke="#C9BFA8" stroke-dasharray="4,3"/>
<text x="622" y="91" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#A89878">被截断的早期对话</text>
<rect x="532" y="116" width="180" height="34" rx="8" fill="#E8E4DA" stroke="#C9BFA8" stroke-dasharray="4,3"/>
<text x="622" y="137" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#A89878">没被检索到的文档</text>
<text x="642" y="182" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#B8A98A">不在桌上 = 不存在</text>
<!-- 底部注释 -->
<rect x="24" y="220" width="752" height="26" rx="8" fill="#FEF3EB" stroke="#E8C9B0"/>
<text x="400" y="238" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A6A50">窗口大 ≠ 记得好——中间内容利用率低，关键信息放开头结尾</text>
</svg>
</figure>

推论速查：

| 现象 | 真相 | 对策 |
|---|---|---|
| "聊着聊着忘了开头" | 历史被截断，不是 bug | 记忆管理：摘要 / 关键信息回填 |
| "塞了全量文档还是答不准" | 中间内容利用率低 + 太贵 | 检索定位，**少塞准塞** |
| 模型不知道公司内部知识 | 训练没见过，窗口里也没有 | RAG 注入 |

## 事实二：token = 钱，输入输出都算

一次调用的成本公式：

> **成本 = (输入 token × 输入单价) + (输出 token × 输出单价)**

三个常被忽略的点：

1. **多轮对话是雪球**——第 10 轮时，前 9 轮全部作为输入再计费一遍
2. **输出比输入贵**——主流模型输出单价是输入的 2~4 倍，"让模型少废话"是真实降本手段
3. **RAG 的检索质量 = 成本**——检索不准 → 塞更多文档 → 输入爆炸。**优化检索就是优化账单**

## 一张成本直觉表（量级感知）

| 操作 | token 量级 | 说明 |
|---|---|---|
| 一句问答 | ~500 | 忽略不计 |
| 带 3 段检索资料的回答 | ~3K | RAG 单次常态 |
| 塞一个 50 页 PDF | ~50K+ | 每问一次都付一遍 |
| 10 轮长对话（无记忆管理） | 滚雪球 | 第 10 轮输入 ≈ 全历史 |

## 工程口诀

> **能用检索解决的不塞全量；能放 system 的不放 user；能摘要的不带原文；能要短答的不让它长篇。**

→ 认知差不多了，看真实市场：[国内岗位地图](/guides/agent-guide/job-map)
