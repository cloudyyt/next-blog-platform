# Phase 3 · 接入阿里云 Qwen，跑通第一个调用

> 这是全书第一个"动手"章节。
> 读完后你会拥有一个能跑的 Python Chatbot + Node API Route，而且理解每一次"换 baseURL"背后的工程权衡。

---

## 本章你将解决什么

读完这一章，你应该能：

- **5 分钟内开通阿里云百炼 + 拿到 API Key**
- 用 Python 和 Node.js **两种语言**跑通第一个 Qwen 调用
- 理解为什么 OpenAI 兼容协议是 2026 年最重要的"事实标准"
- 实现**流式响应**，知道 SSE 比 WebSocket 更适合 LLM 的根本原因
- 在工程评审时讲清"为什么不用 OpenAI 官方 SDK 直连，而走百炼兼容层"

> 前置知识：读完 Phase 0/1/2，已经能写 Python `def` 函数和 Node `async` 函数。

---

## 为什么这一章重要

接入 LLM API 看似简单，但工程上有大量决策点：

- 用官方 SDK 还是兼容协议？
- 用 Python 还是 Node？
- 流式用 SSE 还是 WebSocket？
- 模型选 Plus、Max 还是 Flash？
- API Key 怎么管理？

这些决策每个都影响项目的可维护性、可迁移性、成本。这一章用工程权衡的方式逐一回答。

---

## Why 1：为什么国内首选阿里云百炼（4 个工程理由）

不是民族主义，是**纯工程权衡**：

| 维度 | OpenAI 直连 | 阿里云百炼 |
|------|-----------|----------|
| **网络可达性** | 国内 ECS 默认无法直连，需自建代理（不稳定、合规风险） | 国内 ECS 直连，无任何额外配置 |
| **价格（同档模型）** | GPT-4o-mini 输入 $0.15/M token | Qwen-Flash 输入 $0.022/M token（便宜 ~85%） |
| **模型备案** | 国内对外提供服务必须备案，OpenAI 没备案 | **百炼已为 Qwen 完成模型备案**，你只需做应用登记 |
| **内容安全** | 需自己接内容过滤 | **百炼内置内容安全过滤**，违规请求自动拦截 |

**最关键的一点**：阿里云 ECS → 百炼 API 之间走的是阿里云内网，延迟低、稳定。OpenAI 走代理会引入额外 200-500ms 延迟和单点故障。

### 什么情况下该选别的？

- **DeepSeek**：代码任务表现接近 GPT-4o，价格便宜，但偶有抖动（高并发时段排队）
- **Kimi**：长上下文（200K+）强项，适合文档分析
- **OpenAI**：多模态、复杂推理仍是 SOTA，但国内访问障碍大

**建议**：起步阶段**只用 Qwen**——一招通吃 80% 场景。等业务有具体诉求再考虑多模型。

---

## Why 2：为什么用 OpenAI 兼容协议（不是 dashscope SDK）

这是新人在第一个代码示例就会纠结的问题。直接给答案：

### 2026 年的事实

阿里云官方文档（[安装百炼 SDK](https://help.aliyun.com/zh/model-studio/install-sdk)）明确写：

| 语言 | 官方推荐方案 |
|------|-----------|
| Python | dashscope SDK（原生） |
| Java | dashscope SDK（原生） |
| Go | dashscope SDK（原生） |
| **Node.js / TypeScript** | **无原生 SDK，官方推荐用 OpenAI Node SDK + 兼容接口** |

### 三层取舍

```
优先级 1（默认）：用 OpenAI SDK + baseURL 改成百炼兼容 URL
  - 跨语言通用（Python / Node / Go / Rust 都有 OpenAI SDK）
  - 跨模型可迁移（明天想换 DeepSeek，改 2 行就行）
  - 生态丰富（LangChain / LlamaIndex / Promptfoo 全部基于 OpenAI 协议）

优先级 2（特定场景）：用 dashscope 原生 SDK
  - 只在 Python 项目里
  - 需要用 Qwen 独有能力（如某些多模态参数、长文档特性）
  - 不在意未来迁移

优先级 3（不推荐）：直接 fetch
  - 学习时可以，生产环境不要这样写（错误处理、重试、流式都要自己造轮子）
```

**核心权衡**：用兼容协议会损失 Qwen 5% 的独有特性，换来 95% 的生态兼容性。这笔交易永远划算。

### 一个真实案例（解释为什么这点重要）

假设你用 `dashscope` SDK 写了 1000 行代码，老板突然说"我们要切到 DeepSeek 节省成本"——你要**重写所有 SDK 调用**。

如果用 OpenAI 兼容协议，你只需要改两个常量：

```python
# Before
client = OpenAI(api_key=QWEN_KEY, base_url="https://dashscope.aliyuncs.com/compatible-mode/v1")
# After
client = OpenAI(api_key=DEEPSEEK_KEY, base_url="https://api.deepseek.com/v1")
```

**这是工程化的核心**：用接口抽象把"供应商锁定"降到最小。

---

## 实战 Step 1：开通百炼 + 申请 API Key（5 分钟）

### 1.1 准备工作

- 阿里云账号（实名认证）
- 支付宝 / 银行卡（绑卡，但调用是按量计费，几乎用不到）

### 1.2 开通百炼平台

打开 [https://bailian.console.aliyun.com/](https://bailian.console.aliyun.com/) → 点"立即开通"（免费，平台本身不收费，只按模型调用计费）。

### 1.3 创建 API Key

控制台左侧菜单 → **API-KEY 管理** → **创建新的 API-KEY**

- 描述：随便写（如 `dev-local`）
- **复制保存**生成的 `sk-xxxxxxxxxxxxxxxxxxxxxxxx`（关掉就再也看不到）

> **安全警告**：API Key 等于钱包权限。永远不要硬编码进代码、不要提交到 git、不要发到群里。用环境变量管理。

### 1.4 配置环境变量

**bash / zsh（macOS/Linux）**：
```bash
echo 'export DASHSCOPE_API_KEY="sk-xxxxxxxx"' >> ~/.zshrc
source ~/.zshrc
```

**Windows PowerShell**：
```powershell
[Environment]::SetEnvironmentVariable("DASHSCOPE_API_KEY", "sk-xxxxxxxx", "User")
```

**Node.js 项目**（`.env` 文件）：
```
DASHSCOPE_API_KEY=sk-xxxxxxxx
```
配合 `dotenv` 或 Next.js 内置的 `.env` 加载。

### 1.5 验证（curl 一行）

```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-plus",
    "messages": [{"role": "user", "content": "你好，介绍一下你自己"}]
  }'
```

如果看到类似这样的响应，说明 API Key 已通：
```json
{
  "choices": [{
    "message": {"role": "assistant", "content": "你好，我是通义千问..."}
  }],
  "usage": {"total_tokens": 35}
}
```

---

## 实战 Step 2：Python 版 Chatbot

```python
"""
Phase 3 实战 · Qwen Chatbot（Python 版）
依赖：uv add openai python-dotenv
"""
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# 关键：用 OpenAI SDK 接 Qwen，只改 baseURL
client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

def chat(user_input: str, history: list[dict] = None) -> str:
    """单轮对话（带可选历史）"""
    messages = [{"role": "system", "content": "你是一个简洁的中文助手。"}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model="qwen-plus",       # 日常主力
        messages=messages,
        temperature=0.7,         # 默认；创意任务调高，分类任务调低
        max_tokens=500,
    )
    return response.choices[0].message.content

def chat_stream(user_input: str, history: list[dict] = None):
    """流式版本：逐字输出，体验更好"""
    messages = [{"role": "system", "content": "你是一个简洁的中文助手。"}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": user_input})

    stream = client.chat.completions.create(
        model="qwen-plus",
        messages=messages,
        stream=True,             # 关键参数
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta

# 测试
if __name__ == "__main__":
    print("单轮：", chat("用一句话解释 LLM"))
    print("\n流式：")
    for piece in chat_stream("写一首关于代码的诗"):
        print(piece, end="", flush=True)
        # flush=True 让 print 立刻输出，不缓冲
```

跑起来：
```bash
uv add openai python-dotenv
uv run python chatbot.py
```

**关键点解析**：
- `client = OpenAI(...)` ——这行你以后会写无数遍，记牢
- `model="qwen-plus"` ——日常主力，约 $0.115/M 输入 token，便宜稳定
- `stream=True` + `for chunk in stream` ——流式标配
- `delta = chunk.choices[0].delta.content` ——注意 `.content` 可能是 `None`（第一个 chunk 通常没有 content）

---

## 实战 Step 3：Node.js / Next.js 版（API Route）

```typescript
// app/api/chat/route.ts
import OpenAI from "openai"
import { NextRequest } from "next/server"

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY!,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
})

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  // 流式响应：返回 ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await client.chat.completions.create({
          model: "qwen-plus",
          messages: [
            { role: "system", content: "你是一个简洁的中文助手。" },
            ...messages,
          ],
          stream: true,
        })

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content || ""
          if (delta) {
            // SSE 格式：data: <content>\n\n
            controller.enqueue(`data: ${JSON.stringify({ content: delta })}\n\n`)
          }
        }
        controller.enqueue("data: [DONE]\n\n")
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
```

前端消费（React）：
```typescript
"use client"

async function streamChat(messages: Array<{role: string; content: string}>) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  })

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let full = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    // 解析 SSE
    for (const line of text.split("\n")) {
      if (!line.startsWith("data: ")) continue
      const data = line.slice(6)
      if (data === "[DONE]") return full
      const { content } = JSON.parse(data)
      full += content
      // 触发 UI 更新
      setOutput(full)
    }
  }
  return full
}
```

---

## Why 3：为什么 SSE 比 WebSocket 更适合 LLM 流式

这是工程上的关键设计决策，也是新手最容易做错的地方。

### 一句话答案

**LLM 流式是"服务器→客户端"的单向流，SSE 天然适合；WebSocket 是双向通道，对 LLM 场景属于过度设计。**

### 详细对比

| 维度 | SSE（Server-Sent Events） | WebSocket |
|------|-------------------------|----------|
| 通信方向 | 服务器 → 客户端（单向） | 双向 |
| 协议 | HTTP/1.1 或 HTTP/2 | 独立的 ws:// 协议 |
| 端口/防火墙 | 80/443（标准 HTTP） | 需要额外配置 |
| 断线重连 | **浏览器自动重连** | 必须手写 |
| 代理/CDN 兼容 | 完美（就是 HTTP） | 经常出问题（Nginx / Cloudflare） |
| 鉴权 | 标准 HTTP Header | 需要在握手时自定义 |
| 心跳 | 浏览器自动处理 | 必须自己实现 |
| 适合场景 | LLM 流式、消息推送、状态更新 | 游戏、协同编辑、视频会议 |

### LLM 场景为什么不需要双向？

LLM 流式的本质：**用户发一次请求，模型吐一堆 token 出来**。整个过程是：
- 客户端 → 服务器：**一次**请求（开始时）
- 服务器 → 客户端：**多次**推送 token（流式输出）

用 WebSocket 等于"为一次单边通信建立一条永久双向管道"——浪费且复杂。

### OpenAI / Anthropic / 阿里云都用 SSE

这不是巧合，是工程共识：
- OpenAI：`stream: true` 返回 SSE
- Claude：同样 SSE
- Qwen / DeepSeek：全部 SSE

**所以你的 Agent 也应该用 SSE**——除非有非常具体的双向需求（如中途取消、动态改 prompt），否则不要用 WebSocket。

---

## Why 4：为什么 Qwen-Plus 是日常主力（不是 Max 也不是 Flash）

新手最常问："Qwen 那么多模型，我该用哪个？"

### 三档定位

| 模型 | 定位 | 输入价格（每百万 token） | 适合场景 |
|------|------|--------------------|---------|
| `qwen3.7-max` | 旗舰 | $1.65 | 复杂 Agent 任务、长周期规划、代码生成 |
| **`qwen-plus`** | **均衡** | **$0.115** | **日常主力（推荐起步）** |
| `qwen-flash` | 极致低成本 | $0.022 | 大规模 RAG 检索问答、批处理分类 |

### 为什么默认 Plus

- **比 Max 便宜 14 倍**，但 80% 日常任务表现接近
- **比 Flash 聪明**，复杂任务不会掉链子
- **流式稳定**，是最常被用于生产环境的模型
- **Agent 能力强**：Function Calling / 多轮对话 / 工具调用都支持

### 什么时候该升 Max / 降 Flash

**升 Max**：
- 长周期 Agent 任务（多步推理）
- 复杂代码生成 / 重构
- 需要最强推理（数学、逻辑题）

**降 Flash**：
- 大规模批处理（如给 10 万篇文章自动生成摘要）
- 简单分类（情感、垃圾邮件）
- RAG 检索后的快速回答（不是核心 reasoning）

**经验法则**：起步永远用 Plus，遇到 Plus 不够再升 Max，遇到成本爆炸再降 Flash。

---

## Why 5：为什么 .env + 环境变量是底线（不是建议）

每周都有新人把 API Key 提交到 git，然后账单被刷爆。**这是工程红线**，不是"建议"。

### 三层防护

**第一层：`.env` 文件**
```
DASHSCOPE_API_KEY=sk-xxx
```
**必须加入 `.gitignore`**：
```
.env
.env.local
.env.*-local
```

**第二层：`.env.example` 模板**
```
DASHSCOPE_API_KEY=your-key-here
```
这个文件**应该提交**——给团队成员看"需要哪些环境变量"，但不泄露真实值。

**第三层：定期轮换**
- 阿里云百炼支持随时 revoke + recreate API Key
- 建议**每 3 个月轮换一次**
- 怀疑泄露**立刻** revoke，不要犹豫

### 一个真实事故

某前端工程师把 `.env` 提交到公开 GitHub repo，2 小时内被脚本扫到，攻击者用他的 Key 跑了 $2000 的 GPT-4 调用。**阿里云的话账单更直接——直接扣支付宝**。

---

## 一个常见的坑

> **坑：直接用 OpenAI SDK 不改 baseURL**
>
> 新手拷贝 OpenAI 官方示例代码，直接换 API Key，期望它"自动连 Qwen"——结果报 401。
>
> **原因**：默认 baseURL 是 `https://api.openai.com/v1`，你的 Qwen Key 在那里无效。
> **解决**：永远显式指定 `baseURL`，养成肌肉记忆。

```typescript
// ❌ 错误
const client = new OpenAI({ apiKey: QWEN_KEY })

// ✅ 正确
const client = new OpenAI({
  apiKey: QWEN_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
})
```

---

## 本章检查清单

- [ ] 我已经在阿里云百炼开通了账号，拿到 API Key 并配进 `.env`
- [ ] 我能用 curl 验证 API Key 通了
- [ ] 我跑通了 Python 版 Chatbot（非流式 + 流式两版）
- [ ] 我跑通了 Node.js API Route 版（带 SSE 流式）
- [ ] 我能讲清为什么用 OpenAI 兼容协议而不是 dashscope SDK
- [ ] 我能讲清 SSE vs WebSocket 在 LLM 场景的取舍
- [ ] 我知道为什么默认选 qwen-plus，什么时候升 Max / 降 Flash
- [ ] 我的 API Key 没有提交到 git，`.env` 在 `.gitignore` 里

---

## 下一步

环境就位、能跑通调用，接下来进入**核心能力**三大章节：

- **Phase 4 · 工具调用四层栈**——让 LLM 从"只会说话"变成"会调用外部能力"
- **Phase 5 · Prompt 工程**——把 prompt 当接口设计，配合 Promptfoo 做"单元测试"
- **Phase 6 · RAG 与企业知识库**——给模型外挂知识，避免幻觉

建议按顺序读，因为 Phase 5/6 都会用到本章的 Qwen 客户端。
