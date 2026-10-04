# 记忆与多轮对话

> 模型没有记忆——你以为的「它记得我」，只是把历史全量重发了一遍。这一章讲怎么管理这些历史。

## 先破一个幻觉

你跟 ChatGPT 说「刚才那个文件名是什么」，它答对了。你觉得它「记得」。

实际上，它每次调用都收到了**从第一句到现在的完整对话历史**。「记得」不是存储在模型里，是存储在你发过去的消息数组里。

<figure>
<svg viewBox="0 0 800 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="记忆幻觉：模型没有内置记忆，多轮对话只是每次全量重发消息数组">
<rect width="800" height="220" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="218" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="32" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">你以为的「记忆」vs 实际发生的事</text>
<!-- 左：幻觉 -->
<rect x="24" y="52" width="360" height="140" rx="10" fill="#FEF3EB" stroke="#E8C9B0" stroke-width="1.5" stroke-dasharray="6,4"/>
<text x="204" y="80" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#D4744C">❌ 幻觉</text>
<text x="204" y="102" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#3A2E1E">模型内部存了之前的对话</text>
<text x="204" y="122" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">下次调用时「想起」</text>
<text x="204" y="148" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">→ 不存在。模型是纯函数</text>
<text x="204" y="168" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">→ f(prompt) → text，无状态</text>
<!-- 右：现实 -->
<rect x="416" y="52" width="360" height="140" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<text x="596" y="80" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#7A9B6D">✓ 现实</text>
<text x="596" y="102" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2A3420">每次调用重发全部历史</text>
<text x="596" y="122" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B8A5E">第 1 轮：发 2 条消息</text>
<text x="596" y="140" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B8A5E">第 5 轮：发 10 条消息</text>
<text x="596" y="158" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B8A5E">第 20 轮：发 40 条消息 → 💰</text>
<text x="596" y="180" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#2A3420">「记忆管理」= 管理这个越滚越大的数组</text>
</svg>
</figure>

## 三层记忆体系

实际的 Agent 产品不是把全部历史无限重发，而是分层管理：

<figure>
<svg viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agent 三层记忆：工作记忆（当前对话）、项目记忆（跨会话）、长期记忆（全局偏好）">
<rect width="800" height="260" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="258" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">三层记忆：从易失到持久</text>
<!-- 第一层 -->
<rect x="24" y="50" width="752" height="56" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1.5"/>
<rect x="32" y="58" width="5" height="40" rx="2.5" fill="#C9973F"/>
<text x="52" y="72" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">工作记忆（当前对话）</text>
<text x="52" y="90" font-family="sans-serif" font-size="10" fill="#8A7A5E">messages 数组 · 会话结束就消失 · 每个 Agent 必须有</text>
<text x="756" y="76" text-anchor="end" font-family="sans-serif" font-size="10" fill="#C9973F">← 你已经会的</text>
<!-- 第二层 -->
<rect x="24" y="118" width="752" height="56" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<rect x="32" y="126" width="5" height="40" rx="2.5" fill="#7A9B6D"/>
<text x="52" y="140" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">项目记忆（跨会话）</text>
<text x="52" y="158" font-family="sans-serif" font-size="10" fill="#6B8A5E">同一项目的上下文 · 重启后恢复 · 文件系统或数据库持久化</text>
<text x="756" y="144" text-anchor="end" font-family="sans-serif" font-size="10" fill="#7A9B6D">← easy-agent Step 9</text>
<!-- 第三层 -->
<rect x="24" y="186" width="752" height="56" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<rect x="32" y="194" width="5" height="40" rx="2.5" fill="#5B7FA6"/>
<text x="52" y="208" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">长期记忆（全局偏好）</text>
<text x="52" y="226" font-family="sans-serif" font-size="10" fill="#5B7FA6">用户的习惯和偏好 · 跨项目 · 通常是一个全局配置或用户档案</text>
<text x="756" y="212" text-anchor="end" font-family="sans-serif" font-size="10" fill="#5B7FA6">← easy-agent Step 10</text>
</svg>
</figure>

## easy-agent 的会话持久化

[easy-agent](https://github.com/ConardLi/easy-agent) Step 9 实现了项目级的会话持久化。核心思路出奇地简单：**用 JSONL 文件（每行一个 JSON 对象）追加写入**。

### 为什么选 JSONL？

| 方案 | 优点 | 缺点 |
|---|---|---|
| JSONL（追加写） | 写入零成本、天然按时间排序、崩溃不丢已写数据 | 读取时要逐行解析 |
| SQLite | 结构化查询、事务 | 引入依赖、过度设计 |
| 内存 → 定期刷盘 | 简单 | 崩溃丢数据 |

对个人 Agent 来说，JSONL 是**刚好够用**的方案。

### 存储结构

```
~/.easy-agent/
  projects/
    a3f8b2c1d4e5f6a7/     ← 项目路径的 hash
      session-uuid-1.jsonl  ← 每个会话一个文件
      session-uuid-2.jsonl
      latest                ← 记录最近的 session ID
```

每行一个 JSON 对象，五种类型：

```ts
// 会话元信息（第一行）
{ type: "session_meta", sessionId, cwd, startedAt, model }

// 对话消息
{ type: "message", timestamp, role: "user", message: { … } }

// 工具事件（记录但不重放）
{ type: "tool_event", timestamp, name: "Read", phase: "start" }

// Token 用量
{ type: "usage", timestamp, turn: { input: 500, output: 100 }, total: { … } }

// 系统日志
{ type: "system", timestamp, level: "info", message: "…" }
```

### 恢复：从文件读回消息数组

```ts
async function restoreSession(cwd, sessionId) {
  // 1. 读 JSONL 文件
  const entries = await readTranscriptEntries(transcriptPath);

  // 2. 只取 message 类型的条目
  const messages = entries
    .filter(e => e.type === "message")
    .map(e => e.message);

  // 3. 返回可用的消息数组 + 统计信息
  return { messages, summary: { messageCount, totalUsage } };
}
```

重启后 `restoreSession` 读回消息数组，Agent 就「记得」上次聊到哪了。

## 关键设计决策

### 追加写，不覆盖写

```ts
await fs.appendFile(transcriptPath, JSON.stringify(entry) + "\n");
```

`appendFile` 是原子操作——进程崩溃时最多丢最后一行，不会损坏整个文件。这是所有日志系统的标准做法。

### 项目隔离

```ts
function getProjectHash(cwd) {
  return crypto.createHash("sha256")
    .update(path.resolve(cwd))
    .digest("hex")
    .slice(0, 16);
}
```

不同项目（不同目录）的会话完全隔离，不会串。Claude Code 也是这么做的。

### 工具事件不重放

JSONL 里记录了 `tool_event`（工具什么时候被调用），但恢复时只取 `message`——**工具执行是有副作用的**（读文件、跑命令），不能恢复时重新执行。

## LangChain 的记忆抽象

LangChain 把这些模式包装了：

```ts
import { ChatMessageHistory } from "@langchain/community/stores/message/chat_message_history";

const history = new ChatMessageHistory();
await history.addUserMessage("鸡胸肉怎么做嫩？");
await history.addAIMessage("低温慢煮 60°C…");

const messages = await history.getMessages(); // 恢复时用
```

| easy-agent 的裸实现 | LangChain |
|---|---|
| JSONL 文件 + appendFile | `ChatMessageHistory`（可接 Redis/Postgres） |
| 手动过滤 message 条目 | `getMessages()` 直接返回 |
| 手动算 projectHash | `sessionId` 参数 |

底层逻辑完全一样，LangChain 只是帮你接好了后端存储。

## 本章要点

1. 模型没有记忆——「记得」= 全量重发消息数组
2. 三层记忆：工作记忆（当前对话）→ 项目记忆（跨会话）→ 长期记忆（全局偏好）
3. JSONL 追加写是个人 Agent 的最佳持久化方案：零成本、崩溃安全
4. 工具事件记录但不重放——工具执行有副作用
5. LangChain 的 ChatMessageHistory 是同一思想的框架包装

→ 下一章：[RAG 代码化——拆开 Dify 的黑盒](/guides/agent-stack/lc-rag)
