# MCP 协议：工具接入的事实标准

> 写一次工具，到处能用。MCP 解决的是每个 Agent 都要重复造「连接外部系统」轮子的问题。

## 问题：N 个 Agent × M 个工具 = N×M 次重复

没有 MCP 之前，每个 Agent 框架都自己定义工具接口：

- LangChain 用 `@tool` 装饰器
- Dify 用插件系统
- Claude Code 用内置工具 + 自己的扩展协议
- 你的项目可能直接写函数

同一个「查天气」工具，要为每个框架写一遍适配。**MCP 的目标就是把这个 N×M 问题变成 N+M**——工具写一次，所有支持 MCP 的 Agent 都能用。

## MCP 的核心思想：USB-C

<figure>
<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MCP 协议：工具提供方和 Agent 使用方通过统一协议连接，像 USB-C 一样即插即用">
<rect width="800" height="280" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="278" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<!-- 左侧：MCP Server（工具提供方） -->
<rect x="24" y="24" width="220" height="180" rx="12" fill="#F0F5EE" stroke="#7A9B6D" stroke-width="1.5"/>
<text x="134" y="50" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#2A3420">MCP Server</text>
<text x="134" y="68" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B8A5E">工具提供方</text>
<rect x="44" y="84" width="180" height="26" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="134" y="101" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#2A3420">天气查询 API</text>
<rect x="44" y="118" width="180" height="26" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="134" y="135" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#2A3420">数据库查询</text>
<rect x="44" y="152" width="180" height="26" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="134" y="169" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#2A3420">文件系统操作</text>
<text x="134" y="196" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">写一次，所有 Agent 都能用</text>
<!-- 中间：MCP 协议 -->
<rect x="290" y="80" width="220" height="70" rx="35" fill="#E8D5C4" stroke="#C4956A" stroke-width="2"/>
<text x="400" y="110" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="#6B4226">MCP 协议</text>
<text x="400" y="132" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A6A50">tools/list · tools/call · 统一 JSON Schema</text>
<!-- 连接线 -->
<line x1="244" y1="115" x2="290" y2="115" stroke="#7A9B6D" stroke-width="2" stroke-linecap="round"/>
<line x1="510" y1="115" x2="556" y2="115" stroke="#C9973F" stroke-width="2" stroke-linecap="round"/>
<!-- 右侧：Agent（使用方） -->
<rect x="556" y="24" width="220" height="180" rx="12" fill="#FDF5E6" stroke="#C9973F" stroke-width="1.5"/>
<text x="666" y="50" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#6B4226">Agent（使用方）</text>
<text x="666" y="68" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">任何支持 MCP 的客户端</text>
<rect x="576" y="84" width="180" height="26" rx="8" fill="#F5E8CE" stroke="#D4B880"/>
<text x="666" y="101" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#3A2E1E">Claude Code</text>
<rect x="576" y="118" width="180" height="26" rx="8" fill="#F5E8CE" stroke="#D4B880"/>
<text x="666" y="135" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#3A2E1E">Codex / Cursor / Dify</text>
<rect x="576" y="152" width="180" height="26" rx="8" fill="#F5E8CE" stroke="#D4B880"/>
<text x="666" y="169" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#3A2E1E">你自己写的 Agent</text>
<text x="666" y="196" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">不用改代码，即插即用</text>
<!-- 底部注释 -->
<text x="400" y="248" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#8A7A5E">之前：N 个 Agent × M 个工具 = N×M 份适配代码</text>
<text x="400" y="268" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#6B4226">有了 MCP：N + M —— 各写各的，协议帮你们连</text>
</svg>
</figure>

## 三种传输方式

MCP Server 和 Agent 之间怎么通信？三种方式，按场景选：

<figure>
<svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MCP 三种传输方式：stdio 本地子进程、HTTP 远程服务、SSE 服务端推送">
<rect width="800" height="200" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="198" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<!-- stdio -->
<rect x="24" y="20" width="240" height="160" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<text x="144" y="46" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2A3420">stdio（本地）</text>
<text x="144" y="66" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#6B8A5E">Agent 启动子进程，stdin/stdout 通信</text>
<rect x="44" y="82" width="200" height="24" rx="8" fill="#E2ECD9" stroke="#A8BE98"/>
<text x="144" y="98" text-anchor="middle" font-family="sans-serif" font-family="monospace" font-size="9" fill="#2A3420">command: npx my-mcp-server</text>
<text x="144" y="128" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">✓ 零延迟 · ✓ 无网络配置</text>
<text x="144" y="146" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">✗ 只能本地用 · ✗ 需要运行时</text>
<text x="144" y="168" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#7A9B6D">适合：本地开发工具</text>
<!-- http -->
<rect x="284" y="20" width="240" height="160" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1.5"/>
<text x="404" y="46" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#3A2E1E">HTTP（远程）</text>
<text x="404" y="66" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">标准 HTTP 请求/响应</text>
<rect x="304" y="82" width="200" height="24" rx="8" fill="#F5E8CE" stroke="#D4B880"/>
<text x="404" y="98" text-anchor="middle" font-family="monospace" font-size="9" fill="#3A2E1E">url: https://api.example.com/mcp</text>
<text x="404" y="128" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">✓ 可远程部署 · ✓ 可共享给多人</text>
<text x="404" y="146" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">✗ 有网络延迟 · 需要鉴权</text>
<text x="404" y="168" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#C9973F">适合：团队共享工具</text>
<!-- sse -->
<rect x="544" y="20" width="232" height="160" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="660" y="46" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1E2E3E">SSE（推送）</text>
<text x="660" y="66" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#5B7FA6">服务端主动推送事件流</text>
<rect x="564" y="82" width="192" height="24" rx="8" fill="#DCE6EF" stroke="#94B0C8"/>
<text x="660" y="98" text-anchor="middle" font-family="monospace" font-size="9" fill="#1E2E3E">Accept: text/event-stream</text>
<text x="660" y="128" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">✓ 实时通知 · ✓ 长连接</text>
<text x="660" y="146" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">✗ 连接管理复杂</text>
<text x="660" y="168" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#5B7FA6">适合：需要推送的场景</text>
</svg>
</figure>

## easy-agent 的 MCP 实现

[easy-agent](https://github.com/ConardLi/easy-agent) Step 16 实现了完整的 MCP Client。核心流程只需四步：

<figure>
<svg viewBox="0 0 800 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MCP Client 四步流程：读配置 → 建连接 → 拉工具列表 → 包装为本地工具">
<defs>
<marker id="mcp-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#8A7A5E"/>
+</marker>
+</defs>
<rect width="800" height="170" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="168" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<rect x="24" y="36" width="160" height="72" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="104" y="62" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">① 读配置</text>
<text x="104" y="82" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">settings.json 里</text>
<text x="104" y="96" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">的 mcpServers 字段</text>
<line x1="184" y1="72" x2="206" y2="72" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#mcp-arr)"/>
<rect x="210" y="36" width="160" height="72" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1.5"/>
<text x="290" y="62" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">② 建连接</text>
<text x="290" y="82" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">按 type 启动子进程</text>
<text x="290" y="96" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">或发 HTTP 请求</text>
<line x1="370" y1="72" x2="392" y2="72" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#mcp-arr)"/>
<rect x="396" y="36" width="160" height="72" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<text x="476" y="62" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2A3420">③ 拉工具列表</text>
<text x="476" y="82" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">发 tools/list 请求</text>
<text x="476" y="96" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#6B8A5E">拿到 JSON Schema</text>
<line x1="556" y1="72" x2="578" y2="72" stroke="#8A7A5E" stroke-width="1.5" marker-end="url(#mcp-arr)"/>
<rect x="582" y="36" width="194" height="72" rx="10" fill="#FEF3EB" stroke="#E8C9B0" stroke-width="1.5"/>
<text x="679" y="62" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#2C2416">④ 包装为本地工具</text>
<text x="679" y="82" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">mcp__serverName__toolName</text>
<text x="679" y="96" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">Agent 像用内置工具一样用</text>
<text x="400" y="140" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#A89878">Agent 不需要知道工具是本地的还是远程的——MCP 把差异屏蔽了</text>
</svg>
</figure>

### 第一步：配置就长这样

```json
// settings.json
{
  "mcpServers": {
    "weather": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@mcp/weather-server"]
    },
    "github": {
      "type": "http",
      "url": "https://mcp.github.com/sse",
      "headers": { "Authorization": "Bearer xxx" }
    }
  }
}
```

### 第二步：连接后拉工具列表

```ts
const result = await connection.client.request({
  method: "tools/list"
});
// 返回：[{ name: "get_weather", description: "…", inputSchema: { … } }]
```

### 第三步：包装为本地工具

```ts
function buildToolAdapter(connection, mcpTool) {
  return {
    name: `mcp__${connection.name}__${mcpTool.name}`,
    description: mcpTool.description,
    inputSchema: mcpTool.inputSchema,
    async call(input) {
      const result = await connection.client.request({
        method: "tools/call",
        params: { name: mcpTool.name, arguments: input },
      });
      return { content: result.content[0].text, isError: result.isError };
    },
  };
}
```

碎开来说这段代码干了什么：

1. **命名规范** `mcp__serverName__toolName`——防止不同 Server 的同名工具冲突
2. **直接复用 MCP Server 返回的 `inputSchema`**——不需要自己重新定义参数
3. **`call()` 内部发 `tools/call` 请求**——对 Agent 来说，这个 MCP 工具和内置工具完全没区别

## 为什么说 MCP 是「事实标准」

2026 年的数据：月下载近亿、数千个开源 Server、所有主流 Agent 框架都已支持。

对你的意义：**学一次 MCP，写的工具能在 Claude Code、Codex、Cursor、Dify 里通用**。面试时能讲清楚 MCP 的三种传输方式和工具适配器模式，就是差异化加分。

## 本章要点

1. MCP 解决 N×M 适配问题 → N+M 各写各的
2. 三种传输：stdio（本地子进程）、HTTP（远程）、SSE（推送）
3. Client 四步：读配置 → 建连接 → 拉 tools/list → 包装为本地工具
4. 命名规范 `mcp__server__tool` 防冲突
5. Agent 不感知工具是本地还是远程——MCP 把差异屏蔽了

→ 下一章：[记忆与多轮对话](/guides/agent-stack/lc-memory)
