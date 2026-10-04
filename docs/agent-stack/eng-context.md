# Context Engineering：上下文工程

> 2026 年 Agent 工程的核心技能：不是给模型更多上下文，而是给模型**对的**上下文。

## 为什么需要上下文工程

你的 Agent 跑了 30 分钟，调了 50 次工具，消息数组已经膨胀到 15 万 token。接下来会发生什么？

1. **API 报错**：超过模型的上下文窗口上限（如 200K token）
2. **成本爆炸**：每次调用都要付 15 万 token 的输入费用
3. **质量下降**：lost in the middle——关键信息被淹没在中间，模型找不到

上下文工程解决这三个问题。它不是一门玄学，是一套**可量化的工程实践**。

## Token 预算：先搞清楚你有多少钱

<figure>
<svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Token 预算分配：模型窗口减去安全预留，再减去自动压缩缓冲，剩下的才是可用空间">
<rect width="800" height="200" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="198" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">Token 预算分配（以 200K 窗口为例）</text>
<!-- 总窗口 -->
<rect x="24" y="56" width="752" height="40" rx="8" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="400" y="80" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1E2E3E">模型上下文窗口：200,000 tokens</text>
<!-- 安全预留 -->
<rect x="24" y="106" width="640" height="40" rx="8" fill="#F0F5EE" stroke="#B8C9AE"/>
<text x="344" y="130" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2A3420">有效窗口：180,000（预留 20K 给模型回复）</text>
<rect x="674" y="106" width="102" height="40" rx="8" fill="#FEF3EB" stroke="#E8C9B0"/>
<text x="725" y="130" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#D4744C">回复预留</text>
<!-- 自动压缩阈值 -->
<rect x="24" y="156" width="580" height="36" rx="8" fill="#FDF5E6" stroke="#DBCB9A"/>
<text x="314" y="178" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6B4226">自动压缩触发线：167,000（再留 13K 缓冲）</text>
<rect x="614" y="156" width="162" height="36" rx="8" fill="#FEF3EB" stroke="#E8C9B0"/>
<text x="695" y="178" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#D4744C">缓冲区（不给用户）</text>
</svg>
</figure>

[easy-agent](https://github.com/ConardLi/easy-agent) Step 11 的实现：

```ts
const MODEL_CONTEXT_WINDOW = 200_000;
const AUTOCOMPACT_BUFFER_TOKENS = 13_000;

function buildTokenBudgetSnapshot(messages) {
  const estimatedTokens = tokenCountWithEstimation(messages);
  const effectiveWindow = MODEL_CONTEXT_WINDOW - 20_000;  // 留给回复
  return {
    estimatedTokens,
    autoCompactThreshold: effectiveWindow - AUTOCOMPACT_BUFFER_TOKENS,
  };
}
```

三层扣减：**总窗口 → 留回复空间 → 留压缩缓冲**。剩下的才是你能「花」的。

## Token 估算：不精确但够用

你不可能每次都调 API 来查精确 token 数（那本身就要花钱）。easy-agent 用**字符数启发式**：

```ts
const TEXT_CHARS_PER_TOKEN = 4;     // 英文约 4 字符 = 1 token
const JSON_CHARS_PER_TOKEN = 2;     // JSON 结构更密，约 2 字符 = 1 token

function roughTokenCount(content) {
  return Math.max(1, Math.round(content.length / TEXT_CHARS_PER_TOKEN));
}
```

然后**混合锚定**：拿最近一次 API 返回的 `usage.input_tokens`（精确值）作为锚点，只估算锚点之后新增的消息：

```ts
function tokenCountWithEstimation(messages, { usage, usageAnchorIndex }) {
  if (usage && usageAnchorIndex !== undefined) {
    const knownTokens = usage.input_tokens;  // 精确
    const suffix = messages.slice(usageAnchorIndex + 1);
    return knownTokens + estimateMessagesTokens(suffix);  // 估算
  }
  return estimateMessagesTokens(messages);  // 全估算
}
```

## 压缩策略：两级火箭

<figure>
<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="两级压缩：先微压缩（免费，清空旧工具结果），不够再全压缩（调 AI 生成摘要）">
<defs>
<marker id="ctx-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#8A7A5E"/>
+</marker>
+</defs>
<rect width="800" height="280" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="278" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">两级压缩策略</text>
<!-- 输入 -->
<rect x="24" y="56" width="140" height="56" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="94" y="80" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">消息数组</text>
<text x="94" y="98" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">越滚越大</text>
<line x1="164" y1="84" x2="188" y2="84" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#ctx-arr)"/>
<!-- 判断 -->
<rect x="192" y="62" width="120" height="44" rx="22" fill="#FEF3EB" stroke="#D4744C" stroke-width="1.5"/>
<text x="252" y="82" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#3A2E1E">超过阈值？</text>
<text x="252" y="96" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#8A7A5E">167K tokens</text>
<!-- 第一级：微压缩 -->
<line x1="312" y1="84" x2="340" y2="84" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#ctx-arr)"/>
<text x="326" y="74" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#7A9B6D">是</text>
<rect x="344" y="52" width="200" height="64" rx="10" fill="#F0F5EE" stroke="#7A9B6D" stroke-width="2"/>
<text x="444" y="74" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#2A3420">第一级：微压缩</text>
<text x="444" y="92" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">清空旧工具结果 → 替换为占位符</text>
<text x="444" y="108" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#7A9B6D">零成本 · 不调 API</text>
<!-- 判断2 -->
<line x1="544" y1="84" x2="572" y2="84" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#ctx-arr)"/>
<rect x="576" y="62" width="100" height="44" rx="22" fill="#FEF3EB" stroke="#D4744C" stroke-width="1.5"/>
<text x="626" y="82" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#3A2E1E">还超？</text>
<text x="626" y="96" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#8A7A5E">再查一次</text>
<!-- 第二级：全压缩 -->
<line x1="676" y1="84" x2="700" y2="84" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#ctx-arr)"/>
<rect x="576" y="130" width="200" height="64" rx="10" fill="#FDF5E6" stroke="#C9973F" stroke-width="2"/>
<text x="676" y="152" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#6B4226">第二级：全压缩</text>
<text x="676" y="170" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">AI 生成对话摘要 + 保留最近 8 条</text>
<text x="676" y="186" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#C9973F">花一次 API 调用 · 换 90% 空间</text>
<line x1="626" y1="106" x2="626" y2="130" stroke="#C9973F" stroke-width="1.5" stroke-dasharray="4,3"/>
<!-- 效果 -->
<rect x="24" y="160" width="500" height="100" rx="10" fill="#FBF7EE" stroke="#D4C9A9"/>
<text x="274" y="184" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#2C2416">效果对比</text>
<rect x="44" y="196" width="200" height="24" rx="8" fill="#FEF3EB" stroke="#E8C9B0"/>
<text x="144" y="212" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#D4744C">压缩前：150K tokens</text>
<text x="274" y="212" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#8A7A5E">→</text>
<rect x="304" y="196" width="200" height="24" rx="8" fill="#E8F5E8" stroke="#A8C9A8"/>
<text x="404" y="212" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#2C5232">压缩后：8K tokens（-95%）</text>
<text x="274" y="244" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">微压缩免费拿到 30-50% 减量 · 全压缩再拿到 90%+</text>
</svg>
</figure>

### 第一级：微压缩（零成本）

把旧的工具结果替换为占位符——**不调 API，纯本地操作**：

```ts
const CLEARED_PLACEHOLDER = "[Old tool result content cleared]";

function microCompactMessage(message) {
  return {
    ...message,
    content: message.content.map(block => {
      if (block.type === "tool_result" && isOldTool(block)) {
        return { ...block, content: CLEARED_PLACEHOLDER };
      }
      return block;
    }),
  };
}
```

只清旧工具结果（Read/Grep/Bash），不清用户消息和模型回答。**模型已经看过这些工具结果了**，后续对话不需要原始内容。

### 第二级：全压缩（花一次 API 调用）

微压缩不够时，让模型自己总结历史：

```ts
async function compactMessages(messages, callModel) {
  // 1. 先微压缩
  const microCompacted = microCompactMessages(messages);

  // 2. 让 AI 总结前半段
  const summary = await callModel(
    "请详细总结这段对话：用户请求、技术决策、文件名、错误、待办事项…",
    microCompacted
  );

  // 3. 保留最近 8 条消息（原文不压缩）
  const tail = microCompacted.slice(-8);

  // 4. 组装新数组：摘要 + 最近对话
  return [
    { role: "user", content: "以下是之前对话的摘要：\n" + summary },
    { role: "assistant", content: "[CompactBoundary]" },
    ...tail,
  ];
}
```

碎开来说几个关键细节：

**为什么保留最近 8 条？** 模型对最近上下文的利用率最高（开头结尾效应）。最近几轮对话是当前任务的直接上下文，压掉会丢失正在进行的工作状态。

**为什么用 AI 总结而不是规则截断？** 规则截断（只留最近 N 条）会丢失重要信息：用户最初的目标、关键决策、已尝试的方案。AI 总结能提取这些语义信息。

**`CompactBoundary` 标记有什么用？** 告诉模型「这里发生过压缩」——模型看到这个标记就知道前面的内容是摘要不是完整对话，不会误以为信息被遗漏。

## tool_use / tool_result 配对保护

压缩时最容易犯的错：把 tool_use 和 tool_result 拆散了。API 要求这两个必须成对出现。

```ts
function findSafeTailStart(messages, desiredCount) {
  let start = messages.length - desiredCount;
  while (start > 0) {
    const tail = messages.slice(start);
    // 检查是否有悬空的 tool_result（没有对应的 tool_use）
    const hasDangling = checkForDanglingToolResults(tail);
    if (!hasDangling) return start;
    start--;  // 往前多保留一条，直到配对完整
  }
  return 0;
}
```

## 本章要点

1. 上下文工程 = 在有限的 token 窗口里，给模型最相关的信息
2. Token 预算三层扣减：总窗口 → 回复预留 → 压缩缓冲
3. 混合估算：API 精确值做锚点 + 字符启发式估增量
4. 两级压缩：微压缩（免费，清旧工具结果）→ 全压缩（AI 总结 + 保留最近 8 条）
5. tool_use / tool_result 必须成对——压缩时不能拆散

→ 下一章：[RAG 深水区](/guides/agent-stack/eng-rag-deep)
