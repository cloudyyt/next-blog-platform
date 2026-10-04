# RAG 深水区：从能用到好用

> 能跑通 RAG 只需 30 分钟，让 RAG 达到生产水平需要处理五个深水问题。

## 五个深水问题

<figure>
<svg viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RAG 深水区的五个问题：分段策略、混合检索、重排序、评测、幻觉防护">
<rect width="800" height="260" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="258" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="30" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#2C2416">RAG 深水区：五个从能用到好用的分水岭</text>
<!-- 5 个问题 -->
<rect x="24" y="52" width="145" height="90" rx="10" fill="#FEF3EB" stroke="#E8C9B0" stroke-width="1.5"/>
<text x="96" y="76" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2C2416">① 分段策略</text>
<text x="96" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">多大一段合适？</text>
<text x="96" y="110" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">按什么切？</text>
<rect x="183" y="52" width="145" height="90" rx="10" fill="#FDF5E6" stroke="#DBCB9A" stroke-width="1.5"/>
<text x="255" y="76" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2C2416">② 混合检索</text>
<text x="255" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">纯向量不够</text>
<text x="255" y="110" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">+ 关键词匹配</text>
<rect x="342" y="52" width="145" height="90" rx="10" fill="#F0F5EE" stroke="#B8C9AE" stroke-width="1.5"/>
<text x="414" y="76" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2C2416">③ 重排序</text>
<text x="414" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">向量排序 ≠</text>
<text x="414" y="110" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A7A5E">语义相关性</text>
<rect x="501" y="52" width="145" height="90" rx="10" fill="#EDF2F7" stroke="#A8BCD0" stroke-width="1.5"/>
<text x="573" y="76" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2C2416">④ 评测体系</text>
<text x="573" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#5B7FA6">怎么知道变好了？</text>
<text x="573" y="110" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#5B7FA6">召回率 · 准确率</text>
<rect x="660" y="52" width="116" height="90" rx="10" fill="#FEF0EB" stroke="#D4744C" stroke-width="1.5"/>
<text x="718" y="76" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#2C2416">⑤ 幻觉</text>
<text x="718" y="94" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A5A40">检索不到时</text>
<text x="718" y="110" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A5A40">模型会编答案</text>
<!-- 底部 -->
<rect x="24" y="164" width="752" height="76" rx="10" fill="#FBF7EE" stroke="#D4C9A9"/>
<text x="400" y="190" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" fill="#2C2416">能跑通 = 建好了管道。好用 = 管道里每一步都优化过。</text>
<text x="400" y="214" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">面试官问的不是「你会不会搭 RAG」而是「你的 RAG 召回率多少、怎么测的」</text>
</svg>
</figure>

### ① 分段策略

没有万能的 chunkSize。按内容类型选：

| 内容类型 | 推荐分段 | 原因 |
|---|---|---|
| FAQ / 商品说明 | 按条目分（一个 FAQ = 一段） | 天然独立，一段一个答案 |
| 技术文档 | 按 H2/H3 标题分 | 保持语义完整性 |
| 长文 / 论文 | 500-1000 字 + 15% overlap | 平衡召回率和精度 |
| 对话记录 | 按轮次分 | 一轮对话一个上下文 |
| 代码 | 按函数/类分 | 保持逻辑完整 |

```ts
import { MarkdownTextSplitter } from "@langchain/textsplitters";

// Markdown 文档按标题分段
const mdSplitter = new MarkdownTextSplitter({
  chunkSize: 800,
  chunkOverlap: 100,
});
```

### ② 混合检索

纯向量检索的盲区：**关键词匹配**。用户搜「ERR_CONN_RESET」这种错误码，向量检索可能找不到（因为 embedding 把它当成普通文字），但 BM25 关键词检索能精准命中。

```ts
// 混合：向量 + BM25 各取 Top-K，合并去重
const vectorResults = await vectorStore.similaritySearch(query, 5);
const keywordResults = await bm25Retriever.getRelevantDocuments(query, 5);
const merged = dedup([...vectorResults, ...keywordResults]).slice(0, 8);
```

### ③ 重排序

向量检索的排序依据是「余弦相似度」，这不等于「语义相关性」。Reranker 模型（如 Cohere Rerank、bge-reranker）能更准确地判断「这段文字是否真的回答了这个问题」。

```
检索（粗筛）: 从 10000 段中取 Top-20 → 快但粗糙
重排（精排）: 从 Top-20 中精选 Top-3 → 慢但精准
```

### ④ 评测：不测不知道好不好

三个核心指标：

| 指标 | 测什么 | 怎么算 |
|---|---|---|
| 召回率（Recall@K） | 正确答案是否被检索到 | 命中数 / 应命中总数 |
| 准确率（Precision@K） | 检索结果中有多少是相关的 | 相关数 / 返回总数 |
| 忠实度（Faithfulness） | 回答是否基于检索结果 | 人工或 LLM 判断 |

搭一个简单评测集：准备 20-50 个「问题 + 正确答案所在文档段」的配对，每次改动后跑一遍，看召回率变化。

### ⑤ 幻觉防护

检索不到时，模型不会说「不知道」，它会**编一个格式完美的答案**。

```ts
// 在 Prompt 里明确说
const prompt = `基于以下参考资料回答问题。
如果参考资料中没有足够信息，直接说「根据现有资料无法回答」。

参考资料：
{context}

问题：{question}`;
```

这是第一道防线。更严格的做法是在代码层检查：如果检索结果的相似度都低于阈值，直接返回固定话术，不调 LLM。

## 本章要点

1. 分段没有万能值——按内容类型选策略
2. 混合检索 = 向量（语义）+ BM25（关键词），互补盲区
3. Reranker 是「粗筛后精排」，显著提升最终质量
4. 评测不是可选项——没有指标的优化是盲目的
5. 幻觉防护：Prompt 约束 + 代码层阈值兜底

→ 下一章：[部署、可观测与面试](/guides/agent-stack/eng-production)
