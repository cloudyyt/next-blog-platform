# 循环与 ReAct：用图重写 Agent 循环

> Agent 的心脏不是模型，是循环。这一章从 20 行裸代码拆到 LangGraph 的图编排。

## 最简 Agentic Loop：20 行讲清楚

[easy-agent](https://github.com/ConardLi/easy-agent) Step 4 用一个 `while` 循环实现了 Agent 的核心——这 20 行就是所有 Agent 框架的心脏：

```ts
while (turnCount < maxTurns) {
  // 1. 把全部消息发给模型
  const result = await streamMessage({ messages, tools });

  // 2. 模型的回答放进历史
  messages.push(result.assistantMessage);

  // 3. 如果模型不想调工具了 → 任务完成，退出循环
  if (result.stopReason !== "tool_use") {
    return { reason: "completed" };
  }

  // 4. 模型想调工具 → 执行 → 结果放回历史 → 回到第 1 步
  const toolResults = await runTools(result.assistantMessage.content);
  messages.push(toolResults);
}
```

<figure>
<svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agentic Loop：模型思考 → 决定调工具 → 执行 → 结果回填 → 再思考，直到模型说做完了">
<defs>
<marker id="loop-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#8A7A5E"/>
+</marker>
+<marker id="loop-arr-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
+<path d="M0,0 L10,5 L0,10 z" fill="#C9973F"/>
+</marker>
+</defs>
<rect width="800" height="300" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="298" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
+<!-- 模型节点 -->
<<rect x="280" y="24" width="240" height="70" rx="14" fill="#FDF5E6" stroke="#C9973F" stroke-width="2"/>
<text x="400" y="52" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#6B4226">模型（思考）</text>
<text x="400" y="72" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">看完所有消息，决定下一步</text>
+<!-- 判断 -->
<<rect x="310" y="130" width="180" height="50" rx="25" fill="#FEF3EB" stroke="#D4744C" stroke-width="1.5"/>
<text x="400" y="152" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#3A2E1E">stop_reason 是什么？</text>
<text x="400" y="170" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">模型自己决定</text>
+<!-- 左分支：end_turn -->
<<line x1="310" y1="155" x2="130" y2="155" stroke="#7A9B6D" stroke-width="2" marker-end="url(#loop-arr)"/>
<text x="220" y="145" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#7A9B6D">end_turn（做完了）</text>
<rect x="24" y="130" width="100" height="50" rx="12" fill="#E8F5E8" stroke="#A8C9A8" stroke-width="1.5"/>
<text x="74" y="152" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#2C5232">完成 ✓</text>
<text x="74" y="168" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">返回结果</text>
+<!-- 右分支：tool_use -->
<<line x1="490" y1="155" x2="670" y2="155" stroke="#C9973F" stroke-width="2" marker-end="url(#loop-arr-gold)"/>
<text x="580" y="145" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#C9973F">tool_use（要调工具）</text>
<rect x="674" y="130" width="102" height="50" rx="12" fill="#F0F5EE" stroke="#7A9B6D" stroke-width="1.5"/>
<text x="725" y="152" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#2A3420">执行工具</text>
<text x="725" y="168" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">你的代码干活</text>
+<!-- 结果回填 -->
<<line x1="725" y1="180" x2="725" y2="230" stroke="#C9973F" stroke-width="2"/>
<text x="735" y="208" font-family="sans-serif" font-size="9" fill="#C9973F">结果回填</text>
<line x1="725" y1="230" x2="400" y2="230" stroke="#C9973F" stroke-width="2" stroke-dasharray="6,4"/>
<line x1="400" y1="230" x2="400" y2="94" stroke="#C9973F" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#loop-arr-gold)"/>
<rect x="310" y="218" width="180" height="24" rx="12" fill="#FDF5E6" stroke="#DBCB9A"/>
<text x="400" y="234" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#C9973F">tool_result 塞回消息数组</text>
+<!-- 底部标注 -->
<text x="400" y="270" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2C2416">ReAct = Reason（思考）→ Act（调工具）→ Observe（看结果）→ 再思考 → …</text>
<text x="400" y="290" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">模型不是一次给出答案 · 是在循环中逐步逼近答案 · 你设的 maxTurns 就是安全网</text>
</svg>
</figure>

## ReAct：不是什么高深算法，就是一个模式名

你刚才看懂的那个循环，有个正式名字叫 **ReAct**（Reason + Act）：

| 阶段 | 谁在做 | 做什么 |
|---|---|---|
| Reason | 模型 | 看完所有消息，决定「我需要先读那个文件」 |
| Act | 你的代码 | 执行模型指定的工具（读文件、跑命令、查数据库） |
| Observe | 模型 | 看到工具返回的结果，决定「接下来我要改这行代码」 |
| 循环 | while | 重复直到模型说「做完了」（stop_reason = end_turn） |

前端类比：`while (!done) { 想; 做; 看结果 }`——就这么直白。

## `stop_reason`：模型在告诉你它想干什么

模型的每次回答都带一个 `stop_reason`，这是循环的转向灯：

| stop_reason | 含义 | 你的代码应该 |
|---|---|---|
| `end_turn` | 「我做完了」 | 退出循环，把最终回答给用户 |
| `tool_use` | 「我想调用工具」 | 执行工具，结果塞回去，继续循环 |
| `max_tokens` | 「 token 用完了」 | 截断了，内容不完整 |

**循环的退出条件不是你决定的，是模型自己决定的。** 它觉得任务完成了就输出 `end_turn`，你的代码只是尊重这个决定。

## `maxTurns`：安全网

模型可能陷入无限循环——反复调用同一个工具，或者一直说「让我再检查一下」。`maxTurns` 就是防这个的：

```ts
while (turnCount < maxTurns) {  // 默认 8 次
  // ...
}
// 如果到这里，说明超过轮次了
return { reason: "max_turns" };
```

easy-agent 默认设 8 轮。Claude Code 内部也有类似的上限。**永远要设安全网**——模型没有「我已经循环太多次了」的自我意识。

## 工具执行：不是并发，是顺序

看 easy-agent 的 `runTools` 函数：

```ts
export async function runTools(contentBlocks, toolContext) {
  const results = [];
  for (const block of contentBlocks) {
    if (block.type !== "tool_use") continue;
    const tool = findToolByName(block.name);
    const result = await tool.call(block.input, toolContext);
    results.push({
      type: "tool_result",
      tool_use_id: block.id,
      content: result.content,
    });
  }
  return { role: "user", content: results };
}
```

三个细节：

1. **`for...of` 顺序执行**——不是 `Promise.all`。因为工具之间可能有依赖（先读文件才能改文件）
2. **`tool_use_id` 回填**——模型发的每个工单有唯一 ID，结果要标记是对哪张工单的回复
3. **结果以 `role: "user"` 塞回去**——API 约定 tool_result 放在 user 角色里

## 那 LangGraph 做了什么？

LangGraph 把这个 `while` 循环**画成了图**：

```ts
import { StateGraph } from "@langchain/langgraph";

const graph = new StateGraph(AgentState);
graph.addNode("agent", callModel);
graph.addNode("tools", executeTools);
graph.addConditionalEdges("agent", shouldContinue, {
  continue: "tools",
  end: END,
});
graph.addEdge("tools", "agent");  // 工具结果 → 回到模型

const app = graph.compile();
```

对比一下：

| 裸 while 循环 | LangGraph 图 |
|---|---|
| `while (turn < max)` | `addConditionalEdges("agent", shouldContinue)` |
| `if (stopReason === "tool_use")` | `shouldContinue()` 函数返回 "continue" 或 "end" |
| `messages.push(toolResults)` | 图的 edge 自动传递 state |
| 没有 | 检查点（checkpoint）——中途暂停/恢复 |
| 没有 | 人工审批——在某个节点暂停等人确认 |
| 没有 | 时间旅行——回到之前任一步 |

**LangGraph 的价值不是「能跑通」，是「跑通之后还能管控」**——检查点、审批、回溯，这些在裸 while 循环里要自己写很多代码才能实现。

## 本章要点

1. Agent 的心脏 = while 循环：模型 → 工具 → 结果回填 → 再循环
2. ReAct = Reason + Act + Observe，不是算法，是模式名
3. `stop_reason` 是转向灯：`end_turn` 退出，`tool_use` 继续
4. `maxTurns` 是安全网——模型没有循环自我意识
5. 工具顺序执行（不是并发），结果按 `tool_use_id` 回填
6. LangGraph 把 while 画成图，核心增值是检查点/审批/回溯

→ 下一章：[Human-in-the-loop 与检查点](/guides/agent-stack/lg-hitl)
