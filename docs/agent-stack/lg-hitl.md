# Human-in-the-loop 与检查点

> 模型有了「手」之后，你要回答一个问题：什么时候让它自己干，什么时候拦下来问人？

## 为什么需要人工审批

模型的工具调用是有副作用的——读文件无害，但 `rm -rf /` 呢？

<figure>
<svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="权限三级模型：只读工具自动放行（绿）、写操作需确认（黄）、危险操作直接拒绝（红）">
<rect width="800" height="240" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="238" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="32" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">权限三级模型</text>
<!-- 绿色 -->
<rect x="24" y="56" width="240" height="140" rx="12" fill="#E8F5E8" stroke="#7A9B6D" stroke-width="2"/>
<circle cx="144" cy="88" r="18" fill="#7A9B6D"/>
<text x="144" y="93" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#FFF">✓</text>
<text x="144" y="124" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2A3420">自动放行</text>
<text x="144" y="142" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5E3E">Read · Grep · Glob</text>
<text x="144" y="158" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5E3E">pwd · ls · git status</text>
<text x="144" y="180" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#7A9B6D">只读 · 无副作用 · 不问</text>
<!-- 黄色 -->
<rect x="284" y="56" width="240" height="140" rx="12" fill="#FDF5E6" stroke="#C9973F" stroke-width="2"/>
<circle cx="404" cy="88" r="18" fill="#C9973F"/>
<text x="404" y="93" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#FFF">?</text>
<text x="404" y="124" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#3A2E1E">需要确认</text>
<text x="404" y="142" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">Write · Edit · Bash</text>
<text x="404" y="158" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">npm install · git commit</text>
<text x="404" y="180" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#C9973F">有副作用 · 拦下来问用户</text>
<!-- 红色 -->
<rect x="544" y="56" width="232" height="140" rx="12" fill="#FEF0EB" stroke="#D4744C" stroke-width="2"/>
<circle cx="660" cy="88" r="18" fill="#D4744C"/>
<text x="660" y="93" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#FFF">✗</text>
<text x="660" y="124" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#3A2E1E">直接拒绝</text>
<text x="660" y="142" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A5A40">rm · sudo · git push</text>
<text x="660" y="158" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A5A40">shutdown · reset --hard</text>
<text x="660" y="180" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#D4744C">危险 · 不问 · 直接 block</text>
<!-- 底部 -->
<text x="400" y="222" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">easy-agent Step 7 的实现：isReadOnly() → allow · 非只读 → ask · 危险前缀 → deny</text>
</svg>
</figure>

## easy-agent 的权限模型

[easy-agent](https://github.com/ConardLi/easy-agent) Step 7 实现了一个三级权限模型，核心函数只需要一个 `checkPermission`：

```ts
async function checkPermission({ tool, input, mode }) {
  // Plan Mode 下只放行只读工具
  if (mode === "plan" && !tool.isReadOnly()) {
    return { behavior: "deny", reason: "plan mode blocks write actions" };
  }

  // Bash 命令需要额外检查
  if (tool.name === "Bash") {
    if (isDangerousCommand(input.command)) {
      return { behavior: "deny", reason: "dangerous shell command" };
    }
    if (isReadOnlyCommand(input.command)) {
      return { behavior: "allow", reason: "read-only shell command" };
    }
    return { behavior: "ask", reason: "shell command may change local state" };
  }

  // 其他工具按 isReadOnly 分级
  if (tool.isReadOnly()) {
    return { behavior: "allow" };
  }
  return { behavior: "ask", reason: "tool writes local state" };
}
```

碎开来说这个函数的三层判断：

**第一层：模式检查。** Plan Mode（后面讲）下，非只读工具直接拒绝。这是「先看后做」的硬约束。

**第二层：Bash 特殊处理。** 因为 Bash 是万能工具——既能 `ls` 也能 `rm -rf`，所以要看具体命令：

```ts
const READ_ONLY_SHELL_PREFIXES = [
  "pwd", "ls", "cat", "find", "rg", "grep",
  "git status", "git diff", "git log",
];

const DANGEROUS_BASH_PREFIXES = [
  "rm ", "sudo ", "git push",
  "git reset --hard", "shutdown", "reboot",
];
```

两个白名单/黑名单决定了命令的走向。

**第三层：工具自身的 `isReadOnly()`。** 这就是 lc-tools 章讲的 Tool 契约里的那个字段——现在你知道它为什么存在了。

## Plan Mode：先看后做

权限系统解决的是「单次操作要不要拦」，Plan Mode 解决的是「整个任务先规划再动手」。

<figure>
<svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Plan Mode 流程：进入规划（只读探索）→ 写计划文件 → 用户批准 → 退出规划（恢复完整工具）">
<defs>
<marker id="plan-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#8A7A5E"/>
+</marker>
+</defs>
<rect width="800" height="200" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="198" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">Plan Mode：先看后做</text>
<rect x="24" y="56" width="170" height="70" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="109" y="80" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">① 进入规划</text>
<text x="109" y="98" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#5B7FA6">EnterPlanMode</text>
<text x="109" y="114" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">只允许 Read/Grep/Glob</text>
<line x1="194" y1="91" x2="216" y2="91" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#plan-arr)"/>
<rect x="220" y="56" width="170" height="70" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<text x="305" y="80" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">② 探索 + 写计划</text>
<text x="305" y="98" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">读代码 · 分析结构</text>
<text x="305" y="114" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">计划写入 plan.md</text>
<line x1="390" y1="91" x2="412" y2="91" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#plan-arr)"/>
<rect x="416" y="56" width="170" height="70" rx="10" fill="#FDF5E6" stroke="#C9973F" stroke-width="1.5"/>
<text x="501" y="80" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">③ 用户审批</text>
<text x="501" y="98" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">人类看计划</text>
<text x="501" y="114" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#C9973F">✓ 批准 或 ✗ 修改</text>
<line x1="586" y1="91" x2="608" y2="91" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#plan-arr)"/>
<rect x="612" y="56" width="164" height="70" rx="10" fill="#E8F5E8" stroke="#A8C9A8" stroke-width="1.5"/>
<text x="694" y="80" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C5232">④ 执行计划</text>
<text x="694" y="98" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">恢复完整工具</text>
<text x="694" y="114" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">ExitPlanMode → 动手</text>
<text x="400" y="164" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">规划阶段不能写源代码、不能跑危险命令——只能读和写 plan 文件</text>
<text x="400" y="184" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">这就是「先看后做」：模型的探索能力不受限，但动手能力被锁住</text>
</svg>
</figure>

easy-agent Step 13 的 Plan Mode 实现，核心只是两个工具：

- `EnterPlanMode`：切换到规划模式，只读工具可用
- `ExitPlanMode`：提交计划给用户审批，批准后恢复完整工具

```ts
// Plan Mode 下的权限检查
function checkPermissionInPlanMode({ toolName, input }) {
  if (PLAN_ALLOWED_TOOLS.has(toolName)) {
    return { behavior: "allow" };  // Read/Grep/Glob 放行
  }
  if (toolName === "Bash" && isReadOnlyCommand(input.command)) {
    return { behavior: "allow" };  // 只读 Bash 放行
  }
  if (toolName === "Write" && isPlanFile(input.file_path)) {
    return { behavior: "allow" };  // 只能写计划文件
  }
  return { behavior: "deny" };  // 其他一律拒绝
}
```

## LangGraph 的检查点

Plan Mode 是产品层面的 HITL。LangGraph 在框架层面提供了更原语的能力：**检查点（checkpoint）**。

```ts
import { StateGraph, MemorySaver } from "@langchain/langgraph";

const checkpointSaver = new MemorySaver();

const graph = new StateGraph(AgentState)
  .addNode("agent", callModel)
  .addNode("tools", executeTools)
  .addNode("humanReview", askHuman)  // ← 新增审批节点
  .addConditionalEdges("agent", shouldContinue)
  .compile({ checkpointer: checkpointSaver });
```

| 产品层（Plan Mode） | 框架层（LangGraph checkpoint） |
|---|---|
| 工具粒度：每个工具调用前检查 | 图粒度：在某个节点暂停 |
| 规则驱动（isReadOnly + 前缀匹配） | 状态驱动（checkpoint 持久化） |
| 没有时间旅行 | 可以回到之前任一检查点 |
| 不支持恢复 | 中断后可从检查点恢复执行 |

**实际产品两者结合用**：权限系统做日常防线（成本低、延迟小），checkpoint 做关键节点的人工审批（复杂任务的保险机制）。

## 本章要点

1. 权限三级：只读 → 自动放行（绿）、写操作 → 需确认（黄）、危险 → 直接拒绝（红）
2. Bash 需要特殊处理——同一个工具既能 `ls` 也能 `rm`，看命令前缀
3. `isReadOnly()` 不仅是元信息，是权限系统的核心依据
4. Plan Mode = 锁住写能力、保留读能力，让模型先探索再规划
5. LangGraph checkpoint 是框架级 HITL，支持中断恢复和时间旅行

→ 下一章：[多 Agent 协作](/guides/agent-stack/lg-multi-agent)
