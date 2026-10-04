# RAG 代码化：拆开 Dify 的黑盒

> Dify 篇你拖拽过知识库，这一章用代码重做一遍——看看平台替你做了什么。

## Dify 帮你藏了什么

<figure>
<svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dify 知识库 vs 代码 RAG：同样的流程，Dify 隐藏了分段、Embedding、检索三个步骤">
<rect width="800" height="200" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="198" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="28" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">Dify 里你看到的 vs 底层实际发生的</text>
<!-- Dify 表面 -->
<rect x="24" y="50" width="360" height="60" rx="10" fill="#FDF0E7" stroke="#C4956A" stroke-width="1.5"/>
<text x="204" y="74" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#6B4226">Dify 界面：拖拽文档 → 建知识库 → 挂到应用</text>
<text x="204" y="94" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A6A50">3 步搞定</text>
<!-- 箭头 -->
<text x="420" y="84" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#8A7A5E">⇄</text>
<!-- 代码层 -->
<rect x="456" y="42" width="320" height="130" rx="10" fill="#F0F5EE" stroke="#7A9B6D" stroke-width="1.5"/>
<text x="616" y="64" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#2A3420">代码实际做的事：</text>
<text x="476" y="86" font-family="sans-serif" font-size="10" fill="#4A5E3E">① 文档分段（chunking）</text>
<text x="476" y="104" font-family="sans-serif" font-size="10" fill="#4A5E3E">② 每段计算 Embedding 向量</text>
<text x="476" y="122" font-family="sans-serif" font-size="10" fill="#4A5E3E">③ 存入向量数据库</text>
<text x="476" y="140" font-family="sans-serif" font-size="10" fill="#4A5E3E">④ 用户问题 → Embedding → 相似度检索</text>
<text x="476" y="158" font-family="sans-serif" font-size="10" fill="#4A5E3E">⑤ 取 Top-K 结果 → 拼进 Prompt → 调 LLM</text>
</svg>
</figure>

Dify 把五步包装成了三步拖拽。代码化不是「更难」，是**把控制权拿回来**。

## 用 LangChain 写一个最小 RAG

### 第一步：文档分段

```ts
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,      // 每段最多 1000 字符
  chunkOverlap: 200,    // 段间重叠 200 字符，防止语义被切断
});

const chunks = await splitter.splitDocuments(docs);
// 结果：[{ pageContent: "第一段…", metadata: { source: "faq.md" } }, …]
```

**为什么需要分段？** Embedding 模型对短文本效果更好（一段话算一个向量，比整篇文档算一个向量精准）。分段是检索质量的基础。

**为什么要重叠？** 如果一个答案恰好跨两个段落的边界，重叠区能保证至少有一个完整的段包含它。

### 第二步：Embedding + 向量库

```ts
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.DEEPSEEK_API_KEY,
  modelName: "text-embedding-v3",
});

// 内存向量库（开发用；生产换 PGVector / Milvus）
const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
```

Embedding 做的事：**把每段文字变成一个高维向量**（如 1536 维），语义相近的段落在向量空间中距离也近。

### 第三步：检索链

```ts
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({ modelName: "deepseek-chat" });

const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever({
  k: 3,  // 取最相似的前 3 段
}));

const answer = await chain.invoke({
  query: "盐焗鸡能放几天？",
});
```

这行代码内部做了什么：

1. 把「盐焗鸡能放几天？」计算成向量
2. 在向量库里找到最相似的 3 段
3. 把这 3 段拼进 Prompt：「以下是参考资料：… 请基于资料回答」
4. 调用 LLM 生成回答

## Dify vs 代码的取舍

| 维度 | Dify | LangChain 代码 |
|---|---|---|
| 上手速度 | 30 分钟 | 半天 |
| 分段策略 | 固定（自动 + 自定义分隔符） | 完全可控（Recursive/Token/Markdown） |
| Embedding 模型 | 内置几种 | 任意（OpenAI/本地/免费） |
| 向量库 | 内置 | 任意（PGVector/Milvus/Qdrant/Memory） |
| 检索策略 | Top-K | Top-K + MMR + 过滤 + 重排 |
| 调试 | 黑盒（只能看最终回答） | 透明（每一步都能打日志） |
| 部署 | 平台托管 | 你的服务器 |

**经验法则**：原型用 Dify，产品用代码。Dify 帮你快速验证「RAG 能不能解决这个问题」，代码帮你在验证后做深度优化。

## 本章要点

1. Dify 的三步拖拽底下是五步：分段 → Embedding → 存储 → 检索 → 拼 Prompt
2. 分段是检索质量的基础——chunkSize 和 overlap 直接影响召回率
3. Embedding 把文字变成向量，语义相近 = 距离相近
4. RetrievalQAChain 一行代码完成检索+生成，但内部每一步都可替换
5. 原型用 Dify，产品用代码——先验证可行性，再拿回控制权

→ 下一章：[MCP 协议](/guides/agent-stack/lc-mcp)
