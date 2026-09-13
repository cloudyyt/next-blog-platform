# Phase 7 · Agent 框架与编排

> 前面六章你都在写"单次调用"。
> 这一章开始，你将学会让模型**自主决策、循环推进**——这就是 Agent 和 Chatbot 的本质区别。

---

## 本章你将解决什么

读完这一章，你应该能：

- 讲清为什么"裸写 ReAct 循环"在工程上不靠谱
- 用 LangChain 搭一个**完整的 ReAct Agent**（带工具、记忆、错误处理）
- 理解 Memory 的三种实现方式及其权衡
- 判断什么时候该用单 Agent，什么时候该上多 Agent 协作
- 诊断 Agent 死循环、Memory 爆炸、工具选择错误这三类高频故障

> 前置知识：Phase 4 工具调用 + Phase 5 Prompt 工程 + Phase 6 RAG。

---

## 为什么这一章重要

到这一章为止，你已经能做：
- ✅ 调用 LLM（Phase 3）
- ✅ 让模型调用工具（Phase 4）
- ✅ 写稳定的 Prompt（Phase 5）
- ✅ 给模型外挂知识库（Phase 6）

但这些都是"**一次性调用**"。真正的 Agent 是：

> 用户给一个目标 → Agent 自己决定调什么工具、怎么调、什么时候停 → 多步推进直到完成

这种"自主决策 + 循环推进"的代码模式，需要新的工程实践。

---

## Why 1：为什么需要框架（裸写 ReAct 的问题）

理论上 ReAct 循环（Phase 0/4 讲过）的核心代码只要 30 行：

```python
# 伪代码
while not done:
    thought = llm.think(history)
    if thought.wants_tool:
        result = execute_tool(thought.tool_name, thought.tool_args)
        history.append(result)
    else:
        return thought.final_answer
```

但**这 30 行代码在生产环境会立刻爆雷**。原因：

### 工程上必须解决的问题

| 问题 | 裸写的代价 |
|------|----------|
| 工具选择错误 | LLM 调了不存在的工具，你 `KeyError` 崩溃 |
| 参数 schema 校验 | LLM 传了 `{"city": 123}`（数字而非字符串），你的函数崩 |
| 工具执行失败 | API 超时/网络断，LLM 不知道怎么继续 |
| 死循环 | LLM 反复调同一个工具 100 次，账单爆炸 |
| 流式输出 | 用户等 30 秒看一个完整答案？体验崩溃 |
| Token 预算 | 上下文越滚越长，超窗口或烧钱 |
| 并发工具调用 | LLM 想同时调 5 个工具，你串行执行效率低 |
| 重试与降级 | 某次调用失败，要不要换模型/换 prompt？ |
| 调试 | Agent 一轮 10 步，第 7 步出错，怎么定位？ |

### 框架的价值

严肃的 Agent 框架（LangChain、LlamaIndex 等）替你解决了上面这些问题。**你写 30 行业务逻辑，框架处理 500 行的工程细节**。

**框架的本质**：把"Agent 状态机"抽象出来，让你只写**业务规则**，不写**控制流**。

---

## Why 2：为什么 ReAct 不是唯一范式

ReAct（Thought → Action → Observation 循环）是 2022 年最早被验证的 Agent 范式。但**不是所有场景都适合 ReAct**。

### 三种主流 Agent 范式对比

#### 范式 A：ReAct（边想边做）

```
Thought: 用户想要 X，我需要先查 Y
Action: query_y
Observation: Y 的结果是 ...
Thought: 现在我可以...
```

**特点**：每一步都让模型决定下一步。**灵活但可能跑偏**。
**适合**：探索性任务、未知问题域、对话型 Agent。

#### 范式 B：Plan-and-Execute（先规划后执行）

```
Plan:
  1. 查询用户信息
  2. 检查权限
  3. 执行操作
  4. 返回结果

Execute step 1: ...
Execute step 2: ...
（如某步失败，回到 Plan 重新规划）
```

**特点**：先让模型制定完整计划，再逐步执行。**结构化但僵化**。
**适合**：流程明确的任务、合规要求高的场景（财务、运维）。

#### 范式 C：Reflexion（自我反思）

```
Attempt 1: 尝试解决问题
Evaluate: 自我评估，发现错误
Reflect: "我应该换种思路"
Attempt 2: 基于反思重新尝试
```

**特点**：失败后反思再试。**质量高但成本高**。
**适合**：代码生成、复杂推理、对正确性要求极高的任务。

### 什么时候用哪个

| 任务特征 | 推荐范式 |
|---------|---------|
| 探索性强、不确定要几步 | ReAct |
| 流程明确、步骤可枚举 | Plan-and-Execute |
| 一次性任务但要求高准确率 | Reflexion |
| 大多数通用场景 | **ReAct（默认）** |

**LangChain.js / LangChain.py 都默认用 ReAct**，作为入门起点最合适。其他范式按需切换。

---

## Why 3：为什么多 Agent 协作开始流行

2024 年开始，AutoGen、CrewAI、LangGraph 都在推"多 Agent 协作"。为什么？

### 单 Agent 的瓶颈

随着任务复杂度上升，单 Agent 会出现：

1. **上下文污染**：一个 Agent 同时装"研究员"和"写作者"的角色，prompt 混乱，模型分不清该用哪个身份
2. **工具过载**：一个 Agent 配 20 个工具，模型选错率飙升
3. **状态混乱**：长任务中，Agent 忘了"我进行到哪一步了"

### 多 Agent 的解法

**职责切分**：每个 Agent 专注一个角色，工具少、prompt 清晰。

经典模式：

#### 模式 A：Supervisor + Workers

```
Supervisor Agent（总指挥）
  ├─ Researcher Agent（查资料）
  ├─ Writer Agent（写初稿）
  └─ Reviewer Agent（审核）
```

Supervisor 接收任务 → 分配给合适的 Worker → 收集结果 → 决定下一步。

#### 模式 B：Pipeline（流水线）

```
Researcher → Writer → Reviewer → Editor
```

每个 Agent 处理完传给下一个，不交互。

#### 模式 C：Debate（辩论）

```
Pro-Agent ⇄ Con-Agent
     ↓
Judge Agent（综合判断）
```

多个 Agent 给对立观点，最后一个 Agent 综合。适合需要多视角的决策。

### 多 Agent 的代价

- **成本翻倍**：每个 Agent 都是独立的 LLM 调用链
- **延迟增加**：Agent 间通信需要额外的 LLM 调用
- **调试困难**：错误可能在 Supervisor 分配环节、Worker 执行环节、或通信环节

**判断标准**：单 Agent 能搞定就别上多 Agent。**只有单 Agent 的 prompt 或工具数已经无法管理时**，才考虑多 Agent。

---

## 实战：用 LangChain 搭一个完整 ReAct Agent

下面是一份能跑的实战代码——一个能查天气、查时间、做计算的通用助手 Agent。

### Python 版（推荐，生态完整）

```python
"""
Phase 7 · LangChain ReAct Agent 完整实现
依赖：uv add langchain langchain-openai python-dotenv
"""
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from datetime import datetime

load_dotenv()

# ============================================
# Step 1: 用 OpenAI 兼容协议接 Qwen
# ============================================
llm = ChatOpenAI(
    model="qwen-plus",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    temperature=0.3,
)

# ============================================
# Step 2: 定义工具（用 @tool 装饰器自动生成 schema）
# ============================================
@tool
def get_current_time(timezone: str = "Asia/Shanghai") -> str:
    """获取当前时间。timezone 是时区名，默认上海时区。"""
    now = datetime.now()
    return now.strftime(f"%Y-%m-%d %H:%M:%S ({timezone})")

@tool
def calculate(expression: str) -> str:
    """
    计算数学表达式。
    支持加减乘除、括号、幂运算。
    expression: 数学表达式字符串，如 "(12 + 34) * 2"
    """
    try:
        # 注意：生产环境不要用 eval，用 ast.literal_eval 或 sympy
        result = eval(expression, {"__builtins__": {}}, {})
        return f"计算结果：{expression} = {result}"
    except Exception as e:
        return f"计算失败：{e}"

@tool
def search_knowledge(query: str) -> str:
    """
    在知识库中搜索相关信息。
    适合回答关于公司产品、政策、流程的问题。
    query: 搜索关键词
    """
    # 这里 mock 一下，生产环境接 RAG（Phase 6）
    mock_db = {
        "退款政策": "7 天内无理由退款，30 天内有质量问题可换货。",
        "营业时间": "工作日 9:00-18:00，周末 10:00-17:00。",
    }
    for key, val in mock_db.items():
        if key in query or query in key:
            return val
    return "知识库中未找到相关信息。"

tools = [get_current_time, calculate, search_knowledge]

# ============================================
# Step 3: 定义 Prompt 模板
# ============================================
prompt = ChatPromptTemplate.from_messages([
    ("system", """你是一个有用的助手。可以使用以下工具帮助用户：

{tools}

使用规则：
1. 优先直接回答，需要外部信息时才用工具
2. 工具调用后，基于结果用自然语言回答用户
3. 工具失败时，告诉用户失败原因，不要编造结果
4. 不确定时直接说"我不知道"，不要瞎猜

工具名：{tool_names}
"""),
    ("user", "{input}"),
    ("assistant", "{agent_scratchpad}"),  # 关键：让 Agent 在这里记录思考过程
])

# ============================================
# Step 4: 组装 Agent + Executor
# ============================================
agent = create_tool_calling_agent(llm, tools, prompt)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,           # 打印每一步思考
    max_iterations=5,       # 关键：防死循环上限
    handle_parsing_errors=True,  # 模型输出格式错误时自动重试
    return_intermediate_steps=True,  # 调试用，记录中间步骤
)

# ============================================
# Step 5: 跑！
# ============================================
if __name__ == "__main__":
    # 简单查询
    print("=== 测试 1：直接调用工具 ===")
    result = agent_executor.invoke({
        "input": "现在几点？"
    })
    print(result["output"])

    print("\n=== 测试 2：多步推理 ===")
    result = agent_executor.invoke({
        "input": "（123 + 456）乘以 2 是多少？然后告诉我退款政策。"
    })
    print(result["output"])

    print("\n=== 测试 3：边界情况 ===")
    result = agent_executor.invoke({
        "input": "你能告诉我明天的股票走势吗？"
    })
    print(result["output"])  # Agent 应该说"我不知道"，而不是瞎编
```

### Node.js 版（LangChain.js）

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const llm = new ChatOpenAI({
  model: "qwen-plus",
  apiKey: process.env.DASHSCOPE_API_KEY!,
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
});

const getCurrentTime = tool(
  async () => new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
  {
    name: "get_current_time",
    description: "获取当前时间",
    schema: z.object({}),
  }
);

const tools = [getCurrentTime];

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "你是助手。可以用工具：{tools}"],
  ["user", "{input}"],
  ["assistant", "{agent_scratchpad}"],
]);

const agent = await createToolCallingAgent({ llm, tools, prompt });
const executor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 5,
});

const result = await executor.invoke({ input: "现在几点？" });
console.log(result.output);
```

### LangChain 的工程价值

对比 Phase 4 裸写 Function Calling 的代码，LangChain 帮你处理了：
- ✅ 工具 schema 自动生成（`@tool` 装饰器 + docstring）
- ✅ Agent 循环（不需要自己写 `for _ in range(5)`）
- ✅ 错误恢复（`handle_parsing_errors=True`）
- ✅ 中间步骤记录（`return_intermediate_steps`）
- ✅ 流式输出（用 `agent_executor.stream()`）
- ✅ 工具并发调用（自动并行无依赖的工具）

**这就是框架的价值**——让你聚焦业务规则，控制流交给框架。

---

## Memory：让 Agent 记住对话

到目前为止我们的 Agent 是"无状态的"——每次调用独立。但严肃应用需要**多轮对话记忆**。

### 三种 Memory 实现

#### 实现 A：无状态（默认）
- 每次对话独立
- 适合：单次查询（翻译、分类、抽取）

#### 实现 B：滑动窗口（最简单）
- 保留最近 N 轮对话
- 适合：短对话（<10 轮）

```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(k=5)  # 保留最近 5 轮
```

#### 实现 C：摘要 + 向量检索（生产级）
- 早期对话用 LLM 自动摘要
- 摘要 + 关键片段存到向量库
- 长对话时检索相关历史
- 适合：长对话、客服 Agent、个人助理

```python
from langchain.memory import ConversationSummaryBufferMemory

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=2000,  # 超过自动摘要
    return_messages=True,
)
```

### 三种实现的权衡

| 方案 | token 成本 | 实现复杂度 | 适合场景 |
|------|----------|----------|---------|
| 无状态 | 最低 | 最低 | 单次任务 |
| 滑动窗口 | 中 | 低 | 短对话 |
| 摘要+向量 | 高（要 LLM 摘要） | 高 | 长对话 |

**起步建议**：从滑动窗口开始（k=5-10），简单够用。等对话超过 20 轮再考虑摘要。

---

## 实际工作中最容易踩的 5 个坑

### 坑 1：Agent 死循环

**症状**：Agent 反复调用同一个工具，账单几小时烧光。

**原因**：
- `max_iterations` 没设
- 工具返回结果让模型"困惑"（如返回错误信息但格式像成功）

**解决**：
```python
AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=5,        # 硬上限！
    early_stopping_method="generate",  # 超限时让模型生成最终答案
)
```

并在 Prompt 里加："如果连续 2 次工具调用没有进展，应该停止并告知用户。"

### 坑 2：Memory 无限增长，Token 爆炸

**症状**：对话越长越慢，最后报"context length exceeded"。

**原因**：所有历史原样塞进 prompt，token 累积。

**解决**：
- 用 `ConversationSummaryBufferMemory` 自动摘要
- 设置 `max_token_limit`（如 2000）
- 极端情况用向量检索 Memory（只取相关历史）

### 坑 3：工具选择错误

**症状**：用户问"现在几点"，Agent 调了 `search_knowledge` 而不是 `get_current_time`。

**原因**：工具 description 写得不好，模型分不清。

**解决**：
- 把 description 写得更具体（参考 Phase 4 的"工具设计 5 原则"）
- 工具数量控制在 10 个以内（超过就拆成多 Agent）
- 在 system prompt 里给"什么场景用什么工具"的提示

### 坑 4：调试困难

**症状**：Agent 跑了 10 步最后给错答案，但不知道哪一步开始错的。

**解决**：
```python
result = agent_executor.invoke({"input": "..."})

# 打印所有中间步骤
for step in result["intermediate_steps"]:
    action, observation = step
    print(f"工具: {action.tool}")
    print(f"参数: {action.tool_input}")
    print(f"结果: {observation}")
    print("---")
```

**生产建议**：用 Langfuse / LangSmith 记录每次 Agent 调用的完整 trace（Phase 8 深入讲）。

### 坑 5：流式输出 + 工具调用的冲突

**症状**：用 `stream()` 时，工具调用结果不能正确显示。

**原因**：流式协议里，"模型在思考"和"工具在执行"的事件交替来，前端容易混乱。

**解决**：
- 工具调用阶段：先显示"正在调用 get_weather..."
- 工具返回后：显示结果摘要
- 最终生成阶段：流式输出文本

参考 Phase 3 的 SSE 实现思路。

---

## 一个常见架构误区

> **误解**：Agent 越复杂越好，工具越多越强大。

**事实**：每多一个工具，模型选错率上升；每多一层 Agent，延迟和成本翻倍。

**KISS 原则**（Keep It Simple, Stupid）在 Agent 设计里特别重要：

1. **从最小可用开始**：先做单次 LLM 调用 + 一个工具
2. **不够再加**：实在不行才上 Agent 循环
3. **再不够才上多 Agent**：90% 场景单 Agent 够用

---

## 本章检查清单

- [ ] 我能讲清"裸写 ReAct"和"用框架"的工程差异
- [ ] 我跑通了 LangChain ReAct Agent 示例（Python 或 Node）
- [ ] 我知道 ReAct / Plan-and-Execute / Reflexion 三种范式的取舍
- [ ] 我能给 Agent 加 Memory，知道三种实现的权衡
- [ ] 我能诊断死循环、Memory 爆炸、工具选择错误三类故障
- [ ] 我的 Agent 代码有 `max_iterations` 上限
- [ ] 我知道单 Agent 够用时不要上多 Agent

---

## 下一步

恭喜，到这里你已经具备**完整 Agent 工程能力**——能搭、能调、能扩展。

最后一章 **Phase 8 · 工程化上线**——把 demo 变成生产系统：

- 部署到阿里云 ECS（含 PM2、Swap、HTTPS）
- 用 Langfuse 做可观测性
- 用 Promptfoo 做回归保护
- 接内容安全过滤避免被关停
- 成本控制与降级策略
