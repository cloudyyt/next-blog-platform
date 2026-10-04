# 生态一页纸

> 建坐标系，不背名单。今天记住的结构，比记住的版本号活得久。

## 生态地图

<figure>
<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agent 生态地图：框架层与平台层通过 MCP 协议连接到模型层，底层有观测与向量库支撑">
<defs>
<linearGradient id="eco-bg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#FCF8F0"/><stop offset="1" stop-color="#F8F2E4"/>
</linearGradient>
<marker id="eco-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#8A7A5E"/>
</marker>
</defs>
<rect width="800" height="480" fill="url(#eco-bg)" rx="14"/>
<rect x="1" y="1" width="798" height="478" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<!-- 框架层（左上） -->
<g>
<rect x="24" y="20" width="360" height="130" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1"/>
<rect x="32" y="32" width="5" height="106" rx="2.5" fill="#7A9B6D"/>
<text x="52" y="50" font-family="sans-serif" font-size="15" font-weight="700" fill="#2C2416">开发框架</text>
<text x="52" y="68" font-family="sans-serif" font-size="10.5" fill="#8A7A5E">代码积木 · 正经开发</text>
<rect x="52" y="80" width="160" height="24" rx="12" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="132" y="96" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2A3420">LangChain / LangGraph</text>
<rect x="222" y="80" width="130" height="24" rx="12" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="287" y="96" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2A3420">LlamaIndex</text>
<rect x="52" y="112" width="160" height="24" rx="12" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="132" y="128" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#4A5E3E">CrewAI · OpenAI SDK</text>
<rect x="222" y="112" width="130" height="24" rx="12" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="287" y="128" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5E3E">偏 RAG 场景 ↑</text>
</g>
<!-- 平台层（右上） -->
<g>
<rect x="416" y="20" width="360" height="130" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1"/>
<rect x="424" y="32" width="5" height="106" rx="2.5" fill="#C9973F"/>
<text x="444" y="50" font-family="sans-serif" font-size="15" font-weight="700" fill="#2C2416">低代码平台</text>
<text x="444" y="68" font-family="sans-serif" font-size="10.5" fill="#8A7A5E">可视化搭建 · 快速 demo</text>
<rect x="444" y="80" width="160" height="24" rx="12" fill="#F5E8CE" stroke="#D4B880"/>
<text x="524" y="96" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#3A2E1E">Dify（开源可自部署）</text>
<rect x="614" y="80" width="120" height="24" rx="12" fill="#F5E8CE" stroke="#D4B880"/>
<text x="674" y="96" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#3A2E1E">Coze · n8n</text>
<rect x="444" y="112" width="160" height="24" rx="12" fill="#F5E8CE" stroke="#D4B880"/>
<text x="524" y="128" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B5540">入门建全局观 →</text>
</g>
<!-- 连接线：框架/平台 → MCP -->
<line x1="204" y1="150" x2="204" y2="172" stroke="#8A7A5E" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#eco-arr)"/>
<line x1="596" y1="150" x2="596" y2="172" stroke="#8A7A5E" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#eco-arr)"/>
<!-- MCP 协议层（中心横条） -->
<g>
<rect x="104" y="176" width="592" height="36" rx="18" fill="#E8D5C4" stroke="#C4956A" stroke-width="1.5"/>
<text x="400" y="199" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#6B4226">MCP 协议 — 工具接入的 USB-C · 2026 事实标准</text>
</g>
<!-- 连接线：MCP → 模型层 -->
<line x1="204" y1="212" x2="204" y2="234" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#eco-arr)"/>
<line x1="596" y1="212" x2="596" y2="234" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#eco-arr)"/>
<!-- 模型层（基座） -->
<g>
<rect x="24" y="240" width="752" height="120" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1"/>
<rect x="32" y="252" width="5" height="96" rx="2.5" fill="#5B7FA6"/>
<text x="52" y="272" font-family="sans-serif" font-size="15" font-weight="700" fill="#2C2416">模型（智能的来源）</text>
<text x="52" y="290" font-family="sans-serif" font-size="10.5" fill="#8A7A5E">永远只当 API 用 · 不碰训练</text>
<rect x="52" y="302" width="330" height="24" rx="12" fill="#DCE6EF" stroke="#94B0C8"/>
<text x="217" y="318" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1E2E3E">国内 · DeepSeek · Qwen · GLM · Kimi</text>
<rect x="394" y="302" width="310" height="24" rx="12" fill="#DCE6EF" stroke="#94B0C8"/>
<text x="549" y="318" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1E2E3E">海外 · GPT · Claude · Gemini</text>
</g>
<!-- 支撑层（底部条） -->
<g>
<rect x="24" y="380" width="752" height="76" rx="10" fill="#F5F1E8" stroke="#C9BFA8" stroke-width="1" stroke-dasharray="6,3"/>
<text x="400" y="406" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#8A7A5E">支撑设施</text>
<rect x="130" y="418" width="230" height="24" rx="12" fill="#EDE8DB" stroke="#C9BFA8"/>
<text x="245" y="434" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#5A4E38">观测 · Langfuse · LangSmith</text>
<rect x="376" y="418" width="230" height="24" rx="12" fill="#EDE8DB" stroke="#C9BFA8"/>
<text x="491" y="434" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#5A4E38">向量库 · Milvus · PGVector</text>
</g>
<!-- 标注：协议贯穿 -->
<text x="712" y="198" font-family="sans-serif" font-size="9" fill="#A08868" text-anchor="end">贯穿框架与平台</text>
</svg>
</figure>

## 选型速查（先记住"默认答案"）

| 问题 | 默认答案 | 什么时候换 |
|---|---|---|
| 用什么模型起步 | **DeepSeek**（便宜 + 国内直连 + 兼容 OpenAI 协议） | 要特定能力再换，代码别绑死单一厂商 |
| 入门平台 | **Dify**（开源可自部署，流程可视化） | Coze 适合更快做 bot |
| 代码框架 | **LangChain → LangGraph**（生态最大，JD 高频） | 重 RAG 场景看 LlamaIndex |
| 工具接入 | **MCP**（写一次到处用，2026 事实标准） | 简单场景原生 FC 更轻 |
| 观测 | Langfuse（开源自部署）/ LangSmith（官方） | 起步可先日志凑合 |
| 向量库 | **PGVector**（已有 Postgres 就别引入新组件） | 规模大了换 Milvus |

## 三个 2026 年的行业事实

1. **MCP 赢了工具协议之战**——月下载近亿、数千个 Server，连安全机构都出了指南。新项目别再写一次性胶水
2. **LangGraph 是生产级编排的事实标准**——复杂流程（循环/审批/多 Agent）的默认选择
3. **Vite 都被 Cloudflare 收了**——基础工具养不活自己是行业常态；选型时优先看治理健康度，不只看 star 数

## 心法

> **框架半年一换代，机制十年不变。** 学每一层时问自己：这层解决什么问题、不解决什么问题——这比背 API 活得久。

→ 收尾行动：[前端转岗 90 天路线](/guides/agent-guide/roadmap-90d)
