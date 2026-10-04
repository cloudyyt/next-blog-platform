# 工具调用：从原生 FC 到框架 Tools

> 模型有了「手」才能干活。这一章从裸 Function Calling 拆到 LangChain Tool，每一步都告诉你为什么。

## 工具不是插件，是一份「菜单」

你想让模型帮你读文件、查天气、搜代码——第一步不是写代码，是**告诉模型你有什么工具可用**。

工具的定义本质上就是一份菜单：

```ts
{
  name: "Read",                    // 工具名（模型用它来调用）
  description: "读取工作区文件",    // 告诉模型这个工具是干嘛的
  inputSchema: {                   // 告诉模型需要传什么参数
    type: "object",
    properties: {
      file_path: { type: "string" },
      offset: { type: "number" },
      limit: { type: "number" },
    },
    required: ["file_path"],
  },
}
```

模型看到这份菜单后，会在回答中输出一个结构化的调用请求——**它不执行代码，它只是写了一张工单**：

```json
{ "type": "tool_use", "name": "Read", "input": { "file_path": "src/app.ts" } }
```

你的代码拿到这张工单，去执行，把结果回填。这就是全部。

## 
<figure>
<svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tool 契约五要素：name、description、inputSchema、isReadOnly、call">
<rect width="800" height="200" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="198" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">Tool 契约：一份给模型看的菜单</text>
<rect x="24" y="50" width="140" height="60" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="94" y="74" text-anchor="middle" font-family="monospace" font-size="11" font-weight="600" fill="#1E2E3E">name</text>
<text x="94" y="92" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#5B7FA6">模型用它来调用</text>
<rect x="178" y="50" width="160" height="60" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1.5"/>
<text x="258" y="74" text-anchor="middle" font-family="monospace" font-size="11" font-weight="600" fill="#6B4226">description</text>
<text x="258" y="92" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#C9973F">给模型的 prompt</text>
<rect x="352" y="50" width="160" height="60" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<text x="432" y="74" text-anchor="middle" font-family="monospace" font-size="11" font-weight="600" fill="#2A3420">inputSchema</text>
<text x="432" y="92" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#7A9B6D">参数的 JSON Schema</text>
<rect x="526" y="50" width="120" height="60" rx="10" fill="#FEF3EB" stroke="#E8C9B0" stroke-width="1.5"/>
<text x="586" y="74" text-anchor="middle" font-family="monospace" font-size="11" font-weight="600" fill="#3A2E1E">isReadOnly</text>
<text x="586" y="92" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#D4744C">安全分级</text>
<rect x="660" y="50" width="116" height="60" rx="10" fill="#E8F5E8" stroke="#A8C9A8" stroke-width="1.5"/>
<text x="718" y="74" text-anchor="middle" font-family="monospace" font-size="11" font-weight="600" fill="#2C5232">call()</text>
<text x="718" y="92" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">真正干活</text>
<text x="400" y="142" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2C2416">模型看到前三个（name + description + inputSchema）就知道怎么调用</text>
<text x="400" y="162" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#2C2416">你的代码用后两个（isReadOnly + call）来执行和管理权限</text>
<text x="400" y="184" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">description 写得越清楚，模型调用得越准——这是模型决定「什么时候用这个工具」的唯一依据</text>
</svg>
</figure>

easy-agent 的 Tool 契约

[easy-agent](https://github.com/ConardLi/easy-agent) Step 3 定义了一个极简的工具契约，五个字段：

```ts
const readTool = {
  name: "Read",              // 唯一标识
  description: "…",          // 给模型看的说明书
  inputSchema: { … },        // JSON Schema 参数定义
  isReadOnly() { … },        // 权限系统用：只读工具可自动放行
  isEnabled() { … },         // 开关：可以动态禁用某个工具
  async call(input, ctx) {   // 真正干活的函数
    const text = await fs.readFile(path, "utf8");
    return { content: text, isError: false };
  },
};
```

碎开来说每个字段的设计意图：

**`description` 是给模型的 prompt**。写得越清楚，模型调用得越准。这不是文档注释——是模型决定「什么时候用这个工具」的唯一依据。

**`inputSchema` 是 JSON Schema**。模型用它来生成正确的参数。你定义 `required: ["file_path"]`，模型就知道必须传文件路径。

**`isReadOnly` 是安全边界**。读文件不改任何东西 → 可以自动放行；写文件有风险 → 需要用户确认。easy-agent Step 7 的权限系统就靠这个字段做分级。

**返回 `{ content, isError }`** 而不是直接返回字符串——因为工具可能失败，模型需要知道结果是错误还是正常数据。

## 安全细节：路径逃逸防护

easy-agent 的 Read 工具有一个容易被忽略的安全检查：

```ts
function resolveWorkspacePath(filePath, cwd) {
  const resolved = path.resolve(cwd, filePath);
  const relative = path.relative(cwd, resolved);
  // 如果路径以 .. 开头，说明试图逃出工作区
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path is outside the workspace: " + filePath);
  }
  return resolved;
}
```

模型可能生成 `../../etc/passwd` 这样的路径——不管是有意还是幻觉。**永远不要信任模型生成的路径**，必须做边界检查。这是所有 Coding Agent 的标配安全措施。

## 工具注册表：一个数组就够了

easy-agent 把所有工具放在一个数组里，通过名字查找：

```ts
const allTools = [readTool, writeTool, bashTool, grepTool];

function findToolByName(name) {
  return allTools.find(t => t.name === name);
}

// 转换成 API 需要的格式
function getToolsApiParams() {
  return allTools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema,
  }));
}
```

就是这么简单——**工具注册表本质是一个 Map**，key 是工具名，value 是工具对象。

## LangChain 的 Tool：同一个思想的声明式版本

LangChain 把上面的契约包装成了装饰器/类：

```ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const readTool = tool(
  async ({ file_path }) => {
    return await fs.readFile(file_path, "utf8");
  },
  {
    name: "read_file",
    description: "读取文件内容",
    schema: z.object({
      file_path: z.string().describe("文件路径"),
    }),
  }
);
```

对比一下：

| 裸实现 | LangChain |
|---|---|
| 手写 `inputSchema` JSON Schema | 用 Zod 定义，自动生成 Schema |
| 手写 `call()` 方法 | 直接传一个函数 |
| 手动注册到数组 | `createAgent({ tools: [readTool] })` 自动注入 |
| 手动处理错误 | 框架捕获并转为 tool_result 错误 |

**底层机制完全一样**——LangChain 只是把重复的样板代码收走了。

## 本章要点

1. 工具 = 一份菜单（name + description + inputSchema）
2. 模型不执行代码，它输出结构化的调用工单
3. `description` 是给模型的 prompt，写得清楚调用得准
4. 永远不要信任模型生成的路径——做边界检查
5. LangChain Tool 和裸实现思想相同，只是语法更声明式

→ 下一章：[MCP 协议——工具接入的事实标准](/guides/agent-stack/lc-mcp)
