# 国内岗位地图

> 基于数百份公开 JD 的横向对比（大厂 / 科研院所 / 创业公司）。量级判断可靠，具体以你求职时行情为准。

## 三条线：先选对赛道

| 线 | JD 关键词 | 门槛 | 前端可行性 |
|---|---|---|---|
| 算法研究 | PyTorch / 训练 / 微调 / 论文 | 硕士+ | ❌ 别浪费时间 |
| 平台基建 | vLLM / GPU 调度 / K8s | 本科+偏系统 | ⚠️ 有基建经验再说 |
| **应用开发** | **LangChain / Dify / RAG / FC** | **本科+，重落地** | ✅ **主攻这里** |

> 国内大部分空缺在应用线——模型是少数大厂的战场，"把模型包进业务"的需求遍地都是。

## 应用岗的一天（时间去向）


<figure>
<svg viewBox="0 0 800 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agent 应用岗工作时间分布：RAG 30%、Prompt 20%、工程开发 20%、工具对接 15%、安全降本 10%、编排创新 5%">
<rect width="800" height="230" fill="#FBF7EE" rx="14"/>
<rect x="1" y="1" width="798" height="228" fill="none" stroke="#D4C9A9" stroke-width="1.5" rx="14"/>
<text x="400" y="34" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#2C2416">工作时间分布（经验估计）</text>
<!-- Stacked bar -->
<rect x="24" y="58" width="226" height="48" rx="8" fill="#D4744C"/>
<text x="137" y="80" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#FFF8F0">30%</text>
<text x="137" y="96" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#FFE8DC">RAG 调优</text>
<rect x="258" y="58" width="150" height="48" fill="#C9973F"/>
<text x="333" y="80" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#FFF8F0">20%</text>
<text x="333" y="96" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#F5E8CE">Prompt</text>
<rect x="416" y="58" width="150" height="48" fill="#7A9B6D"/>
<text x="491" y="80" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#FFF8F0">20%</text>
<text x="491" y="96" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#E2ECD9">工程开发</text>
<rect x="574" y="58" width="113" height="48" fill="#5B7FA6"/>
<text x="630" y="80" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#FFF8F0">15%</text>
<text x="630" y="96" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#DCE6EF">工具对接</text>
<rect x="695" y="58" width="57" height="48" fill="#96613A"/>
<text x="723" y="80" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFF8F0">10%</text>
<rect x="760" y="58" width="16" height="48" rx="4" fill="#B8A98A"/>
<text x="768" y="76" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#FFF">5%</text>
<!-- Labels below bar -->
<text x="137" y="130" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">RAG 数据与检索调优</text>
<text x="333" y="130" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">Prompt 设计与评测</text>
<text x="491" y="130" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">常规工程开发</text>
<text x="630" y="130" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">工具与业务对接</text>
<text x="710" y="130" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">安全降本 · 编排</text>
<!-- Insight box -->
<rect x="24" y="152" width="752" height="56" rx="10" fill="#FDF5E6" stroke="#DBCB9A"/>
<text x="400" y="176" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#6B4226" font-weight="600">一句话：用工程手段，把不确定的智能组件包装成确定可交付的产品。</text>
<text x="400" y="196" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#8A7A5E">RAG 是最重的一块——也是面试官最爱问的一块</text>
</svg>
</figure>

> 一句话：**用工程手段，把一个不确定的智能组件，包装成确定可交付的产品。**
> 前半句是你的存量能力，后半句是转岗要补的。

## JD 真相表

| JD 写的 | 真相还是许愿 |
|---|---|
| Python（必备） | ✅ 真相，但深度要求低于后端岗 |
| "精通 LangChain/Dify" | ⚠️ 许愿——面试考的是机制理解，不是 API 背诵 |
| RAG / FC / 多智能体 / Prompt | ✅ 真相，**RAG 经验最实** |
| MCP | 🆕 2026 起快速上升，会写 Server 是差异化加分 |
| 微调经验 | ⚠️ 基本总在"加分"栏，应用线非硬门槛 |
| React/Vue 全栈 | ✅ 真香的加分项——团队就缺能一个人做完交互层的 |

**30 秒识别蹭热点岗**：JD 有 PyTorch/训练 → 算法线，划走；只有"LLM"没有 RAG/编排/落地 → 普通开发岗换了皮。

## 面试四大件

| 考什么 | 标准追问 | 你的准备口径 |
|---|---|---|
| **RAG 全链路** | "切块怎么切？检索不准怎么排查？怎么评估？" | 切块策略 → 混合检索/rerank → 评测集与指标 |
| **工具调用机制** | "工具执行失败模型怎么办？" | 完整循环讲清 + 错误回填与重试 |
| **幻觉治理** | "怎么防胡说？" | 分层：检索约束→引用溯源→输出校验→人工兜底 |
| **项目深挖** | "为什么这么选型？" | 讲取舍与踩坑，不是讲 demo |

**答不出"怎么评估效果"的人，会被归类为只会跑 demo。**

## 前端的牌

| 你的优势 | 直接变现处 |
|---|---|
| 全栈交付 | Agent 的交互层（流式 UI / 会话状态 / 调试面板）就是前端 |
| 接口设计直觉 | 工具调用 = 给模型设计 API；类型思维 → 结构化输出 |
| 工程审美 | 加载态 / 降级 / 错误处理，纯 Python 背景的盲区 |

| 短板 | 补法 |
|---|---|
| Python 熟练度 | 语法速查 + 实战中补到"够用" |
| 评测思维 | 前端测试是确定性的，Agent 评测是统计式的——专门练 |
| 模型体感 | 没捷径，只能实操喂出来 |

→ 行动方案：[前端转岗 90 天路线](/guides/agent-guide/roadmap-90d)
