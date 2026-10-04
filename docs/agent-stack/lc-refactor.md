# 实战：重构 cooking-app 的 AI 服务

> 把前面所有章节学到的东西，用到一个真实项目上。从裸 SDK 到 LangChain 全家桶，每一步都有为什么。

## 起点：168 行裸 SDK

cooking-app 的 `ai.service.ts` 是一个典型的「够用但没有扩展性」的 AI 服务：

<figure>
<svg viewBox="0 0 800 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="重构前 vs 重构后：从裸 SDK 到 LangChain 全家桶">
<rect width="800" height="240" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="238" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="28" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">cooking-app AI 服务重构路线图</text>
<!-- 重构前 -->
<rect x="24" y="48" width="360" height="170" rx="12" fill="#FEF0EB" stroke="#D4744C" stroke-width="1.5" stroke-dasharray="6,4"/>
<text x="204" y="72" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#D4744C">重构前（裸 SDK）</text>
<text x="44" y="94" font-family="monospace" font-size="10" fill="#8A5A40">fetch() 手动拼请求</text>
<text x="44" y="110" font-family="monospace" font-size="10" fill="#8A5A40">buildSystemPrompt() 硬编码</text>
<text x="44" y="126" font-family="monospace" font-size="10" fill="#8A5A40">无流式（stream: false）</text>
<text x="44" y="142" font-family="monospace" font-size="10" fill="#8A5A40">无工具调用</text>
<text x="44" y="158" font-family="monospace" font-size="10" fill="#8A5A40">无记忆（每次独立）</text>
<text x="44" y="174" font-family="monospace" font-size="10" fill="#8A5A40">无结构化输出</text>
<text x="44" y="198" font-family="sans-serif" font-size="10" fill="#A89878">168 行 · 能跑 · 难扩展</text>
<!-- 箭头 -->
<text x="420" y="130" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#8A7A5E">→</text>
<!-- 重构后 -->
<rect x="456" y="48" width="320" height="170" rx="12" fill="#E8F5E8" stroke="#7A9B6D" stroke-width="2"/>
<text x="616" y="72" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#2A3420">重构后（LangChain）</text>
<text x="476" y="94" font-family="monospace" font-size="10" fill="#2A3420">ChatDeepSeek 统一接口</text>
<text x="476" y="110" font-family="monospace" font-size="10" fill="#2A3420">ChatPromptTemplate 模板化</text>
<text x="476" y="126" font-family="monospace" font-size="10" fill="#2A3420">.stream() 流式输出</text>
<text x="476" y="142" font-family="monospace" font-size="10" fill="#2A3420">searchRecipe() 等工具</text>
<text x="476" y="158" font-family="monospace" font-size="10" fill="#2A3420">ChatMessageHistory 记忆</text>
<text x="476" y="174" font-family="monospace" font-size="10" fill="#2A3420">StructuredOutputParser</text>
<text x="476" y="198" font-family="sans-serif" font-size="10" fill="#6B8A5E">~120 行 · 可扩展 · 可测试</text>
</svg>
</figure>

## 第一步：替换模型调用

**为什么**：裸 `fetch` 没有类型提示、没有重试、没有流式。ChatDeepSeek 给你这一切。

```ts
// 重构前
const response = await fetch(`${this.deepseekApiUrl}/chat/completions`, { … });

// 重构后
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  modelName: "deepseek-chat",
  openAIApiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0.7,
});
```

## 第二步：模板化 System Prompt

**为什么**：`buildSystemPrompt()` 用字符串拼接注入上下文，难维护、易出错。

```ts
// 重构前
private buildSystemPrompt(context?: any): string {
  let prompt = `你是一个专业的烹饪助手…`;
  if (context?.userPreferences) {
    prompt += `\n\n用户偏好：${JSON.stringify(context.userPreferences)}`;
  }
  return prompt;
}

// 重构后
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromMessages([
  ["system", `你是一个专业的烹饪助手。
    {% if userPreferences %}用户偏好：{{userPreferences}}{% endif %}`],
  ["human", "{question}"],
]);
```

## 第三步：加流式输出

**为什么**：用户等 5 秒看到完整回答 vs 逐字看到回答，体感差距巨大。

```ts
// 重构前：stream: false，等完整响应
const data = await response.json();
return data.choices[0].message.content;

// 重构后：流式
const stream = await llm.stream(await prompt.format({ question }));
for await (const chunk of stream) {
  this.eventEmitter.emit("token", chunk.content);
}
```

## 第四步：加工具

**为什么**：用户问「鸡胸肉有多少蛋白质」，模型不知道你的菜谱数据——它需要工具去查。

```ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const searchRecipe = tool(
  async ({ keyword }) => {
    return await this.recipeService.search(keyword);
  },
  {
    name: "search_recipe",
    description: "搜索菜谱，返回菜名、食材、步骤",
    schema: z.object({
      keyword: z.string().describe("搜索关键词"),
    }),
  }
);
```

## 第五步：加记忆

**为什么**：用户第一句「我不吃香菜」，第三句「推荐个菜」——模型需要记住偏好。

```ts
import { ChatMessageHistory } from "@langchain/community/stores/message";

// NestJS 中注入为全局单例
private history = new ChatMessageHistory();

// 多轮对话
const chatHistory = await this.history.getMessages();
const response = await chain.invoke({
  chat_history: chatHistory,
  question: userMessage,
});
await this.history.addUserMessage(userMessage);
await this.history.addAIMessage(response.content);
```

## 第六步：结构化输出

**为什么**：前端需要 JSON 格式的菜谱数据（菜名/食材/步骤），不是一大段文字。

```ts
const recipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.string(),
  })),
  steps: z.array(z.string()),
  cookingTime: z.number(),
});

const structuredLlm = llm.withStructuredOutput(recipeSchema);
const recipe = await structuredLlm.invoke(prompt);
// recipe 直接是类型安全的 TypeScript 对象
```

## 重构收益清单

| 维度 | 重构前 | 重构后 |
|---|---|---|
| 换模型供应商 | 改 URL + 改请求体格式 | 改一个 modelName |
| 加新工具 | 不支持 | 定义 tool + 加到数组 |
| 多轮对话 | 不支持 | ChatMessageHistory |
| 流式输出 | 不支持 | .stream() |
| 输出格式 | 纯文本，前端自己解析 | Zod Schema → 类型安全 |
| 错误重试 | 手动写 try-catch | 框架内置 |
| 可测试性 | 需要真实 API | 可以 mock LLM |

## 三层对比：裸 SDK → Dify → LangChain

| | 裸 SDK | Dify | LangChain |
|---|---|---|---|
| 上手 | 最快（直接写） | 快（拖拽） | 中（学 API） |
| 灵活性 | 最高（什么都能改） | 最低（平台限制） | 高（框架内自由组合） |
| 部署 | 你的服务器 | 平台托管 | 你的服务器 |
| 适合 | 原型验证 | 非开发者使用 | 生产级产品 |

**建议路线**：裸 SDK 快速验证 → Dify 给非开发者演示 → LangChain 做产品。每一步都是「前一步不够用了才升级」。

## 本章要点

1. 重构六步：替换调用 → 模板化 → 流式 → 工具 → 记忆 → 结构化输出
2. 每步的「为什么」比「怎么做」更重要
3. 裸 SDK 灵活性最高但样板代码最多；Dify 零代码但天花板低；LangChain 是平衡点
4. 不要一步到位——先用裸 SDK 验证，不够用了再升级

→ 回到[目录](/guides/agent-stack)
