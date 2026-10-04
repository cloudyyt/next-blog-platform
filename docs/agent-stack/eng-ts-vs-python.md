# TS 还是 Python：一次真实的技术决策

> 2026 年 8 月 23 日，我做了一个决定：废弃萌宠圈的 Python Agent 服务，AI 能力并入全栈 TS。这个决定对不对？这篇文章是完整的决策复盘。

## 背景：同一个项目里有两套 AI 服务

萌宠圈（lovelyPet）是一个宠物社交 App。在架构演进中，它同时存在过两套 AI 服务：

<figure>
<svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Python Agent 服务（废弃）vs 全栈 TS API：两条路线的对比">
<rect width="800" height="300" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="298" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="32" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">同一个项目 · 两条路线 · 一次抉择</text>
<!-- Python 路线 -->
<rect x="24" y="56" width="360" height="200" rx="12" fill="#FEF0EB" stroke="#D4744C" stroke-width="1.5" stroke-dasharray="8,4"/>
<text x="204" y="82" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#D4744C">Python Agent 服务（已废弃 ⚠️）</text>
<text x="204" y="102" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A5A40">hp-agent-service · FastAPI + AsyncPG</text>
<rect x="44" y="118" width="150" height="26" rx="8" fill="#FEF3EB" stroke="#E8C9B0"/>
<text x="119" y="135" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A5A40">日记生成（diary）</text>
<rect x="44" y="152" width="150" height="26" rx="8" fill="#FEF3EB" stroke="#E8C9B0"/>
<text x="119" y="169" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A5A40">RAG（rag）</text>
<rect x="44" y="186" width="150" height="26" rx="8" fill="#FEF3EB" stroke="#E8C9B0"/>
<text x="119" y="203" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A5A40">TTS（tts）</text>
<text x="204" y="240" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#A89878">独立部署 · 独立依赖 · 独立维护</text>
<!-- VS -->
<text x="420" y="160" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="#8A7A5E">vs</text>
<!-- TS 路线 -->
<rect x="456" y="56" width="320" height="200" rx="12" fill="#E8F5E8" stroke="#7A9B6D" stroke-width="2"/>
<text x="616" y="82" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#2A3420">全栈 TS API（现存 ✓）</text>
<text x="616" y="102" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5E3E">hp-pet-api · NestJS + OpenAI SDK</text>
<rect x="476" y="118" width="130" height="26" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="541" y="135" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#2A3420">日记生成（SSE 流式）</text>
<rect x="476" y="152" width="130" height="26" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="541" y="169" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#2A3420">与业务模块同层</text>
<rect x="476" y="186" width="130" height="26" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="541" y="203" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#2A3420">134 行核心代码</text>
<text x="616" y="240" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">同一进程 · 同一部署 · 同一类型系统</text>
<!-- 底部结论 -->
<rect x="24" y="270" width="752" height="22" rx="8" fill="#FDF5E6" stroke="#DBCB9A"/>
<text x="400" y="286" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6B4226">决策：AI 能力并入全栈 TS · Python 退出技术栈 · 2026-08-23</text>
</svg>
</figure>

## Python 路线的三个痛点

### 1. 部署双倍

Python 服务需要独立的运行时、独立的 Docker 镜像、独立的 CI/CD 流水线。对于一个人的项目，这不是「微服务」，这是**双倍运维**。

### 2. 类型断裂

前端 → TS API → Python Agent → 数据库。每一次跨界，TypeScript 的类型安全就断一次。DTO 要写两遍（TS 的 interface + Python 的 Pydantic model），改一个字段要动两个项目。

### 3. 生态优势在缩小

2024 年选 Python 的理由是 LangChain/LlamaIndex 只有 Python 版。但 2026 年：
- LangChain.js 已完整支持工具调用、记忆、RAG、Agent
- [easy-agent](https://github.com/ConardLi/easy-agent) 证明纯 TS 可以做出 Claude Code 级的 Agent
- OpenAI SDK 的 TS 版和 Python 版功能完全对齐

## TS 路线的三个优势

### 1. 一个进程、一套部署

```ts
// hp-pet-api/src/modules/ai/ai.service.ts
// AI 功能就是 NestJS 的一个 module，和其他业务模块平级
@Module({
  imports: [AiModule],
  controllers: [AiController],
  providers: [AiService],
})
export class PetApiModule {}
```

不需要独立的 AI 服务。AI 调用就是 `AiService` 的一个方法，和 `UserService`、`PetService` 没有任何区别。

### 2. 类型安全贯穿全栈

```ts
// 前端定义的 DiaryStyle
enum DiaryStyle {
  WARM = 'warm',
  INDEPENDENT = 'independent',
  RAMBLE = 'ramble',
}

// AI Service 直接用同一个类型
const STYLE_PROMPTS: Record<DiaryStyle, string> = {
  [DiaryStyle.WARM]: '风格：暖心。语气温柔、真诚…',
  [DiaryStyle.INDEPENDENT]: '风格：独立。高冷、傲娇…',
  [DiaryStyle.RAMBLE]: '风格：碎碎念。活泼跳脱…',
};
```

前端加了一种新风格 → TypeScript 编译器立刻报错 → 不会漏改。这是 Python 路线做不到的。

### 3. 代码量减半

Python 服务有 diary、rag、tts 三个 module + 每个的 service/controller/dto + 独立的数据库连接 + 独立的配置。废弃后，TS 版 `ai.service.ts` 只有 134 行——**因为不需要跨服务通信的胶水代码**。

## 那 Python 什么时候更合适？

诚实地列出 Python 的真实优势：

| 维度 | Python 更合适 | TS 更合适 |
|---|---|---|
| 团队背景 | 数据/算法团队 | 前端/全栈团队 |
| 模型微调 | PyTorch 生态只有 Python | 不涉及 |
| 数据处理 | pandas/numpy 无可替代 | 简单 CRUD |
| Agent 框架 | LangGraph Python 文档更丰富 | LangChain.js 已够用 |
| 部署运维 | 已有 Python 基础设施 | 已有 Node 基础设施 |
| 类型安全 | 不在乎 | 核心需求 |
| 团队规模 | 多人分工（AI 团队 + 业务团队） | 一人/小团队 |

**我的情况**：前端工程师、一人项目、已有 NestJS 全栈、不需要微调。六个维度全指向 TS。

## 决策框架：不是「哪个更好」，是「哪个对你更好」

<figure>
<svg viewBox="0 0 800 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="技术选型决策框架：团队背景、项目规模、部署成本、生态需求四个维度决定选 TS 还是 Python">
<rect width="800" height="180" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="178" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">选型决策：问自己四个问题</text>
<rect x="24" y="52" width="370" height="100" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<text x="209" y="78" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#2A3420">如果以下全是 ✓ → 选 TS</text>
<text x="44" y="100" font-family="sans-serif" font-size="10" fill="#4A5E3E">□ 团队是前端/全栈背景</text>
<text x="44" y="118" font-family="sans-serif" font-size="10" fill="#4A5E3E">□ 一人或小团队（不想维护两套部署）</text>
<text x="44" y="136" font-family="sans-serif" font-size="10" fill="#4A5E3E">□ 不需要 PyTorch / 微调</text>
<rect x="406" y="52" width="370" height="100" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1.5"/>
<text x="591" y="78" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#3A2E1E">如果以下有 ✓ → 考虑 Python</text>
<text x="426" y="100" font-family="sans-serif" font-size="10" fill="#8A7A5E">□ 团队有数据/算法工程师</text>
<text x="426" y="118" font-family="sans-serif" font-size="10" fill="#8A7A5E">□ 需要微调 / 本地推理</text>
<text x="426" y="136" font-family="sans-serif" font-size="10" fill="#8A7A5E">□ 已有 Python 部署基础设施</text>
</svg>
</figure>

## 本章要点

1. Python Agent 服务的三个痛点：部署双倍、类型断裂、生态优势在缩小
2. TS 的三个优势：一个进程、类型贯穿全栈、代码量减半
3. Python 仍然有真实优势：数据科学、微调、多人分工
4. 选型不是「哪个更好」，是「对你的团队和项目哪个更合适」
5. easy-agent 证明纯 TS 可以做出 Claude Code 级 Agent——「TS 不够用」不再是借口

→ 下一章：[Context Engineering](/guides/agent-stack/eng-context)
