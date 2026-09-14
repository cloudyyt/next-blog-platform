# 前置地基：LLM API 与 Prompt 基础

> 在碰任何框架之前，必须先看懂**裸 API** 长什么样——因为 Dify/LangChain 全部是对这一层的包装。教材就用真实代码：我桌面 cooking-app 项目的 AI 服务（NestJS + DeepSeek，已上线运行）。

## 读一段真实的生产代码

`cooking-app/backend/src/ai/ai.service.ts`（节选，真实文件）：

```ts
private async callDeepSeek(messages: any[], context?: any): Promise<any> {
  const requestBody = {
    model: this.deepseekModel,                       // "deepseek-chat"
    messages: [
      { role: "system", content: systemPrompt },     // 人设与规则
      ...messages.map(msg => ({ role: msg.role, content: msg.content })),
    ],
    max_tokens: 2000,
    temperature: 0.7,
  };

  const response = await fetch(`${this.deepseekApiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${this.deepseekApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  return { content: data.choices[0].message.content, usage: data.usage };
}
```

这 30 行就是 **LLM API 的全部本质**：一个 POST 请求，发消息数组，拿回续写。DeepSeek/Qwen/GPT 全部兼容这个 OpenAI 协议格式。后面所有框架解决的都是这段代码没有的东西。

## 消息数组：唯一的输入格式

```ts
messages: [
  { role: "system",    content: "你是烹饪助手…规则…" }  // 人设/规则/约束（权重高）
  { role: "user",      content: "鸡胸肉怎么做嫩？" }     // 用户输入
  { role: "assistant", content: "上一次回答…" }          // 历史回答
  { role: "user",      content: "那低油版本呢？" }       // 新输入
]
```

**关键认知：模型没有"记忆"**。所谓多轮对话，就是每次把全部历史重新发一遍（对，每一轮都在为全部历史付 token 账单）。"记忆管理"就是决定哪些历史留、哪些摘要、哪些扔——后面 LangChain 篇的 Memory 组件干的就是这个。

## System Prompt：写好它的四个要素

cooking-app 的 system prompt 真实结构：

```text
你是一个专业的烹饪助手…（角色）
你的任务是帮助用户解决烹饪相关的问题，包括：
1. 菜谱推荐和解释  2. 烹饪技巧指导  3. 食材替代建议…（职责清单）
【回答要求】
- 回答简洁实用，先给结论再给步骤
- 不确定时如实说明，不要编造（约束/兜底）
```

| 要素 | 作用 | 缺了会怎样 |
|---|---|---|
| 角色 | 定语气和知识域 | 回答像百科不像助手 |
| 职责清单 | 划定回答范围 | 什么都能聊，包括不该聊的 |
| 输出要求 | 控制格式与长度 | 长篇大论 |
| 兜底约束 | 不确定时承认 | 幻觉放大 |

**few-shot 比抽象指令有效**：与其写"回答要简洁"，不如直接给 1-2 个理想问答示例——模型模仿示例的能力远强于理解形容词的能力。

## 流式输出：用户体感的分水岭

裸代码没做流式（这是它真实的历史局限）。流式的本质极其简单——响应是一块块到的：

```ts
const response = await fetch(url, {
  method: "POST",
  body: JSON.stringify({ ...requestBody, stream: true }),  // 就加这一个参数
  headers: { Authorization: `Bearer ${key}` },
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);          // "data: {...}\n\ndata: {...}"
  // 每块解析出 delta.content，立刻推给前端
}
```

为什么模型"天生适合"流式？因为它本来就是**逐 token 生成**的——完整答案是等它全部写完，流式是它写一句你听一句。前端把 chunk 推给 SSE/WebSocket，就是 ChatGPT 那种打字机效果（你的前端技能在这里直接变现）。

## 结构化输出：让模型输出可解析的 JSON

让模型"输出 JSON"是应用开发最高频需求。两种姿势：

```ts
// 姿势一：prompt 约束（能懂但不可靠，模型偶尔夹带说明文字）
{ role: "system", content: "只输出 JSON，格式：{name, minutes, steps[]}" }

// 姿势二：response_format / withStructuredOutput（协议级强约束，推荐）
const body = {
  model: "deepseek-chat",
  messages: [...],
  response_format: { type: "json_object" },   // DeepSeek 支持 JSON mode
};
```

框架层会更进一步：`llm.withStructuredOutput(zodSchema)` 直接给你类型安全的对象（TS 的强项，LangChain 篇见）。

## Function Calling 的裸形态（预告）

模型不能执行代码，但它能输出"我想调用什么工具"：

```json
{
  "choices": [{
    "message": {
      "content": null,
      "tool_calls": [{
        "function": { "name": "get_recipe", "arguments": "{\"ingredient\":\"鸡胸肉\"}" }
      }]
    }
  }]
}
```

你的代码拿到这个 JSON → 真的去查菜谱 → 把结果以 `role: "tool"` 消息塞回数组 → 再调一次 → 循环直到模型给出自然语言答案。**这个"调用→执行→回填→再调用"的循环就是 Agent 的心脏**。LangChain 篇的 `lc-tools` 章会把它完整实现一遍。

## 本章自查

- [ ] 能默写 messages 四种 role 和各自用途
- [ ] 能解释"多轮对话为什么每轮都付全款"
- [ ] system prompt 四要素能对号入座
- [ ] 知道流式只是 `stream: true` + 逐块读
- [ ] 能说清 FC 循环的五步（调用→执行→回填→再调→终止）

## 下一章

地基打完，上平台——[20 分钟跑通第一个应用](/guides/agent-stack/dify-quickstart)，看看 Dify 把这些裸代码包装成了什么样。
