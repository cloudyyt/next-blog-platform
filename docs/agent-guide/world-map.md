# 一张图看懂 Agent 世界

> 你到处听到的 Dify、LangChain、RAG、MCP……不是并列关系。看懂下面这张分层图，它们就各归其位了。

## 四层地图

<figure>
<svg viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agent 四层地图：从顶部的应用层到底部的平台与模型层">
<defs>
<linearGradient id="wm-bg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#FCF8F0"/><stop offset="1" stop-color="#F8F2E4"/>
</linearGradient>
</defs>
<rect width="800" height="520" fill="url(#wm-bg)" rx="14"/>
<rect x="1" y="1" width="798" height="518" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<!-- L4 应用层 -->
<g>
<rect x="24" y="20" width="752" height="106" rx="10" fill="#FEF3EB" stroke="#E8C9B0" stroke-width="1"/>
<rect x="32" y="32" width="5" height="82" rx="2.5" fill="#D4744C"/>
<text x="52" y="54" font-family="sans-serif" font-size="17" font-weight="700" fill="#2C2416">应用层</text>
<text x="52" y="74" font-family="sans-serif" font-size="11" fill="#8A7A5E">你做的产品</text>
<text x="52" y="92" font-family="sans-serif" font-size="10" fill="#A89878">面向用户</text>
<rect x="210" y="42" width="92" height="28" rx="14" fill="#F8E3D5" stroke="#E0B498"/>
<text x="256" y="60" text-anchor="middle" font-family="sans-serif" font-size="12.5" fill="#3A2E1E">聊天助手</text>
<rect x="314" y="42" width="104" height="28" rx="14" fill="#F8E3D5" stroke="#E0B498"/>
<text x="366" y="60" text-anchor="middle" font-family="sans-serif" font-size="12.5" fill="#3A2E1E">知识库问答</text>
<rect x="430" y="42" width="104" height="28" rx="14" fill="#F8E3D5" stroke="#E0B498"/>
<text x="482" y="60" text-anchor="middle" font-family="sans-serif" font-size="12.5" fill="#3A2E1E">办公自动化</text>
<rect x="546" y="42" width="92" height="28" rx="14" fill="#F8E3D5" stroke="#E0B498"/>
<text x="592" y="60" text-anchor="middle" font-family="sans-serif" font-size="12.5" fill="#3A2E1E">智能客服</text>
<rect x="210" y="78" width="130" height="28" rx="14" fill="#F8E3D5" stroke="#E0B498"/>
<text x="275" y="96" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6B5540">导购 · 数据分析</text>
</g>
<!-- arrow L4→L3 -->
<path d="M 396 128 L 404 128 L 400 136 Z" fill="#B8A98A"/>
<!-- L3 编排层 -->
<g>
<rect x="24" y="142" width="752" height="106" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1"/>
<rect x="32" y="154" width="5" height="82" rx="2.5" fill="#C9973F"/>
<text x="52" y="176" font-family="sans-serif" font-size="17" font-weight="700" fill="#2C2416">编排层</text>
<text x="52" y="196" font-family="sans-serif" font-size="11" fill="#8A7A5E">怎么组织流程</text>
<text x="52" y="214" font-family="sans-serif" font-size="10" fill="#A89878">高阶能力</text>
<rect x="210" y="164" width="108" height="28" rx="14" fill="#F5E8CE" stroke="#D4B880"/>
<text x="264" y="182" text-anchor="middle" font-family="sans-serif" font-size="12.5" fill="#3A2E1E">LangGraph</text>
<rect x="330" y="164" width="120" height="28" rx="14" fill="#F5E8CE" stroke="#D4B880"/>
<text x="390" y="182" text-anchor="middle" font-family="sans-serif" font-size="12.5" fill="#3A2E1E">多 Agent 协作</text>
<rect x="462" y="164" width="158" height="28" rx="14" fill="#F5E8CE" stroke="#D4B880"/>
<text x="541" y="182" text-anchor="middle" font-family="sans-serif" font-size="11.5" fill="#3A2E1E">Human-in-the-loop</text>
<rect x="210" y="200" width="158" height="28" rx="14" fill="#F5E8CE" stroke="#D4B880"/>
<text x="289" y="218" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6B5540">循环 · 审批 · 检查点</text>
</g>
<!-- arrow L3→L2 -->
<path d="M 396 250 L 404 250 L 400 258 Z" fill="#B8A98A"/>
<!-- L2 框架层 -->
<g>
<rect x="24" y="264" width="752" height="106" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1"/>
<rect x="32" y="276" width="5" height="82" rx="2.5" fill="#7A9B6D"/>
<text x="52" y="298" font-family="sans-serif" font-size="17" font-weight="700" fill="#2C2416">框架层</text>
<text x="52" y="318" font-family="sans-serif" font-size="11" fill="#8A7A5E">代码积木</text>
<text x="52" y="336" font-family="sans-serif" font-size="10" fill="#A89878">岗位核心</text>
<rect x="210" y="286" width="108" height="28" rx="14" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="264" y="304" text-anchor="middle" font-family="sans-serif" font-size="12.5" fill="#2A3420">LangChain</text>
<rect x="330" y="286" width="130" height="28" rx="14" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="395" y="304" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#2A3420">工具调用 / MCP</text>
<rect x="472" y="286" width="140" height="28" rx="14" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="542" y="304" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#2A3420">记忆 / RAG 组件</text>
<rect x="210" y="322" width="130" height="28" rx="14" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="275" y="340" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#4A5E3E">LlamaIndex · CrewAI</text>
</g>
<!-- arrow L2→L1 -->
<path d="M 396 372 L 404 372 L 400 380 Z" fill="#B8A98A"/>
<!-- L1 平台与模型层 -->
<g>
<rect x="24" y="386" width="752" height="106" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1"/>
<rect x="32" y="398" width="5" height="82" rx="2.5" fill="#5B7FA6"/>
<text x="52" y="420" font-family="sans-serif" font-size="17" font-weight="700" fill="#2C2416">平台与模型层</text>
<text x="52" y="440" font-family="sans-serif" font-size="11" fill="#8A7A5E">地基 · 只当 API 用</text>
<text x="52" y="458" font-family="sans-serif" font-size="10" fill="#A89878">不碰训练</text>
<rect x="210" y="408" width="175" height="28" rx="14" fill="#DCE6EF" stroke="#94B0C8"/>
<text x="297" y="426" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1E2E3E">DeepSeek · Qwen · GPT</text>
<rect x="397" y="408" width="105" height="28" rx="14" fill="#DCE6EF" stroke="#94B0C8"/>
<text x="449" y="426" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1E2E3E">Dify · Coze</text>
<rect x="210" y="444" width="175" height="28" rx="14" fill="#DCE6EF" stroke="#94B0C8"/>
<text x="297" y="462" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#3A4E62">GLM · Kimi · Claude · Gemini</text>
</g>
<!-- 左侧层级标注 -->
<text x="16" y="75" font-family="sans-serif" font-size="9" fill="#B8A98A" writing-mode="tb" letter-spacing="2">L4</text>
<text x="16" y="197" font-family="sans-serif" font-size="9" fill="#B8A98A" writing-mode="tb" letter-spacing="2">L3</text>
<text x="16" y="319" font-family="sans-serif" font-size="9" fill="#B8A98A" writing-mode="tb" letter-spacing="2">L2</text>
<text x="16" y="441" font-family="sans-serif" font-size="9" fill="#B8A98A" writing-mode="tb" letter-spacing="2">L1</text>
</svg>
</figure>

| 层 | 一句话 | 代表 | 你什么时候碰它 |
|---|---|---|---|
| **模型层** | 提供智能本身 | DeepSeek、Qwen、GPT | 永远只当 API 用，不碰训练 |
| **平台层** | 不写代码搭应用 | **Dify**、Coze | 入门建全局观 / 快速做 demo |
| **框架层** | 代码级积木 | **LangChain** | 正经开发，岗位要求的核心 |
| **编排层** | 复杂流程与多 Agent | **LangGraph** | 高阶：循环/审批/多角色协作 |

## 一个记忆锚点

> **Dify 让你「看见」Agent 长什么样，LangChain 让你「写」出 Agent，LangGraph 让你「编排」一群 Agent。**

三者的关系是层层递进，不是三选一——这正是姊妹篇《Agent 实战》的行进路线。

## 名词归位表

遇到新名词，先查它属于哪层：

| 你听到的词 | 它在哪层 | 备注 |
|---|---|---|
| RAG / 向量数据库 / Embedding | 框架层组件 | 给模型外挂知识，[术语卡 →](/guides/agent-guide/terms-agent) |
| MCP | 框架层协议 | 工具接入的 USB-C，2026 事实标准 |
| Function Calling | 模型能力 | 一切工具调用的地基 |
| ReAct | 编排模式 | 思考→行动→观察的循环 |
| 微调 | 模型层操作 | 应用岗通常用不上，认知即可 |

## 下一步

- 想先扫盲名词 → [核心术语卡：模型与对话](/guides/agent-guide/terms-core)
- 想直接动手 → 《Agent 实战》第 1 章
