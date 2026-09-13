# Phase 6 · RAG 与企业知识库

> 让模型用你的私有数据回答问题，而不是它的预训练记忆。
> 这一章讲清"为什么要 RAG"、完整流水线、和实战中最容易踩的坑。

---

## 本章你将解决什么

读完这一章，你应该能：

- 讲清 RAG 相比 Fine-tuning 的**本质优势**（不是"更便宜"这种表面理由）
- 独立搭一条完整的 RAG 流水线：文档切块 → 向量化 → 检索 → 重排 → 生成
- 诊断"检索召回率低"、"模型瞎编"、"成本爆炸"这三类常见故障
- 在工程上做出向量数据库、切块策略、Top-K 的合理选型

> 前置知识：Phase 0 的 Embedding/RAG 术语 + Phase 3 的 Qwen 调用 + Phase 5 的 Prompt 工程。

---

## 为什么 RAG 是企业级 Agent 的核心能力

任何严肃的 Agent 项目，几乎都会遇到这个问题：

> "让模型用我们的内部文档/数据库/API/知识库回答问题。"

直接用 LLM 的预训练知识？不行——它不知道你的私有数据，更不知道昨天刚更新的内容。

三种解法：

| 方案 | 怎么做 | 适合什么 |
|------|--------|---------|
| **直接塞进 Prompt** | 把所有资料贴进 context | 资料总量 < 5K token |
| **RAG** | 检索相关片段，注入 prompt | **80% 企业场景的最佳选择** |
| **Fine-tuning** | 用数据训练模型 | 改变模型基础行为，不是注入知识 |

90% 的"模型不够懂我们业务"问题，RAG 是正确答案。

---

## 原因 1：为什么 RAG 比 Fine-tuning 更适合"注入知识"

这是新人最容易想错的问题。直觉上"训练过的更可靠"，但事实相反。

### 参数化 vs 非参数化记忆

**Fine-tuning 是参数化记忆**：
- 知识被"烤进"模型权重里
- 你问"产品 X 的价格"，模型从权重里"回忆"
- **缺点**：回忆是模糊的、不可更新的、无法审计的

**RAG 是非参数化记忆**：
- 知识存在外部数据库
- 你问"产品 X 的价格"，模型先**检索**，再基于检索结果回答
- **优点**：精确、可即时更新、可审计（你能看到模型"看了什么"）

### 一个对比例子

假设你的产品文档说"高级版 ¥99/月"。

**Fine-tuning 后**：
```
Q: 高级版多少钱？
A: 大概是 99 元左右（参数化记忆，模糊）
```

**RAG 后**：
```
[检索到的片段] "高级版订阅价格为 ¥99/月，含 5 个账号席位。"

Q: 高级版多少钱？
A: 高级版 ¥99/月，包含 5 个账号席位。（基于精确文本，准确）
```

### 关键工程权衡

| 维度 | RAG | Fine-tuning |
|------|-----|-------------|
| 知识更新 | **改数据库即可，秒级** | 重新训练，小时-天级 |
| 精确度 | **基于原文，可审计** | 模糊回忆，不可审计 |
| 成本 | 检索 + 推理（便宜） | 训练 + 推理（贵） |
| 适用 | **注入事实性知识** | 改变输出风格/格式/领域语感 |

**判断标准**：如果你的需求是"模型要准确说出 X"，用 RAG；如果是"模型要用 Y 风格说话"，用 Fine-tuning。**90% 业务需求是前者**。

---

## 原因 2：为什么 chunk（切块）大小是核心权衡

RAG 的第一步是把长文档切成小块（chunk），再做向量化和检索。chunk 太大或太小都会出问题。

### 两个极端的坑

**chunk 太小（如 50 字一段）**：
- 检索精准，但每个 chunk 缺上下文
- 模型只看到"5.2 节 价格：¥99"，不知道是哪个产品的价格
- **症状**：模型回答缺乏背景，频繁出现"指的是什么？"

**chunk 太大（如 2000 字一段）**：
- 每个 chunk 信息密度低
- 向量化后语义被稀释，检索精度下降
- 注入 prompt 时 token 浪费严重
- **症状**：明明相关 chunk 被检索到了，但模型回答还是不准

### 三种主流切块策略

**策略 1：固定大小切块**（最简单）
```
每 500 字符切一刀，相邻 chunk 重叠 50 字符
```
适合：文档结构均匀（如新闻、博客）
缺点：可能从句子中间切断

**策略 2：语义切块**（推荐）
```
按段落/标题/自然语义边界切
```
适合：结构化文档（Markdown、HTML、技术文档）
工具：LangChain 的 `RecursiveCharacterTextSplitter`

**策略 3：父子切块**（高级）
```
检索时用小块（200 字），注入时扩展到父块（1000 字）
```
适合：精度要求高的场景（法律、医疗）
原理：小块检索精准，大块注入有上下文

### 经验默认值

```
chunk_size = 500 字符
overlap = 50 字符
split_by = ["\n\n", "\n", "。", "！", "？", " "]
```

这是 80% 场景的合理起点。如果效果不好，再按"太小→加大、太大→切小、断句怪→换 splitter"调整。

---

## 原因 3：为什么要 Rerank（重排）

这是 RAG 工程里最容易被跳过、但回报最高的一步。

### 向量检索的局限

向量检索（如 `text-embedding-v4`）能找到"语义相近"的 chunk。但"语义相近"≠"任务相关"。

举例：用户问"Qwen-Plus 的价格"。

向量检索可能返回 Top-5：
1. "Qwen-Plus 是阿里云的均衡模型"（语义相近，但**没回答价格**）
2. "Qwen-Plus 价格：$0.115/M token"（**真正相关**）
3. "Qwen-Max 比 Qwen-Plus 贵 14 倍"（提到了价格，但**不是直接答案**）
4. "通义千问模型系列介绍"（语义相近，**无关**）
5. "Qwen-Plus 上下文窗口 1M"（语义相近，**无关**）

**问题**：真正的答案在第 2 位，但模型可能被第 1 位"带偏"。

### Rerank 解决什么

Rerank 用 **cross-encoder**（交叉编码器）重新评分每个 chunk 对当前 query 的相关性。它和向量检索的差异：

| 维度 | 向量检索（Bi-encoder） | Rerank（Cross-encoder） |
|------|---------------------|----------------------|
| 计算方式 | query 和 chunk **分别**向量化，算余弦相似度 | query 和 chunk **拼接**输入，模型直接打分 |
| 速度 | 极快（毫秒级） | 慢（10-100ms） |
| 精度 | 中（适合召回） | 高（适合精排） |
| 用法 | 从 10 万 chunk 召回 Top-100 | 从 Top-100 精排出 Top-10 |

### 两阶段检索（行业标准）

```
全量知识库（10 万 chunk）
    ↓ 向量检索（快）
Top-100 候选
    ↓ Rerank（精）
Top-5 注入 prompt
    ↓ LLM 生成
最终回答
```

**关键**：向量检索负责"广撒网"，Rerank 负责"精挑选"。两者协同，比单一阶段准得多。

### 阿里云的 RAG 标准组合

- **向量化**：`text-embedding-v4`（1024 维，中文表现好）
- **Rerank**：`qwen3-rerank`（专为中文优化）
- **生成**：`qwen-plus` 或 `qwen3.7-max`

---

## 完整 RAG 流水线（Python 实战）

下面是一份能跑的最小 RAG 实现，覆盖完整流水线。

```python
"""
Phase 6 · 最小 RAG 实现
依赖：uv add openai httpx
"""
import os
import json
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

# ============================================
# Step 1: 文档切块
# ============================================
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """按固定大小切块，相邻块有重叠"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap  # 重叠部分
    return chunks

# ============================================
# Step 2: 向量化（用 text-embedding-v4）
# ============================================
def embed(texts: list[str]) -> list[list[float]]:
    """批量向量化"""
    response = client.embeddings.create(
        model="text-embedding-v4",
        input=texts,
        dimensions=1024,  # 可选 768/1024/1536
    )
    return [item.embedding for item in response.data]

# ============================================
# Step 3: 向量检索（这里用最简单的内存实现）
# ============================================
import math

def cosine_similarity(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b)) / (
        math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b))
    )

def vector_search(query_vec: list[float], corpus: list[dict], top_k: int = 10) -> list[dict]:
    """从语料库检索 Top-K 最相似的 chunk"""
    scored = [
        {**item, "score": cosine_similarity(query_vec, item["vector"])}
        for item in corpus
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]

# ============================================
# Step 4: Rerank（用 qwen3-rerank）
# ============================================
def rerank(query: str, candidates: list[dict], top_n: int = 5) -> list[dict]:
    """调用 qwen3-rerank API 重排"""
    import httpx

    url = "https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank"
    headers = {
        "Authorization": f"Bearer {os.getenv('DASHSCOPE_API_KEY')}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "qwen3-rerank",
        "query": query,
        "documents": [c["text"] for c in candidates],
        "top_n": top_n,
        "return_documents": False,
    }

    resp = httpx.post(url, headers=headers, json=payload, timeout=30)
    result = resp.json()

    # 把 rerank 分数映射回原 chunk
    reranked = []
    for item in result["output"]["results"]:
        idx = item["index"]
        reranked.append({**candidates[idx], "rerank_score": item["relevance_score"]})
    return reranked

# ============================================
# Step 5: 生成（带 RAG 上下文）
# ============================================
def generate(query: str, context_chunks: list[str]) -> str:
    """基于检索到的 chunk 生成回答"""
    context = "\n\n".join(
        f"【片段 {i+1}】\n{chunk}" for i, chunk in enumerate(context_chunks)
    )

    prompt = f"""你的任务：基于下方参考片段回答用户问题。

规则：
- 只基于参考片段的事实，不要编造
- 如果参考片段里没有答案，明确说"参考片段中没有相关信息"
- 引用事实时标注片段编号，如"根据【片段 2】..."

【参考片段开始】
{context}
【参考片段结束】

用户问题：{query}

回答："""

    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,  # RAG 场景调低，减少"创意"
    )
    return response.choices[0].message.content

# ============================================
# 完整流程
# ============================================
def rag_query(query: str, corpus: list[dict]) -> str:
    """完整 RAG 查询：检索 → 重排 → 生成"""
    # 1. 向量化 query
    query_vec = embed([query])[0]

    # 2. 向量检索 Top-10
    candidates = vector_search(query_vec, corpus, top_k=10)

    # 3. Rerank 取 Top-5
    reranked = rerank(query, candidates, top_n=5)

    # 4. 注入 prompt 生成
    return generate(query, [c["text"] for c in reranked])


# ============================================
# 测试
# ============================================
if __name__ == "__main__":
    # 模拟知识库
    raw_docs = [
        "Qwen-Plus 是阿里云通义千问的均衡档模型，输入价格 $0.115/百万 token，输出 $0.287/百万 token。上下文窗口 1M token，适合日常主力使用。",
        "Qwen-Flash 是极致低成本档，输入 $0.022/百万 token，适合大规模批处理任务，如 RAG 检索问答、文档分类。",
        "Qwen3.7-Max 是旗舰档，输入 $1.65/百万 token，适合复杂 Agent 任务和长周期规划。",
        # ... 更多文档
    ]

    # 离线预处理：切块 + 向量化（生产环境应该缓存到向量数据库）
    corpus = []
    for doc in raw_docs:
        for chunk in chunk_text(doc):
            corpus.append({
                "text": chunk,
                "vector": embed([chunk])[0],
            })

    # 在线查询
    print(rag_query("Qwen-Plus 多少钱？", corpus))
    # 输出：根据【片段 1】，Qwen-Plus 输入价格 $0.115/百万 token，输出 $0.287/百万 token。
```

**这个实现的关键点**：
- 用 `text-embedding-v4` 做向量化（中文友好）
- 两阶段检索（向量召回 Top-10 → Rerank 精排 Top-5）
- Prompt 里明确"不要编造、找不到就说找不到"
- temperature=0.1（RAG 场景要稳定，不要创意）

---

## 工程化：向量数据库选型

上面的示例用内存存向量。**生产环境必须用向量数据库**。

### 三类方案

**方案 A：专用向量数据库**（如 Milvus、Qdrant、Pinecone）
- 性能最好，专门为向量检索优化
- 适合：千万级以上 chunk，高并发检索

**方案 B：现有数据库的向量扩展**（如 PostgreSQL + pgvector、Redis + RedisVector）
- 复用现有基础设施
- 适合：中小规模（百万级 chunk）

**方案 C：托管云服务**（如阿里云 Tair 向量版、AnalyticDB、OpenSearch 向量版）
- 免运维
- 适合：不想自己运维向量数据库的团队

### 阿里云上的选项

| 产品 | 适合场景 | 价格档 |
|------|---------|--------|
| **Tair 向量版**（兼容 Redis） | 实时低延迟，<1000 万 chunk | 中等 |
| **AnalyticDB PostgreSQL** | 结构化+非结构化混合分析 | 中等 |
| **OpenSearch 向量版** | 全文+向量混合检索 | 中等 |
| **Milvus 阿里云托管版** | 开源生态偏好 | 高 |
| **PolarVector** | 已用 PolarDB 的业务 | 中等 |

**前端工程师的建议**：从 **PostgreSQL + pgvector** 起步。它在你已有的数据库上加向量能力，运维负担最小。等数据量超过 100 万 chunk 再考虑专用向量数据库。

---

## 实际工作中最容易踩的 5 个坑

### 坑 1：召回率低，模型说"找不到"

**症状**：明明知识库里有答案，模型却说"参考片段中没有相关信息"。

**排查清单**：
1. **chunk_size 太大？** 信息被稀释，向量不够聚焦。试 300-500 字符
2. **embedding 模型不对？** 中文场景必须用 `text-embedding-v4` 或类似中文优化模型，不要用面向英文的模型
3. **Top-K 太小？** 从 Top-5 加到 Top-10 看看
4. **没做 Rerank？** 加上 Rerank，召回率往往提升 20-30%
5. **query 和文档语言不一致？** 如 query 是中文、文档是英文，需要先翻译或用多语言 embedding 模型

### 坑 2：模型"瞎编"参考片段里没有的内容

**症状**：模型回答看起来合理，但参考片段里根本没说。

**原因**：LLM 倾向于"填补空白"，即使没看到答案也会基于预训练知识编造。

**解决**：
```
Prompt 加这几条：
- "如果参考片段里没有明确答案，必须回答「参考片段中没有相关信息」"
- "不要基于预训练知识补充，所有事实必须有片段编号引用"
- temperature 调到 0.1 或更低
```

### 坑 3：成本爆炸

**症状**：每次查询扣几毛钱，一天下来几百块。

**原因**：
- Top-K 太大，每次注入 10 个长 chunk（每个 1000 字符 = 500 token）
- 每次查询都全量重新向量化文档（应该缓存）

**解决**：
- 文档向量化只做**一次**（离线预处理）
- 在线查询只向量化 query（短，几十 token）
- Top-K 控制在 3-5
- 用 `qwen-flash` 做简单分类，`qwen-plus` 只在生成阶段用

### 坑 4：文档格式杂乱（PDF、Word、图片）

**症状**：想给模型喂 PDF/Word/扫描件，但提取出来的文本乱七八糟。

**解决**：
- **PDF**：用 `pdfplumber` 或 `pypdf`，复杂版式用 `unstructured`
- **Word**：用 `python-docx`
- **扫描件/图片**：用 OCR 模型（如 `qwen-vl-ocr`）
- **HTML**：用 `BeautifulSoup` 清洗标签
- **结构化拆分**：先按章节/标题切，再按段落切

### 坑 5：实时更新困难

**症状**：知识库每天更新，但向量化要跑半小时。

**解决**：
- 增量更新：只向量化新增/修改的 chunk，不重新全量
- 用支持增量写入的向量数据库（Tair、Milvus 都支持）
- 后台异步任务（如 Celery）处理新文档

---

## 一个常见架构误解

> **误解**：RAG 就是"搜索 + LLM"，搜索用 Elasticsearch 就行。

**事实**：传统搜索（关键词匹配）和向量检索（语义匹配）解决不同问题：

| 查询类型 | 关键词搜索 | 向量检索 |
|---------|----------|---------|
| "Qwen 价格" | 精确匹配 "价格" 关键词 | 找"费用/计费/成本"等同义内容 |
| "怎么部署" | 必须有 "部署" 这个词 | 找"上线/运行/发布"等语义相关内容 |
| 错别字查询 | 找不到 | 能找到（语义相近） |

**最佳实践：混合检索（Hybrid Search）** = 关键词检索 + 向量检索 + Rerank 融合。OpenSearch 向量版、Tair 都原生支持。

---

## 本章检查清单

- [ ] 我能讲清 RAG vs Fine-tuning 的本质区别（参数化 vs 非参数化记忆）
- [ ] 我跑通了完整 RAG 流水线（向量化 → 检索 → 重排 → 生成）
- [ ] 我知道 chunk_size 太大/太小的症状
- [ ] 我理解为什么要两阶段检索（向量召回 + Rerank 精排）
- [ ] 我能诊断"召回率低"、"模型瞎编"、"成本爆炸"三类故障
- [ ] 我知道混合检索（关键词 + 向量）比单一检索更准

---

## 下一步

核心能力三章（Phase 4 工具调用 / Phase 5 Prompt / Phase 6 RAG）已经完成。你已经具备做企业级 Agent 的全部基础能力。

接下来进入**系统化**：

- **Phase 7 · Agent 框架与编排**——把单次调用升级成自主决策的 Agent 系统
- **Phase 8 · 工程化上线**——把 demo 变成可维护、可观测、可扩展的生产系统

读完这两章，你就具备独立交付 Agent 项目的完整能力。
