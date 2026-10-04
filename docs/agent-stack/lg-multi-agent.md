# 多 Agent 协作：宠物日记工作流

> 单 Agent 上下文不够用了怎么办？拆成多个 Agent，各自独立思考，协同完成任务。

## 什么时候需要多 Agent

先泼冷水：**大部分任务单 Agent 就够了**。不要为了「多 Agent」而多 Agent。

真正需要多 Agent 的三种信号：

<figure>
<svg viewBox="0 0 800 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="需要多 Agent 的三种信号：上下文不够、任务可并行、角色需要隔离">
<rect width="800" height="220" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="218" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">什么时候需要多 Agent</text>
<rect x="24" y="52" width="240" height="130" rx="12" fill="#FEF3EB" stroke="#E8C9B0" stroke-width="1.5"/>
<text x="144" y="80" text-anchor="middle" font-family="sans-serif" font-size="22">📦</text>
<text x="144" y="104" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#2C2416">上下文不够</text>
<text x="144" y="124" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">任务需要读 50 个文件</text>
<text x="144" y="140" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">单 Agent 窗口塞不下</text>
<text x="144" y="162" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#D4744C">→ 拆成子 Agent 各读一部分</text>
<rect x="284" y="52" width="240" height="130" rx="12" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<text x="404" y="80" text-anchor="middle" font-family="sans-serif" font-size="22">⚡</text>
<text x="404" y="104" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#2A3420">任务可并行</text>
<text x="404" y="124" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B8A5E">同时生成文案 + 配图 + 审核</text>
<text x="404" y="140" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B8A5E">串行太慢</text>
<text x="404" y="162" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#7A9B6D">→ 并行 Agent 各干各的</text>
<rect x="544" y="52" width="232" height="130" rx="12" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="660" y="80" text-anchor="middle" font-family="sans-serif" font-size="22">🔒</text>
<text x="660" y="104" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#2C2416">角色需要隔离</text>
<text x="660" y="124" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#5B7FA6">写代码的 Agent 不应该</text>
<text x="660" y="140" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#5B7FA6">同时做代码审查</text>
<text x="660" y="162" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#5B7FA6">→ 分开，各自有工具权限</text>
</svg>
</figure>

## Supervisor 模式：最常用的多 Agent 架构

<figure>
<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Supervisor 模式：一个主 Agent 分派任务给多个子 Agent，子 Agent 各自独立执行后汇报">
<defs>
<marker id="ma-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#8A7A5E"/>
+</marker>
+</defs>
<rect width="800" height="280" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="278" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<!-- Supervisor -->
<rect x="280" y="24" width="240" height="64" rx="14" fill="#FDF5E6" stroke="#C9973F" stroke-width="2"/>
<text x="400" y="52" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#6B4226">Supervisor（主 Agent）</text>
<text x="400" y="72" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">接收任务 · 分派 · 汇总结果</text>
<!-- 分派箭头 -->
<line x1="310" y1="88" x2="160" y2="140" stroke="#C9973F" stroke-width="2" marker-end="url(#ma-arr)"/>
<text x="210" y="110" font-family="sans-serif" font-size="9" fill="#C9973F">任务 A</text>
<line x1="400" y1="88" x2="400" y2="140" stroke="#C9973F" stroke-width="2" marker-end="url(#ma-arr)"/>
<text x="412" y="118" font-family="sans-serif" font-size="9" fill="#C9973F">任务 B</text>
<line x1="490" y1="88" x2="640" y2="140" stroke="#C9973F" stroke-width="2" marker-end="url(#ma-arr)"/>
<text x="590" y="110" font-family="sans-serif" font-size="9" fill="#C9973F">任务 C</text>
<!-- 子 Agent A -->
<rect x="64" y="144" width="190" height="64" rx="12" fill="#F0F5EE" stroke="#7A9B6D" stroke-width="1.5"/>
<text x="159" y="168" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2A3420">子 Agent · 文案生成</text>
<text x="159" y="186" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">独立上下文 · 只有 Write 工具</text>
<!-- 子 Agent B -->
<rect x="304" y="144" width="190" height="64" rx="12" fill="#EDF2F7" stroke="#5B7FA6" stroke-width="1.5"/>
<text x="399" y="168" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#1E2E3E">子 Agent · 配图搜索</text>
<text x="399" y="186" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#5B7FA6">独立上下文 · 只有 Read 工具</text>
<!-- 子 Agent C -->
<rect x="544" y="144" width="190" height="64" rx="12" fill="#FEF3EB" stroke="#D4744C" stroke-width="1.5"/>
<text x="639" y="168" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#3A2E1E">子 Agent · 内容审核</text>
<text x="639" y="186" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A5A40">独立上下文 · 只有 Grep 工具</text>
<!-- 汇报箭头 -->
<line x1="160" y1="208" x2="310" y2="248" stroke="#7A9B6D" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#ma-arr)"/>
<line x1="400" y1="208" x2="400" y2="248" stroke="#5B7FA6" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#ma-arr)"/>
<line x1="640" y1="208" x2="490" y2="248" stroke="#D4744C" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#ma-arr)"/>
<!-- 汇总 -->
<rect x="280" y="236" width="240" height="32" rx="16" fill="#E8F5E8" stroke="#A8C9A8" stroke-width="1.5"/>
<text x="400" y="257" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#2C5232">汇总 → 输出最终结果</text>
</svg>
</figure>

碎开来说这个模式的三个核心概念：

**Supervisor 不干活，只管人。** 它收到「帮我写一篇宠物日记」后，不自己写，而是拆分成子任务分派给子 Agent。它的上下文里不塞具体文件内容，只塞子 Agent 的汇报结果。

**子 Agent 有独立的上下文和工具池。** 文案 Agent 只有 Write 工具（不能读代码），搜索 Agent 只有 Read/Grep 工具（不能写文件）。隔离意味着安全和不干扰。

**汇报是摘要，不是全量。** 子 Agent 完成后只返回一段摘要文字给 Supervisor，不返回它的完整消息历史。这就是上下文隔离的价值——Supervisor 的窗口不会被子 Agent 的海量工具调用撑爆。

## easy-agent 的实现

[easy-agent](https://github.com/ConardLi/easy-agent) Step 19 实现了 Sub-Agent，核心就是把「启动一个子 Agent」包装成一个工具：

```ts
const agentTool = {
  name: "Agent",
  description: "把子任务委派给一个有独立上下文的子 Agent",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string" },         // 给子 Agent 的任务描述
      description: { type: "string" },     // 给 Supervisor 看的摘要
      subagent_type: { type: "string" },   // 用哪个子 Agent
    },
    required: ["prompt", "description"],
  },
  async call(input, context) {
    // 1. 找到对应的 Agent 定义（system prompt + 工具池）
    const agent = findAgent(input.subagent_type);

    // 2. 用隔离的消息数组启动子 Agent 的循环
    const result = await runChildAgent({
      agentDefinition: agent,
      prompt: input.prompt,
      availableTools: filterTools(agent),  // 只给允许的工具
    });

    // 3. 返回摘要（不是完整消息历史）
    return { content: result.finalText };
  },
};
```

Step 21 在此基础上加了 **Agent Teams**：多个子 Agent 之间可以通过「邮箱文件」互相发消息，实现真正的协作而不只是汇报。

```ts
// 每个 teammate 有一个 inbox 文件
// messages 通过文件锁保证并发安全
async function writeToMailbox(recipientName, message, teamName) {
  const inboxPath = getInboxPath(recipientName, teamName);
  const release = await lockfile.lock(inboxPath);
  const messages = await readMailbox(recipientName, teamName);
  messages.push({ ...message, read: false });
  await fs.writeFile(inboxPath, JSON.stringify(messages));
  release();
}
```

## LangGraph 的多 Agent

LangGraph 里用 Supervisor 模式只需要定义图的边：

```ts
const graph = new StateGraph(AgentState);

// Supervisor 节点
graph.addNode("supervisor", async (state) => {
  const decision = await supervisorLLM.invoke(state);
  return { next: decision.nextAgent };  // "writer" | "reviewer" | "FINISH"
});

// 子 Agent 节点
graph.addNode("writer", writerAgent);
graph.addNode("reviewer", reviewerAgent);

// 条件边：Supervisor 决定下一个执行的 Agent
graph.addConditionalEdges("supervisor", (state) => state.next, {
  writer: "writer",
  reviewer: "reviewer",
  FINISH: END,
});

// 子 Agent 完成后回到 Supervisor
graph.addEdge("writer", "supervisor");
graph.addEdge("reviewer", "supervisor");
```

| easy-agent 的裸实现 | LangGraph |
|---|---|
| Agent 工具 + runChildAgent | `addNode` + `addConditionalEdges` |
| 邮箱文件通信 | 共享 State（消息队列） |
| 文件锁保并发 | 框架管理 |
| 没有可视化 | LangSmith 图结构追踪 |

## 实战锚点：萌宠圈日记工作流

你的 lovelyPet 项目可以设计这样的多 Agent 流水线：

```
用户上传宠物照片/视频
       ↓
  Supervisor（判断：需要生成日记）
       ↓
  ┌── 文案 Agent（写日记正文，有 Write 工具）
  ├── 审核 Agent（检查内容合规，只有 Read 工具）
  └── TTS Agent（文字转语音，有 Bash 工具）
       ↓
  Supervisor（汇总，返回给用户）
```

## 本章要点

1. 多 Agent 的三种触发信号：上下文不够、任务可并行、角色需隔离
2. Supervisor 模式：主 Agent 分派任务、子 Agent 独立执行、摘要汇报
3. 子 Agent 有独立上下文和工具池——隔离就是安全
4. 汇报是摘要不是全量——保护 Supervisor 的上下文窗口
5. easy-agent 的 Agent Teams 用邮箱文件实现 Agent 间通信
6. LangGraph 用图的节点和条件边表达同样的模式

→ 下一章：[Context Engineering](/guides/agent-stack/eng-context)
