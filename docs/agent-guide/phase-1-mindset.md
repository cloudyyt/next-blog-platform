# Phase 1 · 心智模型迁移

> 这一章没有代码，只有"为什么"。
> 如果你只读一章节，应该是这一章——因为它决定了你写 Agent 代码时的每一个直觉反应对不对。

<figure>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 280" role="img" aria-label="从前端思维迁移到 Agent 思维">
    <defs>
      <linearGradient id="mig" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3b82f6"/>
        <stop offset="1" stop-color="#10b981"/>
      </linearGradient>
      <marker id="marr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#64748b"/>
      </marker>
    </defs>
    <rect width="800" height="280" rx="16" fill="#0f172a"/>
    <text x="400" y="42" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="18" font-weight="700" fill="#e2e8f0">Phase 1 · 心智模型迁移</text>
    <text x="400" y="64" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#64748b">不学新 API，而是换一套"认知操作系统"</text>
    <rect x="40" y="100" width="280" height="130" rx="12" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="180" y="128" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="14" font-weight="700" fill="#60a5fa">前端思维</text>
    <text x="180" y="154" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">输入决定输出</text>
    <text x="180" y="174" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">测试要确定性</text>
    <text x="180" y="194" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">bug 必须能复现</text>
    <text x="180" y="214" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#94a3b8">能复现 = 是 bug</text>
    <line x1="325" y1="165" x2="475" y2="165" stroke="url(#mig)" stroke-width="3" marker-end="url(#marr)"/>
    <text x="400" y="152" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#f59e0b">迁移</text>
    <rect x="480" y="100" width="280" height="130" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="620" y="128" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="14" font-weight="700" fill="#34d399">Agent 思维</text>
    <text x="620" y="154" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">输入 → 一个概率分布</text>
    <text x="620" y="174" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">测试用评分矩阵</text>
    <text x="620" y="194" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">用 eval 集统计出错率</text>
    <text x="620" y="214" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#94a3b8">输出会漂移是常态</text>
    <text x="400" y="262" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#64748b">同一份代码、同一套逻辑，套错了心智模型就处处碰壁</text>
  </svg>
  <figcaption>这一章讲的是"换操作系统"，不是"装新软件"</figcaption>
</figure>

---

## 本章你将解决什么

读完这一章，你应该能：

- 讲清**为什么 LLM 的输出是非确定性的**（从注意力机制层面，不是"它就是概率"这种空话）
- 解释**为什么 Prompt 不是咒语**（理解了这点，你才不会陷入"提示词玄学"）
- 识别自己身上的**前端本能**，并知道哪些在 Agent 世界里会害你
- 在工程评审时讲清"为什么这个 bug 是模型本质决定的，不是代码 bug"——这是中高级工程师的核心能力

> 前置知识：读过 Phase 0 · 术语地基。不需要会 Python，不需要调过 API。

---

## 为什么这一章重要

Agent 项目里最难判断的不是"怎么写代码"，而是"这个 bug 该归到哪一层"：

- 是**模型本质问题**？要靠 prompt 重写、few-shot、eval 集解决
- 是**工程问题**？要靠代码、重试、降级、超时控制解决
- 是**数据问题**？要靠 RAG、知识库清洗、切块策略解决

判断错了，你会用错工具——比如用 retry 去解决"模型选错工具"（应该改 prompt），或者用 prompt 优化去解决"API 超时"（应该加重试）。

这一章建立的"概率性思维"，是这种判断力的源头。

---

## 核心思路：先打破一个幻觉

很多前端转 Agent 的人，第一周会经历这个过程：

```
Day 1：调通 API，输出 "你好世界" → 惊呼 "AI 真神"
Day 3：同一段 prompt 跑两次，输出不一样 → 困惑
Day 7：改了 prompt 一行字，输出完全跑偏 → 怀疑人生
Day 14：开始迷信"咒语式 prompt"，开始收藏"神奇提示词" → 走错路
```

我当年就是 Day 14 走偏的那个。那时候我把"让 GPT-3.5 稳定输出 JSON"的某条 prompt 当宝贝一样存在收藏夹里，还顺手转发给同事显摆——直到一周后发现它在另一个模型上完全失效，我才意识到：**问题不是 prompt 写得不够好，是我在用写 CSS 的方式去调一个概率系统。**

这条路走偏的根因是：**你还在用"确定性思维"对待一个"概率性系统"**。这一章的目标，是让你跳过 Day 7-14 的弯路，直接建立正确直觉。

---

## Why 1：为什么 LLM 是"概率函数"——从注意力机制讲起

这是最核心的一个 Why。不讲清这个，后面所有内容都建不起来。

### 表面现象 vs 深层原因

**表面**：同一段 prompt 跑两次，输出不一样。
**深层**：这不是"随机数种子"的问题，是模型架构本身就是概率性的。

### 一个简化的注意力机制故事

LLM 的核心运算叫 **self-attention（自注意力）**。你可以把它想象成：

> 模型在生成每个 token 时，会对"前面所有 token"做一次加权平均，**权重不是固定的，是模型根据上下文动态算出来的**。

具体来说，对于输入序列 `[A, B, C]`，要预测下一个 token `D` 时：

```
D 的概率分布 = f(A, B, C 的某种加权组合)
              ↑
         这个加权组合是模型权重 × 输入 共同决定的
```

关键事实：**输出不是"查表"，是"一次浮点矩阵运算 + 一次 softmax 归一化"**。归一化后得到的是词表上每个 token 的概率（比如 "苹果 0.31 / 橘子 0.27 / 桃子 0.18 / ..."），然后从中**采样**。

这一步非常关键，因为它直接对应了你日常看到的"模型不稳定"。下面这张图把这个"输入 → 分布 → 采样"的过程画出来，看完你就明白为什么同样的输入会跑出不同输出。

<figure>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" role="img" aria-label="LLM 概率函数：同一个输入产生一个分布，采样得到不同输出">
    <defs>
      <linearGradient id="distg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3b82f6"/>
        <stop offset="1" stop-color="#8b5cf6"/>
      </linearGradient>
      <marker id="darr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#64748b"/>
      </marker>
    </defs>
    <rect width="800" height="360" rx="16" fill="#0f172a"/>
    <text x="400" y="38" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="18" font-weight="700" fill="#e2e8f0">LLM 不是查表，是一个"采样器"</text>
    <rect x="30" y="130" width="180" height="100" rx="10" fill="#1e293b" stroke="#64748b"/>
    <text x="120" y="158" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" font-weight="600" fill="#94a3b8">同一个输入</text>
    <text x="120" y="180" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#cbd5e1">"用一个词形容</text>
    <text x="120" y="196" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#cbd5e1">这个苹果"</text>
    <text x="120" y="214" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#64748b">prompt 完全一致</text>
    <line x1="215" y1="180" x2="260" y2="180" stroke="#475569" stroke-width="2" marker-end="url(#darr)"/>
    <text x="237" y="170" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#94a3b8">推理</text>
    <rect x="265" y="70" width="270" height="220" rx="10" fill="#1e293b" stroke="url(#distg)" stroke-width="2"/>
    <text x="400" y="96" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" font-weight="700" fill="#60a5fa">一个概率分布</text>
    <text x="400" y="112" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#64748b">softmax 后的 token 概率</text>
    <rect x="285" y="220" width="60" height="55" fill="#3b82f6" opacity="0.75"/>
    <text x="315" y="240" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#f8fafc">红</text>
    <text x="315" y="256" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#f8fafc">0.38</text>
    <rect x="350" y="235" width="60" height="40" fill="#6366f1" opacity="0.75"/>
    <text x="380" y="252" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#f8fafc">甜</text>
    <text x="380" y="268" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#f8fafc">0.27</text>
    <rect x="415" y="248" width="60" height="27" fill="#8b5cf6" opacity="0.7"/>
    <text x="445" y="262" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#f8fafc">圆</text>
    <text x="445" y="272" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="9" fill="#f8fafc">0.18</text>
    <rect x="480" y="262" width="40" height="13" fill="#a78bfa" opacity="0.6"/>
    <text x="500" y="272" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="9" fill="#cbd5e1">…</text>
    <text x="400" y="288" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#64748b">分布是模型权重决定的，对同一 prompt 几乎不变</text>
    <line x1="540" y1="180" x2="585" y2="180" stroke="#475569" stroke-width="2" marker-end="url(#darr)"/>
    <text x="562" y="170" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#94a3b8">采样</text>
    <rect x="590" y="80" width="180" height="70" rx="10" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
    <text x="680" y="105" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#34d399">Run 1</text>
    <text x="680" y="128" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" fill="#e2e8f0">"红"</text>
    <text x="680" y="142" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="9" fill="#64748b">采到了 0.38 那个</text>
    <rect x="590" y="160" width="180" height="70" rx="10" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
    <text x="680" y="185" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#34d399">Run 2</text>
    <text x="680" y="208" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" fill="#e2e8f0">"甜"</text>
    <text x="680" y="222" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="9" fill="#64748b">采到了 0.27 那个</text>
    <rect x="590" y="240" width="180" height="70" rx="10" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
    <text x="680" y="265" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#34d399">Run 3</text>
    <text x="680" y="288" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" fill="#e2e8f0">"圆"</text>
    <text x="680" y="302" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="9" fill="#64748b">小概率事件也会发生</text>
    <text x="400" y="340" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#94a3b8">"输出不稳定"不是 bug，是"采样"这个动作的本质属性</text>
  </svg>
  <figcaption>同样的 prompt 背后是一个分布，你每次看到的是分布里的一个样本</figcaption>
</figure>

### "采样"两个字是关键

如果你把 `temperature=0`（贪婪采样），模型会**永远选概率最高的那个**，这时输出**几乎是确定的**。但**几乎是确定 ≠ 完全确定**，原因有三：

1. **浮点运算的精度损失**：GPU 上 `matmul(A, B)` 的结果，会因为 batch size、并行度、硬件版本不同而有 1e-6 级别差异。这点差异在 softmax 后偶尔会让排名前两位的概率反转。
2. **模型版本漂移**：服务方（OpenAI、阿里云）会静默更新模型权重。你的 prompt 没变，但 `qwen-plus` 背后的实际权重可能上个月和这个月不同。
3. **分布式推理的批次效应**：同一时刻和你一起请求的其他用户的 prompt，会和你共享同一个 batch，理论上影响浮点累加顺序。

这三条你不用记，但你要记住一句话：**"温度 0"是工程上的近似确定，不是数学上的完全确定。**

### 为什么这件事必须搞清楚

因为它直接决定了你怎么 debug：

| 你以为的问题 | 实际可能是的问题 |
|------|------|
| "我的 prompt 写错了" | 模型本来就有 5% 概率输出这种格式，需要靠 few-shot 或 schema 约束 |
| "我的代码 bug 导致输出不一致" | 这是模型本质，要靠 retry 或 ensemble，不是改代码 |
| "这个模型不行" | 模型没问题，是你没给 example，模型在猜你想要什么 |

**真实工作场景**：用户反馈"Agent 偶尔答非所问"。**新手工程师**会说"我加个 retry"或"我改改 prompt"；**有经验的工程师**会先问"出现频率多高？是温度高导致还是 prompt 缺少约束？是不是上下文超长导致中段被忽略？"——后者的判断力，就是这一章要建立的能力。

---

## Why 2：为什么 Prompt 不是咒语

第二个核心 Why。理解了它能让你避开"提示词玄学"的大坑。

### 一个观察

OpenAI 官方文档里，Prompt Engineering 章节叫 "Prompt **Engineering**"，不叫 "Prompt **Magic**"。Anthropic 的官方指南通篇在讲"clear instructions、examples、structure"。**严肃的从业者从不把 prompt 当咒语**。

但国内很多自媒体文章会写"震惊！这个 prompt 让 GPT 暴涨 10 倍智商"——这类内容全部是流量垃圾。

### 那为什么 Prompt 有效？

很多人误以为 "prompt 在'教'模型新东西"。**不是的**。准确表述是：

> **Prompt 是在"激活"模型在训练数据里已经学到的能力，让它在这次推理时把这些能力用对地方。**

这就是所谓的 **In-Context Learning（上下文学习）**。模型在 13 万亿 token 的预训练里，已经"见过"了几乎所有可能的输入-输出模式。你的 prompt 不是在创造能力，是在**从已有能力里挑出适合当前任务的那一支**。

这个区别看似细微，但它能解释你日常遇到的所有困惑。比如"为什么给一个示例，模型就突然会了"——不是它学会了，是那个示例把"该用哪一支能力"这件事说清楚了。

### 三个推论（直接影响你怎么写 prompt）

**推论 1：好 prompt 像好 API 文档**
- 清晰的输入输出定义
- 有边界（"只输出 JSON，不要解释"）
- 有示例（few-shot）
- 有错误情况的处理

差的 prompt 像口头嘱托，好的 prompt 像接口契约。

**推论 2：few-shot 比指令更稳定**
"请用专业语气" 是抽象指令，模型各凭想象；给 3 个专业语气的例子是具体示例，模型直接对齐。**为什么**？因为模型的注意力机制对"具体的输入-输出对"激活能力，远强于对"抽象形容词"的激活。

**推论 3：换模型 = prompt 可能要重写**
因为不同模型的"已学能力分布"不同。同样的 prompt 在 GPT-4 上 work，在 Qwen-Plus 上不一定 work。**这不是 Qwen 不行**，是 prompt 没对齐 Qwen 的能力激活路径。

### 一个反直觉的事实

很多新人花大量时间"优化 prompt 一行字"。但严肃的工程实践里，**prompt 的 80% 价值在前 20% 的设计里就决定了**——清晰的指令 + 1-3 个好的示例。剩下的 20% 优化（语序、用词、Chain-of-Thought 触发词）需要靠 eval 集验证，不能靠感觉。

> **本节核心**：把 prompt 当接口设计，不要当咒语吟诵。前者可工程化，后者不可复制。

---

## Why 3：为什么"输入决定输出"的本能会害你

第三个核心 Why，专门给前端工程师的。

### 前端的确定性本能

写了 3 年以上前端，你已经形成这些本能：

```typescript
// 本能 1：函数是纯的
expect(add(1, 2)).toBe(3)  // 永远成立
expect(add(1, 2)).toBe(3)  // 调一万次还是 3

// 本能 2：测试是断言
test("renders correctly", () => {
  render(<Button label="OK" />)
  expect(screen.getByText("OK")).toBeInTheDocument()
})

// 本能 3：bug 是可复现的
// "我这边复现不了" = 不是 bug
```

这些本能在传统前端里是对的。**在 Agent 开发里，每一个都会让你吃亏**。

### 7 个前端本能 vs Agent 思维对照

下面这张图把那张著名的对照表"图形化"了——左列是写在你肌肉记忆里的前端本能，右列是 Agent 世界里的现实，中间是你要主动切换的思维。

<figure>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" role="img" aria-label="7 个前端本能与 Agent 思维对照">
    <defs>
      <linearGradient id="cmpg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3b82f6"/>
        <stop offset="1" stop-color="#10b981"/>
      </linearGradient>
    </defs>
    <rect width="800" height="480" rx="16" fill="#0f172a"/>
    <text x="400" y="34" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="18" font-weight="700" fill="#e2e8f0">7 个前端本能 → Agent 思维</text>
    <rect x="40" y="56" width="340" height="28" rx="6" fill="#1e293b" stroke="#3b82f6"/>
    <text x="210" y="75" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" font-weight="700" fill="#60a5fa">前端本能（会害你）</text>
    <rect x="420" y="56" width="340" height="28" rx="6" fill="#1e293b" stroke="#10b981"/>
    <text x="590" y="75" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" font-weight="700" fill="#34d399">Agent 思维（要切换到）</text>
    <line x1="390" y1="56" x2="390" y2="450" stroke="url(#cmpg)" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>
    <text x="60" y="108" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#f59e0b">1</text>
    <text x="82" y="108" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">同样的输入 → 同样的输出</text>
    <text x="442" y="108" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">输入 → 一个分布，输出有方差</text>
    <line x1="40" y1="118" x2="760" y2="118" stroke="#1e293b" stroke-width="1"/>
    <text x="60" y="146" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#f59e0b">2</text>
    <text x="82" y="146" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">测试用断言（exact match）</text>
    <text x="442" y="146" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">评分矩阵 / LLM-as-judge</text>
    <line x1="40" y1="156" x2="760" y2="156" stroke="#1e293b" stroke-width="1"/>
    <text x="60" y="184" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#f59e0b">3</text>
    <text x="82" y="184" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">bug 必须能复现才能修</text>
    <text x="442" y="184" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">用 eval 集统计出错率</text>
    <line x1="40" y1="194" x2="760" y2="194" stroke="#1e293b" stroke-width="1"/>
    <text x="60" y="222" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#f59e0b">4</text>
    <text x="82" y="222" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">改一行代码看一行效果</text>
    <text x="442" y="222" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">改一行 prompt 跑 eval 集</text>
    <line x1="40" y1="232" x2="760" y2="232" stroke="#1e293b" stroke-width="1"/>
    <text x="60" y="260" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#f59e0b">5</text>
    <text x="82" y="260" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">错误是异常（throw / catch）</text>
    <text x="442" y="260" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">LLM 自信地错，要主动校验 schema</text>
    <line x1="40" y1="270" x2="760" y2="270" stroke="#1e293b" stroke-width="1"/>
    <text x="60" y="298" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#f59e0b">6</text>
    <text x="82" y="298" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">性能 = 耗时 + 内存</text>
    <text x="442" y="298" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">性能 = token + 延迟 + 成本</text>
    <line x1="40" y1="308" x2="760" y2="308" stroke="#1e293b" stroke-width="1"/>
    <text x="60" y="336" font-family="ui-sans-serif,system-ui" font-size="11" font-weight="600" fill="#f59e0b">7</text>
    <text x="82" y="336" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">code review 看逻辑</text>
    <text x="442" y="336" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">Agent review 看 prompt + eval 集</text>
    <rect x="40" y="370" width="720" height="70" rx="10" fill="#1e293b" stroke="#475569" stroke-dasharray="4 3"/>
    <text x="60" y="394" font-family="ui-sans-serif,system-ui" font-size="12" font-weight="700" fill="#f59e0b">底层规律</text>
    <text x="60" y="414" font-family="ui-sans-serif,system-ui" font-size="11" fill="#cbd5e1">前端的"确定性"来自纯函数；Agent 的"方差"来自概率采样。</text>
    <text x="60" y="430" font-family="ui-sans-serif,system-ui" font-size="11" fill="#cbd5e1">两套工具链不同，是因为它们处理的是两种本质不同的系统。</text>
  </svg>
  <figcaption>不是"前端本能错了"，而是"前端本能换了一个世界"</figcaption>
</figure>

文字版的完整对照（便于回查）：

| # | 前端本能 | Agent 现实 | 改写的思维 |
|---|---------|-----------|-----------|
| 1 | **同样的输入永远同样的输出** | 同样的输入，输出有方差 | 写代码时预设"输出会漂移"，做容错 |
| 2 | **测试用断言（exact match）** | 输出每次不同，断言必失败 | 用评分矩阵 / LLM-as-judge / 语义相似度 |
| 3 | **bug 必须能复现才能修** | 同一段 prompt 偶尔出错，无法稳定复现 | 用 eval 集统计出错率，而不是单次复现 |
| 4 | **改一行代码看一行效果** | 改一行 prompt，可能 80% 输出变化 | 每次改完跑 eval 集，不要凭感觉 |
| 5 | **错误是异常（throw / catch）** | LLM 不会 throw，它会"自信地输出错误答案" | 主动校验输出 schema，不信任模型自报 |
| 6 | **性能优化看耗时和内存** | LLM 调用看 token、延迟、成本 | 一次用户操作可能触发 10 次 LLM 调用，成本爆炸 |
| 7 | **代码 review 看逻辑** | Agent review 看 prompt + eval 集 | 没 eval 集的 Agent 代码不可 review |

### 一个真实案例（解释这套思维怎么救场）

假设你做了一个"博客文章自动生成摘要"的 Agent。用户反馈："偶尔摘要里会出现原文没有的内容（幻觉）"。

**前端本能反应**：
> "我去查日志看看是哪次请求出错了。"

**Agent 工程师反应**：
> "幻觉是模型本质问题。我先问：(1) 出错率多少？(2) 是哪些类型的文章出错？(3) 我的 prompt 有没有约束'只基于原文'？(4) 我能不能在 prompt 里加'如果原文没说就回答「无」'？(5) 我能不能在输出后用一个验证 LLM 检查摘要里的事实是否都在原文里？"

后者就是 **有经验的 Agent 工程师的本能**。这一章的目标是把这个本能装进你脑子里。

---

## debug 决策树：这个 bug 归哪一层

前面讲了三个 Why 和七条本能对照，但真到了线上，你最需要的是一个**能立刻用的判断框架**：拿到一个 bug，先问什么、再问什么。下面这张图就是为这个场景画的——它是这一章所有理论的"出口"。

<figure>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-label="Agent bug 归因决策树">
    <defs>
      <marker id="tarr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#64748b"/>
      </marker>
    </defs>
    <rect width="800" height="440" rx="16" fill="#0f172a"/>
    <text x="400" y="34" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="18" font-weight="700" fill="#e2e8f0">Agent bug 归因决策树</text>
    <text x="400" y="54" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#64748b">第一个问题永远是："这个 bug 复现稳定吗？"</text>
    <rect x="300" y="72" width="200" height="46" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <text x="400" y="92" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" font-weight="700" fill="#f59e0b">Bug 出现了</text>
    <text x="400" y="108" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#cbd5e1">复现稳定吗？</text>
    <line x1="340" y1="118" x2="160" y2="158" stroke="#475569" stroke-width="1.5" marker-end="url(#tarr)"/>
    <line x1="460" y1="118" x2="640" y2="158" stroke="#475569" stroke-width="1.5" marker-end="url(#tarr)"/>
    <text x="225" y="138" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#94a3b8">稳定复现</text>
    <text x="575" y="138" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#94a3b8">偶发/概率性</text>
    <rect x="40" y="162" width="240" height="46" rx="10" fill="#1e293b" stroke="#3b82f6"/>
    <text x="160" y="182" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" font-weight="600" fill="#60a5fa">工程问题</text>
    <text x="160" y="198" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#cbd5e1">超时 / 报错 / 格式错 / 路由错</text>
    <rect x="520" y="162" width="240" height="46" rx="10" fill="#1e293b" stroke="#8b5cf6"/>
    <text x="640" y="182" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" font-weight="600" fill="#a78bfa">模型本质问题</text>
    <text x="640" y="198" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#cbd5e1">幻觉 / 答非所问 / 偶尔格式偏</text>
    <line x1="640" y1="208" x2="640" y2="248" stroke="#475569" stroke-width="1.5" marker-end="url(#tarr)"/>
    <text x="700" y="232" font-family="ui-sans-serif,system-ui" font-size="10" fill="#94a3b8">再问</text>
    <rect x="520" y="252" width="240" height="46" rx="10" fill="#1e293b" stroke="#475569" stroke-dasharray="3 2"/>
    <text x="640" y="272" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#cbd5e1">有相关数据/知识吗？</text>
    <text x="640" y="288" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#64748b">模型"该知道但没记住"</text>
    <line x1="740" y1="298" x2="760" y2="298" stroke="transparent"/>
    <line x1="580" y1="298" x2="420" y2="338" stroke="#475569" stroke-width="1.5" marker-end="url(#tarr)"/>
    <line x1="700" y1="298" x2="720" y2="338" stroke="#475569" stroke-width="1.5" marker-end="url(#tarr)"/>
    <text x="480" y="318" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#94a3b8">是</text>
    <text x="715" y="318" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#94a3b8">否</text>
    <rect x="280" y="342" width="240" height="46" rx="10" fill="#1e293b" stroke="#10b981"/>
    <text x="400" y="362" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" font-weight="600" fill="#34d399">数据问题</text>
    <text x="400" y="378" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#cbd5e1">靠 RAG / 知识库 / 切块</text>
    <rect x="600" y="342" width="180" height="46" rx="10" fill="#1e293b" stroke="#10b981"/>
    <text x="690" y="362" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" font-weight="600" fill="#34d399">Prompt 问题</text>
    <text x="690" y="378" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#cbd5e1">靠 few-shot / schema</text>
    <rect x="40" y="342" width="240" height="46" rx="10" fill="#1e293b" stroke="#10b981"/>
    <text x="160" y="362" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" font-weight="600" fill="#34d399">→ 工程解法</text>
    <text x="160" y="378" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" fill="#cbd5e1">重试 / 降级 / 超时 / 代码</text>
    <text x="400" y="420" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="12" fill="#94a3b8">判断错层 = 用错工具，白熬一夜；判断对层 = 十分钟定位</text>
  </svg>
  <figcaption>第一性问题永远是"它稳定复现吗"——这一刀切下去，后面就清晰了</figcaption>
</figure>

这张树不是用来背的，是用来**养成"先问稳定性"的肌肉记忆**。一旦你习惯了第一句话问"出错率多少、能不能稳定复现"，你就已经超过一半的 Agent 新手了。

---

## 思想实验：把"概率性"装进直觉

读完上面几段，你可能"理性上"理解了，但"直觉上"还没。下面这个实验你可以**在脑中模拟**（不用真的跑），它能把概率性变成你的肌肉记忆。

### 实验：同一段 prompt 跑 10 次

假设你的 prompt 是：
```
请用一句话总结：《前端转型 Agent 指南》Phase 0 讲了什么。
```

把这段 prompt 用 `temperature=0.7`（默认）跑 10 次。**预期结果**：

```
Run 1: 介绍了 Agent 开发的 11 个核心术语。
Run 2: 讲了 LLM、Token、Prompt 等基础概念，配上前端类比。
Run 3: 这是一份术语地基，覆盖了 LLM/Token/Context Window 等 11 个词。
Run 4: 解释了 Agent 开发必学的 11 个名词，用前端视角类比。
Run 5: ...
```

观察这些输出：
- **意思都对**（语义层面收敛）
- **字面都不同**（字符层面发散）
- **偶尔有一两个会多带一句无关内容**（漂移）

**这个实验要建立的直觉**：你看到的"模型输出"，是模型**对你 prompt 的一个采样**，不是"答案"。同一个 prompt 后面是一个**分布**，你看到的是分布里的一个样本。

### 这个直觉的实战价值

建立这个直觉后，你会自动做这些事：

1. **写代码时**：默认假设"输出可能跑偏"，加 schema 校验、加重试
2. **看用户反馈时**：知道"用户说偶尔出错"是常态，问"出错率多少"
3. **优化 prompt 时**：跑 eval 集而不是凭感觉
4. **设计产品时**：UI 上给用户"重新生成"按钮（因为你预期到输出会漂移）

---

## 一张图总结这一章

这一章的内容可以浓缩成一张图：左边是你看到的"表面现象"，中间是"深层原因"，右边是"应对方法"。三列读下来，就是这一章的全部逻辑。

<figure>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340" role="img" aria-label="Phase 1 三层结构：现象 → 原因 → 应对">
    <defs>
      <linearGradient id="sumg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#f59e0b"/>
        <stop offset="0.5" stop-color="#3b82f6"/>
        <stop offset="1" stop-color="#10b981"/>
      </linearGradient>
      <marker id="sarr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#64748b"/>
      </marker>
    </defs>
    <rect width="800" height="340" rx="16" fill="#0f172a"/>
    <text x="400" y="38" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="18" font-weight="700" fill="#e2e8f0">Phase 1 · 一张图总结</text>
    <rect x="40" y="64" width="220" height="30" rx="6" fill="#1e293b" stroke="#f59e0b"/>
    <text x="150" y="84" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" font-weight="700" fill="#f59e0b">表面现象（你看到的）</text>
    <rect x="290" y="64" width="220" height="30" rx="6" fill="#1e293b" stroke="#3b82f6"/>
    <text x="400" y="84" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" font-weight="700" fill="#60a5fa">深层原因（真正在发生）</text>
    <rect x="540" y="64" width="220" height="30" rx="6" fill="#1e293b" stroke="#10b981"/>
    <text x="650" y="84" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" font-weight="700" fill="#34d399">应对方法（工程师的动作）</text>
    <text x="60" y="120" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· 输出不稳定</text>
    <text x="60" y="142" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· 偶尔答非所问</text>
    <text x="60" y="164" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· prompt 改一字效果巨变</text>
    <text x="60" y="186" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· 换模型效果崩了</text>
    <text x="310" y="120" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· 概率函数 + 采样</text>
    <text x="310" y="142" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· prompt 在激活能力</text>
    <text x="310" y="164" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· 浮点精度 / 版本 / 批次</text>
    <text x="310" y="186" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· 不同模型能力分布不同</text>
    <text x="560" y="120" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· eval 集 + 评分矩阵</text>
    <text x="560" y="142" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· 把 prompt 当接口设计</text>
    <text x="560" y="164" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· schema 校验 + retry</text>
    <text x="560" y="186" font-family="ui-sans-serif,system-ui" font-size="12" fill="#cbd5e1">· 换模型要重对齐 prompt</text>
    <line x1="255" y1="200" x2="290" y2="200" stroke="#475569" stroke-width="1.5" marker-end="url(#sarr)"/>
    <line x1="505" y1="200" x2="540" y2="200" stroke="#475569" stroke-width="1.5" marker-end="url(#sarr)"/>
    <rect x="40" y="230" width="720" height="80" rx="10" fill="#1e293b" stroke="url(#sumg)" stroke-width="1.5"/>
    <text x="400" y="256" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="13" font-weight="700" fill="#e2e8f0">一句话：把 LLM 当概率函数，把 prompt 当接口，把 bug 归因当成可训练的判断力</text>
    <text x="400" y="278" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#94a3b8">你不该问"为什么它不稳定"，而该问"我对不稳定的预案够不够"</text>
    <text x="400" y="296" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="11" fill="#64748b">（这就是 Phase 1 想留给你的唯一一个习惯）</text>
  </svg>
  <figcaption>三列对齐：每一行的现象，都有对应的因，和对应的工程动作</figcaption>
</figure>

---

## 常见认知坑

> **坑 1：把"温度调到 0"当成"确定性输出"**
> 温度 0 是贪婪采样，**几乎**确定但不是绝对确定。而且温度 0 会牺牲输出多样性，对创意类任务反而更差。生产环境要"确定性"靠 schema 校验和 retry，不靠 temperature=0。

> **坑 2：相信"Prompt 工程师"这种岗位定位**
> 没有独立的"prompt 工程师"——这是 2023 年的过渡期产物。2026 年的工程实践里，prompt 只是 Agent 工程师技能树的一项。把 prompt 工程当成"特殊技能"会限制你的成长。

> **坑 3：因为模型幻觉就否定整个模型**
> 所有 LLM 都会幻觉，区别只在频率和领域。Qwen-Plus 可能在中文古诗词上幻觉多，GPT-4 可能在中文政策上幻觉多。**用 eval 集测真实表现**，不要凭印象判断。

> **坑 4：用"我的 prompt 在 GPT 上 work"来 push 团队换模型**
> 这违反了 Why 2 的推论 3。换个模型，prompt 大概率需要重新对齐。

---

## 本章检查清单

读完这一章，自测一下。**每一条都要能说出"为什么"，不是记住结论**：

- [ ] 我能用一段话讲清 LLM 为什么是非确定性的（至少提到 softmax + 采样 + 浮点精度）
- [ ] 我能解释为什么"温度 0"不等于"确定性输出"
- [ ] 我能说清 prompt 和"训练"的关系（不是教模型，是激活能力）
- [ ] 我能列出 5 个以上"前端本能"在 Agent 里失效的例子
- [ ] 我知道为什么 few-shot 比抽象指令更稳定（注意力机制层面）
- [ ] 我能解释为什么"prompt 工程师"不是一个独立的工程角色
- [ ] 我知道 eval 集是什么，为什么没有它就不能优化 prompt

**答案不在本章末尾**——你的"为什么"应该能直接对应到上面的 Why 1/2/3。如果对应不上，回去重读对应章节。

---

## 下一步

思想地基打完了。接下来进入 **Phase 2 · Python 速通（前端工程师版）**——因为后续实战章节的代码示例以 Python 为主（Python 是 LLM 生态的主战语言），同时保留 TypeScript 版本作为对照。

如果你已经熟悉 Python，可以**跳过 Phase 2**，直接到 Phase 3 接入阿里云 Qwen。
