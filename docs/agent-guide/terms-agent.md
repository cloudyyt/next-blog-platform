# 核心术语卡：Agent 与 RAG

> 第二叠卡：从"能对话"到"能干活"的那些词。

## 🃏 Function Calling（函数/工具调用）

- **是什么**：模型不直接执行代码，它**输出"我想调用某工具+参数"的 JSON**，你的代码执行后把结果喂回去
- **前端类比**：模型是产品经理（写工单），你的代码是程序员（干活回填）
- **循环**：模型要工具 → 你执行 → 结果回填 → 模型继续 → ……直到给出最终答案


<figure>
<svg viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Function Calling 时序：用户提问，模型决定调用工具，工具返回结果，模型组织回答">
<defs>
<marker id="fc-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#5B7FA6"/>
</marker>
<marker id="fc-arr-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#C9973F"/>
</marker>
</defs>
<rect width="800" height="260" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="258" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<!-- 三个参与者 -->
<rect x="80" y="20" width="120" height="36" rx="18" fill="#EDF2F7" stroke="#5B7FA6" stroke-width="1.5"/>
<text x="140" y="43" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">用户</text>
<rect x="340" y="20" width="120" height="36" rx="18" fill="#FDF5E6" stroke="#C9973F" stroke-width="1.5"/>
<text x="400" y="43" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">模型</text>
<rect x="600" y="20" width="120" height="36" rx="18" fill="#F0F5EE" stroke="#7A9B6D" stroke-width="1.5"/>
<text x="660" y="43" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">你的工具</text>
<!-- 生命线 -->
<line x1="140" y1="56" x2="140" y2="230" stroke="#D4C9A9" stroke-width="1" stroke-dasharray="4,4"/>
<line x1="400" y1="56" x2="400" y2="230" stroke="#D4C9A9" stroke-width="1" stroke-dasharray="4,4"/>
<line x1="660" y1="56" x2="660" y2="230" stroke="#D4C9A9" stroke-width="1" stroke-dasharray="4,4"/>
<!-- 消息 1: 用户→模型 -->
<line x1="140" y1="84" x2="396" y2="84" stroke="#5B7FA6" stroke-width="2" marker-end="url(#fc-arr)"/>
<rect x="160" y="66" width="216" height="20" rx="4" fill="#EDF2F7"/>
<text x="268" y="80" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2C2416">① 今晚北京适合跑步吗</text>
<!-- 消息 2: 模型→工具 -->
<line x1="400" y1="124" x2="656" y2="124" stroke="#C9973F" stroke-width="2" marker-end="url(#fc-arr-gold)"/>
<rect x="420" y="106" width="216" height="20" rx="4" fill="#FDF5E6"/>
<text x="528" y="120" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6B4226">② getWeather("北京")</text>
<!-- 消息 3: 工具→模型 -->
<line x1="660" y1="164" x2="404" y2="164" stroke="#7A9B6D" stroke-width="2" marker-end="url(#fc-arr)"/>
<rect x="424" y="146" width="216" height="20" rx="4" fill="#F0F5EE"/>
<text x="532" y="160" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2A3420">③ 18°C 空气优</text>
<!-- 消息 4: 模型→用户 -->
<line x1="400" y1="204" x2="144" y2="204" stroke="#C9973F" stroke-width="2" marker-end="url(#fc-arr-gold)"/>
<rect x="164" y="186" width="216" height="20" rx="4" fill="#FDF5E6"/>
<text x="272" y="200" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6B4226">④ 适合，建议傍晚去</text>
<!-- 底部注释 -->
<text x="400" y="242" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">模型不执行代码 · 它输出「想调用什么工具」的 JSON · 你的代码执行后把结果喂回去</text>
</svg>
</figure>

## 🃏 Agent（智能体）

- **是什么**：LLM + 工具 + 记忆 + 循环，能**自主决定下一步**干什么的程序
- **一句话**：会自己拆任务、选工具、看到结果再决定的对话循环
- **误区**：Agent ≠ 更聪明的 chatbot，而是**给模型加了手（工具）和短期记忆（上下文管理）**

## 🃏 ReAct

- **是什么**：最经典的 Agent 模式——**Rea**son（想）→ **Act**（做）→ Observe（看结果）循环
- 前端类比：`while (!done) { 想; 做; 看结果 }`
- LangChain 默认起步范式，LangGraph 就是把这个循环画成图来管

## 🃏 Embedding（嵌入向量）

- **是什么**：把文字变成一串数字（向量），**语义相近 → 距离相近**
- **前端类比**：给每段文字一个"语义坐标"，`{ king } - { man } + { woman } ≈ { queen }`
- **用途**：算相似度 = 搜索的底层

## 🃏 向量数据库

- **是什么**：专门存向量、按"语义距离"高速检索的库（Milvus / PGVector / Qdrant…）
- **前端类比**：普通数据库按主键精确查；向量库按**意思**模糊查——"退货流程"能搜到"如何退货"
- **误区**：不是更高级的 MySQL，是另一种查询范式（相似度，不是精确匹配）

## 🃏 RAG（检索增强生成）

- **是什么**：先检索资料 → 塞进上下文 → 模型**基于资料**回答。给模型外挂一个随时翻的书架
- **为什么**：模型不知道你公司的私有知识；微调又贵又慢；RAG 即插即用
- **一句话本质**：**RAG = 升级版的搜索 + 用模型的话把结果讲出来**

## 🃏 微调（Fine-tuning）

- **是什么**：用你的数据继续训练模型，改变它的行为/风格/领域偏向
- **和 RAG 的分工**（面试高频）：

| | RAG | 微调 |
|---|---|---|
| 改的是 | 模型**看到的**（知识） | 模型**本身**（行为/风格） |
| 成本 | 低，即时生效 | 高，需要训练 |
| 更新知识 | 改文档就行 | 重新训练 |
| 典型场景 | 企业知识库 | 固定输出格式/领域语气 |

- 应用岗认知即可，**别在简历上吹微调除非真做过**

## 🃏 MCP（Model Context Protocol）

- **是什么**：工具接入的统一协议——"AI 界的 USB-C"，Anthropic 开源，已成事实标准
- **解决什么**：以前每个应用 × 每个工具都要写一遍胶水；MCP 之后**工具写一次，所有 Agent 都能用**
- 生态：数千个现成 MCP Server（GitHub、数据库、浏览器……），LangChain/Dify 均已原生支持

## 自测

`RAG 和微调分别改模型的什么？`——能秒答这题，两叠术语卡就毕业了。

→ 想知道这一切底下怎么转：[LLM 原理 3 分钟](/guides/agent-guide/llm-in-3min)
