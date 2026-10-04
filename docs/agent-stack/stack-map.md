# 一张图看懂 Agent 技术栈

> 姊妹篇《认知地图》教你"名词各归其位"，这一章回答工程师视角的问题：**每一层替你做了什么、不做什么，岗位面试怎么考，这本书怎么带你走完全程。**

## 为什么从这张图开始

面试官最爱问的不是"你会不会用 Dify"，而是：

> "这个需求你为什么选平台、为什么选框架、什么时候必须自己写代码？"

答不上取舍 = 只会跑 demo。下面这张图就是取舍的坐标系。

## 分层全景（2026 版）

<figure>
<svg viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agent 技术栈：应用层到模型层的主干，平台层（Dify）作为侧路替代大部分手写">
<defs>
<marker id="sm-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#8A7A5E"/>
</marker>
<marker id="sm-arr-dash" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#C9973F"/>
</marker>
</defs>
<rect width="800" height="520" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="518" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<!-- APP 层 -->
<g>
<rect x="24" y="20" width="500" height="90" rx="10" fill="#FEF3EB" stroke="#E8C9B0" stroke-width="1"/>
<rect x="32" y="30" width="5" height="70" rx="2.5" fill="#D4744C"/>
<text x="52" y="48" font-family="sans-serif" font-size="14" font-weight="700" fill="#2C2416">你的应用</text>
<rect x="52" y="60" width="210" height="28" rx="8" fill="#F8E3D5" stroke="#E0B498"/>
<text x="157" y="78" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#3A2E1E">前端交互 · 流式 UI · 会话状态</text>
<rect x="274" y="60" width="210" height="28" rx="8" fill="#F8E3D5" stroke="#E0B498"/>
<text x="379" y="78" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#3A2E1E">业务后端 · NestJS / Next.js</text>
<text x="490" y="48" text-anchor="end" font-family="sans-serif" font-size="9" fill="#D4744C">← 你的前端强项</text>
</g>
<line x1="274" y1="110" x2="274" y2="128" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#sm-arr)"/>
<!-- 编排层 -->
<g>
<rect x="24" y="132" width="500" height="90" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1"/>
<rect x="32" y="142" width="5" height="70" rx="2.5" fill="#C9973F"/>
<text x="52" y="160" font-family="sans-serif" font-size="14" font-weight="700" fill="#2C2416">编排层 · LangGraph 1.x</text>
<rect x="52" y="172" width="140" height="28" rx="8" fill="#F5E8CE" stroke="#D4B880"/>
<text x="122" y="190" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#3A2E1E">StateGraph · 状态/路由</text>
<rect x="202" y="172" width="150" height="28" rx="8" fill="#F5E8CE" stroke="#D4B880"/>
<text x="277" y="190" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#3A2E1E">中断 · 人工审批 · 检查点</text>
<rect x="362" y="172" width="130" height="28" rx="8" fill="#F5E8CE" stroke="#D4B880"/>
<text x="427" y="190" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#3A2E1E">多 Agent 协作</text>
</g>
<line x1="274" y1="222" x2="274" y2="240" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#sm-arr)"/>
<!-- 框架层 -->
<g>
<rect x="24" y="244" width="500" height="90" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1"/>
<rect x="32" y="254" width="5" height="70" rx="2.5" fill="#7A9B6D"/>
<text x="52" y="272" font-family="sans-serif" font-size="14" font-weight="700" fill="#2C2416">框架层 · LangChain 1.0</text>
<rect x="52" y="284" width="140" height="28" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="122" y="302" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#2A3420">createAgent · 标准建法</text>
<rect x="202" y="284" width="140" height="28" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="272" y="302" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#2A3420">工具调用 · MCP</text>
<rect x="352" y="284" width="140" height="28" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="422" y="302" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#2A3420">记忆 · RAG 组件</text>
</g>
<line x1="274" y1="334" x2="274" y2="352" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#sm-arr)"/>
<!-- 模型层 -->
<g>
<rect x="24" y="356" width="500" height="90" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1"/>
<rect x="32" y="366" width="5" height="70" rx="2.5" fill="#5B7FA6"/>
<text x="52" y="384" font-family="sans-serif" font-size="14" font-weight="700" fill="#2C2416">模型层</text>
<rect x="52" y="396" width="440" height="28" rx="8" fill="#DCE6EF" stroke="#94B0C8"/>
<text x="272" y="414" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1E2E3E">DeepSeek · Qwen · GPT · Claude</text>
</g>
<!-- 平台层（右侧独立列） -->
<g>
<rect x="556" y="180" width="220" height="160" rx="10" fill="#FDF0E7" stroke="#C4956A" stroke-width="1.5" stroke-dasharray="8,4"/>
<rect x="564" y="192" width="5" height="136" rx="2.5" fill="#C4956A"/>
<text x="584" y="214" font-family="sans-serif" font-size="14" font-weight="700" fill="#6B4226">平台层</text>
<text x="584" y="232" font-family="sans-serif" font-size="10" fill="#8A7A5E">Dify 2.x · 可视化搭建</text>
<rect x="584" y="244" width="170" height="26" rx="8" fill="#F8E8D8" stroke="#D4A878"/>
<text x="669" y="261" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B4226">Chatflow / Workflow</text>
<rect x="584" y="278" width="170" height="26" rx="8" fill="#F8E8D8" stroke="#D4A878"/>
<text x="669" y="295" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B4226">知识库 · 知识流水线</text>
</g>
<!-- 平台层虚线连接 -->
<path d="M 556 290 L 524 290" fill="none" stroke="#C9973F" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#sm-arr-dash)"/>
<text x="540" y="282" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#C9973F">替代</text>
<path d="M 620 340 L 620 400 L 524 400" fill="none" stroke="#C9973F" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#sm-arr-dash)"/>
<!-- 底部注释 -->
<text x="400" y="484" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">平台层（Dify）替代大部分手写框架层代码 · 复杂场景仍需代码拿回控制权</text>
<text x="400" y="502" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">一本书的行进路线：平台起步 → 代码重写 → 编排深入 → 工程化上线</text>
</svg>
</figure>

**一句话版本**：模型层提供智能 → 平台层（Dify）不写代码搭出 80% 场景 → 框架层（LangChain）用代码获得全部控制 → 编排层（LangGraph）解决复杂流程与多 Agent。你的前端技能直接变现在最上面的交互层。

## 每层的"做了/没做"账本

| 层 | 替你做了 | 不替你做 | 什么时候你会撞到天花板 |
|---|---|---|---|
| **模型 API** | 生成/续写、FC 能力 | 记忆、重试、工具执行 | 第一天——裸调没有多轮和错误处理 |
| **Dify 2.x** | 应用壳、知识库、可视化流程、发布 | 深度定制逻辑、复杂状态、和现有系统深度集成 | 需求稍复杂就开始"绕着平台写代码" |
| **LangChain 1.0** | 模型 IO 抽象、工具封装、记忆、createAgent | 复杂流程控制、审批中断 | 流程有循环/分支/人工节点时 |
| **LangGraph 1.x** | 状态图、条件路由、检查点、HITL、多 Agent | ——（到这就是全控制权） | 你到了这里，剩下的只是工程问题 |

> **本书主线 = 逐层撞天花板**：先在 Dify 上撞（第 5 章），再在 LangChain 里重写（第 10 章），最后用 LangGraph 做真正复杂的（第 17 章）。每一层都拿真实项目练。

## 岗位视角：JD 怎么考这三层

| JD 原文 | 考的实际是 | 对应本书 |
|---|---|---|
| "熟悉 Dify/Coze 等平台" | 你知道平台能干嘛、边界在哪 | Dify 篇 4 章 |
| "精通 LangChain" | 工具调用/记忆/RAG 的**机制**理解 | LangChain 篇 6 章 |
| "Agent 编排经验" | 多 Agent/工作流/状态管理 | LangGraph 篇 5 章 |
| "MCP 经验优先" | 会写一个 MCP Server | `lc-mcp` 章 |
| "有 RAG 落地经验" | 切块/检索/评测全套 | `dify-rag` → `lc-rag` → `eng-rag-deep` |

注意一个行业事实（2025.10 起）：**LangChain 和 LangGraph 都已 1.0 GA**——`createAgent` 取代了旧的 AgentExecutor 成為标准建法，网上大量 0.x 教程已过时。本书代码全部基于 1.x API，这本身就是差异化。

## 成本视角（工程师容易忽略的一层）

选型不只是"哪个好"，还有"哪个便宜"：

| 方案 | 钱 | 时间 |
|---|---|---|
| Dify 云服务 | 免费档起步（够学完本书 Dify 篇） | 20 分钟上线 |
| Dify 自部署 | 一台 2C4G 服务器（~¥60/月） | 半天运维 |
| 裸写（DeepSeek API） | 按 token 计费，学习期每月几块钱 | 最慢但全懂 |
| LangSmith 云观测 | 免费档够用 | 顺手 |

**本书的选择**：Dify 用云服务版（零运维直接学），代码全走 DeepSeek API（国内直连、便宜、兼容 OpenAI 协议）。

## 本书怎么走（20 章地图）

<figure>
<svg viewBox="0 0 800 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="本书学习路径：全局观 → Dify → LangChain → LangGraph → 工程化">
<rect width="800" height="140" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="138" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<g>
<rect x="24" y="28" width="130" height="84" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="89" y="56" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">全局观</text>
<text x="89" y="76" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">2 章</text>
<text x="89" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#A89878">看懂地图</text>
</g>
<path d="M 154 70 L 172 70" stroke="#B8A98A" stroke-width="2" stroke-linecap="round"/>
<path d="M 167 65 L 174 70 L 167 75" fill="none" stroke="#B8A98A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<g>
<rect x="176" y="28" width="130" height="84" rx="10" fill="#FDF0E7" stroke="#C4956A" stroke-width="1.5"/>
<text x="241" y="56" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">Dify 篇</text>
<text x="241" y="76" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">4 章</text>
<text x="241" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#A89878">撞平台天花板</text>
</g>
<path d="M 306 70 L 324 70" stroke="#B8A98A" stroke-width="2" stroke-linecap="round"/>
<path d="M 319 65 L 326 70 L 319 75" fill="none" stroke="#B8A98A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<g>
<rect x="328" y="28" width="130" height="84" rx="10" fill="#F0F5EE" stroke="#7A9B6D" stroke-width="1.5"/>
<text x="393" y="56" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">LangChain</text>
<text x="393" y="76" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">6 章</text>
<text x="393" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#A89878">代码拿回控制权</text>
</g>
<path d="M 458 70 L 476 70" stroke="#B8A98A" stroke-width="2" stroke-linecap="round"/>
<path d="M 471 65 L 478 70 L 471 75" fill="none" stroke="#B8A98A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<g>
<rect x="480" y="28" width="130" height="84" rx="10" fill="#FDF5E6" stroke="#C9973F" stroke-width="1.5"/>
<text x="545" y="56" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">LangGraph</text>
<text x="545" y="76" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">5 章</text>
<text x="545" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#A89878">编排复杂系统</text>
</g>
<path d="M 610 70 L 628 70" stroke="#B8A98A" stroke-width="2" stroke-linecap="round"/>
<path d="M 623 65 L 630 70 L 623 75" fill="none" stroke="#B8A98A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<g>
<rect x="632" y="28" width="144" height="84" rx="10" fill="#FEF3EB" stroke="#D4744C" stroke-width="1.5"/>
<text x="704" y="56" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">工程化</text>
<text x="704" y="76" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">3 章</text>
<text x="704" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#A89878">上线 · 观测 · 求职</text>
</g>
</svg>
</figure>

三个贯穿全书的项目（不是虚构 demo）：

- **cooking-app**（Flutter + NestJS 烹饪助手）：已有裸 SDK 集成 → Dify 复刻 → LangChain 重构
- **hakka-ecommerce**（客家电商）：无 AI → 用商品 FAQ 做 RAG 实战
- **lovelyPet**（萌宠社区）：多 Agent 日记工作流 + TS/Python 技术决策复盘

## 下一章

先把地基打牢——[前置地基：LLM API 与 Prompt 基础](/guides/agent-stack/llm-basics)。带你读一段**真实的**生产代码（cooking-app 的 AI 服务），看懂 Dify 替你藏起来的那一层。
