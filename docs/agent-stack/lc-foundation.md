# LangChain.js 第一步：模型 IO 与流式

> 在碰任何框架之前，先看懂裸 API 长什么样——因为 LangChain 全部是对这一层的包装。


<figure>
<svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="消息数组：system 设定 + user 提问 + assistant 回答 + user 追问，每次调用全量重发">
<rect width="800" height="240" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="238" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="32" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">消息数组：模型看到的全部世界</text>
<rect x="24" y="50" width="752" height="30" rx="8" fill="#EDF2F7" stroke="#A8BCD0"/>
<text x="44" y="70" font-family="monospace" font-size="11" fill="#1E2E3E">system: "你是烹饪助手，回答要简洁实用"</text>
<text x="756" y="70" text-anchor="end" font-family="sans-serif" font-size="9" fill="#5B7FA6">← 人设/规则</text>
<rect x="24" y="90" width="752" height="30" rx="8" fill="#F0F5EE" stroke="#B8C9AE"/>
<text x="44" y="110" font-family="monospace" font-size="11" fill="#2A3420">user: "鸡胸肉怎么做嫩？"</text>
<text x="756" y="110" text-anchor="end" font-family="sans-serif" font-size="9" fill="#7A9B6D">← 用户问</text>
<rect x="24" y="130" width="752" height="30" rx="8" fill="#FDF5E6" stroke="#DBCB9A"/>
<text x="44" y="150" font-family="monospace" font-size="11" fill="#3A2E1E">assistant: "低温慢煮 60°C…"</text>
<text x="756" y="150" text-anchor="end" font-family="sans-serif" font-size="9" fill="#C9973F">← 模型上次答</text>
<rect x="24" y="170" width="752" height="30" rx="8" fill="#F0F5EE" stroke="#B8C9AE"/>
<text x="44" y="190" font-family="monospace" font-size="11" fill="#2A3420">user: "温度设多少？"</text>
<text x="756" y="190" text-anchor="end" font-family="sans-serif" font-size="9" fill="#7A9B6D">← 用户追问</text>
<text x="400" y="228" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">模型没有记忆 · 每次调用把这整段数组重新发一遍 · 所以长对话越来越贵</text>
</svg>
</figure>


## 从 30 行裸代码开始

下面是一个真实开源项目 [easy-agent](https://github.com/ConardLi/easy-agent) 的 Step 1——一个从零重造 Claude Code 的项目，这 30 行就是 LLM API 的全部本质：

```ts
import Anthropic from "@anthropic-ai/sdk";

export async function* streamMessage({ messages, system, tools }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_AUTH_TOKEN });
  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages,        // 消息数组：[{ role, content }]
    stream: true,
    ...(system ? { system } : {}),
    ...(tools?.length ? { tools } : {}),
  });

  for await (const event of stream) {
    // 每个事件 yield 给 UI 层渲染
    yield event;
  }
}
```

如果你之前用过 DeepSeek 或 OpenAI 的 API，你会发现格式几乎一样——**因为整个行业都兼容 OpenAI 协议**。换一个模型供应商，改的只是 URL 和 Key。

## 消息数组：唯一的输入格式

模型只认一种输入：**消息数组**。每条消息有一个角色和一段内容：

```ts
messages: [
  { role: "system",    content: "你是烹饪助手…" },     // 人设/规则（权重最高）
  { role: "user",      content: "鸡胸肉怎么做嫩？" },   // 用户问的
  { role: "assistant", content: "低温慢煮…" },          // 模型上次答的
  { role: "user",      content: "温度设多少？" },        // 用户追问的
]
```

四个知识点碎开来说：

| 角色 | 谁在说话 | 类比 |
|---|---|---|
| `system` | 你写给模型的设定 | 函数的隐式约定——不对用户展示，但影响所有输出 |
| `user` | 用户 | 函数的入参 |
| `assistant` | 模型 | 函数的返回值（也会成为下一轮的入参） |
| `tool` | 工具执行结果 | 外部数据回填——后面工具调用章会讲 |

**模型没有记忆**。每次调用都是独立的——所谓「多轮对话」，只是把之前所有消息重新发一遍。这就是为什么长对话越来越贵（Dify 篇讲过的 token 账单）。


<figure>
<svg viewBox="0 0 800 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="流式事件时间线：从 message_start 到 message_stop，中间是增量 text_delta">
<rect width="800" height="180" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="178" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">流式事件流：打字机效果的真相</text>
<line x1="40" y1="70" x2="760" y2="70" stroke="#D4C9A9" stroke-width="2"/>
<circle cx="60" cy="70" r="6" fill="#5B7FA6"/>
<text x="60" y="52" text-anchor="middle" font-family="monospace" font-size="9" fill="#5B7FA6">message_start</text>
<circle cx="180" cy="70" r="6" fill="#7A9B6D"/>
<text x="180" y="52" text-anchor="middle" font-family="monospace" font-size="9" fill="#7A9B6D">block_start</text>
<circle cx="330" cy="70" r="5" fill="#C9973F" opacity="0.7"/>
<circle cx="380" cy="70" r="5" fill="#C9973F" opacity="0.7"/>
<circle cx="430" cy="70" r="5" fill="#C9973F" opacity="0.7"/>
<circle cx="480" cy="70" r="5" fill="#C9973F" opacity="0.7"/>
<circle cx="530" cy="70" r="5" fill="#C9973F" opacity="0.7"/>
<text x="400" y="52" text-anchor="middle" font-family="monospace" font-size="9" fill="#C9973F">text_delta × N</text>
<circle cx="620" cy="70" r="6" fill="#7A9B6D"/>
<text x="620" y="52" text-anchor="middle" font-family="monospace" font-size="9" fill="#7A9B6D">block_stop</text>
<circle cx="740" cy="70" r="6" fill="#D4744C"/>
<text x="740" y="52" text-anchor="middle" font-family="monospace" font-size="9" fill="#D4744C">message_stop</text>
<rect x="60" y="94" width="500" height="28" rx="8" fill="#FDF5E6" stroke="#DBCB9A"/>
<text x="70" y="112" font-family="sans-serif" font-size="11" fill="#3A2E1E">"今" → "天" → "北" → "京" → … 每个字一个事件</text>
<text x="400" y="156" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">UI 每收到一个 text_delta 就渲染一个字 · 不是前端在做动画 · 是模型本来就是一个 token 一个 token 长出来的</text>
</svg>
</figure>


## 流式输出：不是一个字一个字「下载」

你看到的打字机效果，不是前端在做动画，是**模型本来就是一个 token 一个 token 生成的**（认知地图的 LLM 原理 3 分钟讲过这个）。

流式 API 返回的不是完整回答，而是一串**事件流**：

```
message_start       → 开始了，这是 message ID
content_block_start → 第一个内容块开始了（text 类型）
content_block_delta → 增量文字："今"… "天"… "北"… "京"…
content_block_stop  → 这个块结束了
message_delta       → 快结束了，stop_reason 来了
message_stop        → 完整回答结束
```

easy-agent 的 Step 1 用一个 `async generator` 处理这些事件，每收到一个 `text_delta` 就 `yield` 给终端 UI 渲染——**这就是所有流式 UI 的底层原理**。

## content block：回答不止是文字

模型的回答不是一个字符串，是一个**内容块数组**：

```ts
content: [
  { type: "text", text: "让我查一下天气…" },           // 文字块
  { type: "tool_use", id: "toolu_01", name: "getWeather", input: { city: "北京" } },  // 工具调用块
]
```

当模型想调用工具时，它不会说「请帮我调用 getWeather」，而是输出一个结构化的 `tool_use` 块。你的代码执行工具后，把结果作为 `tool_result` 塞回消息数组，再次调用模型。

这个循环就是 Agent 的核心——下一章会拆开讲。

## 那 LangChain 到底包装了什么？

现在你能自己回答这个问题了：

| 裸 API（你刚看的） | LangChain 的包装 |
|---|---|
| 手动拼 messages 数组 | `ChatPromptTemplate` 帮你拼 |
| 手动处理 stream 事件 | `.stream()` 返回一个好用的 async iterator |
| 手动解析 content blocks | 自动提取文字 / 工具调用 |
| 换模型供应商要改代码 | `ChatOpenAI` / `ChatAnthropic` 统一接口 |

**LangChain 的价值不是「更强」，是「更省事」**——但如果你不知道底下在发生什么，框架出问题时就抓瞎。

## 本章要点

1. 模型 API = 发一个 POST，传消息数组，拿回复写
2. 消息数组是唯一输入格式，四种角色各司其职
3. 模型没有记忆，多轮对话 = 全量历史重发
4. 流式 = 逐 token 事件流，不是前端动画
5. content block 不止文字，还有 tool_use——这是 Agent 的起点

→ 下一章：[工具调用——Agent 的「手」](/guides/agent-stack/lc-tools)
