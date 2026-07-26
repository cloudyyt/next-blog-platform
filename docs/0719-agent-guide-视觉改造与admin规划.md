# 0719 · Agent 指南视觉改造与 Admin 后台规划

> 本文档记录 2026-07-19 完成的 `/agent-guide` 与博客首页视觉改造，以及下一步 Admin 后台的规划。
> 实施前请**先读"二、核心设计原则"**，那是后续所有决策的根。

---

## 一、背景与目标

让 Admin 后台支持"Agent 指南章节"这一独立内容类型，并在前端以"极简文档站"的形态呈现，与博客文章并存在同一站点。

**改造分四阶段：**
- Stage A（✅ 已完成）：客户端视觉重做
- Stage B（⏳ 待开始）：Admin 后台改造
- Stage C（待开始）：数据库迁移 + 数据源切换
- Stage D（待开始）：部署上线

---

## 二、核心设计原则（必读）

> 这几条是用户在协作过程中反复强调、不可妥协的原则。任何后续设计决策与这些原则冲突时，以原则为准。

### 2.1 前端视觉效果 > 后端架构优雅

**用户的关注顺序是：**
1. 前端视觉效果好不好
2. 功能好不好用
3. （才是）后端架构是否优雅

**含义：** 不要为了"代码复用"或"架构统一"牺牲前端体验。如果复用 Post 的 CRUD 会让 Agent 指南的 admin 体验变差，就**新开一套**。

### 2.2 Admin 独立菜单项 OK，不必复用 Post CRUD

- **允许**：在 admin 侧边栏新开"Agent 指南"菜单项，承载章节上传/管理
- **允许**：新开数据库表（如 `GuideChapter`、`GuideSeriesConfig`）
- **允许**：新开 API（如 `/api/admin/guide/*`）
- **不必强行复用**：`/api/admin/posts/*` 接口或 Post 表

> 决策标准是"哪种方式前端最好看、admin 最好用"，不是"哪种方式代码最少"。

### 2.3 可配置项必须全，且和前端展示一一对应

**用户原话：**
> 设计 admin 的时候，可配置项一定要全，能和前端看到的都对得上。

**含义：** 前端展示的每一个文字、每一个图标、每一个颜色，都应该有对应的 admin 配置入口。**走读确认**（见第五节）列出所有需要做成配置的字段。

**反例：** 像现在 `manifest.ts` 里硬编码"前端工程师转型 Agent 开发指南"标题，admin 没法改 — 这是不对的。

### 2.4 章节正文（markdown）外的所有内容都该是配置

唯一不需要做成配置的就是 markdown 正文本身。**其他都应该有 admin 入口**，包括但不限于：
- 系列级文案、封面、CTA
- 分组（5 大阶段）的定义、顺序、图标
- 每章的标题、slug、难度、阅读时长、comingSoon 状态、SEO

---

## 三、Stage A 已完成（2026-07-19）

### 3.1 改造范围

| 区域 | 文件 | 改动 |
|------|------|------|
| 博客首页 | `components/blog/guide-series-card.tsx` | **新建**：置顶 PostCard 风格的 Agent 指南入口（视觉与 PostCard 100% 同源） |
| 博客首页 | `components/blog/load-more-button.tsx` | 加 `showGuideEntry` prop，置顶位渲染 GuideSeriesCard |
| 博客首页 | `components/blog/blog-page-client.tsx` | 移除 `<DocsEntryBanner />`，改用 prop 传递 |
| 博客首页 | `components/blog/docs-entry-banner.tsx` | **删除**（被 GuideSeriesCard 取代） |
| Agent 指南 | `app/agent-guide/page.tsx` | **重写**：Hero（4 张价值卡片）+ 学习路径可视化 + 章节列表（默认隐藏 WIP） |
| Agent 指南 | `app/agent-guide/[slug]/page.tsx` | **重写**：max-w-4xl 单列 + 面包屑 + 紧凑元信息行 + 修复 `meta.phase` bug |
| Agent 指南 | `app/agent-guide/components/docs-sidebar.tsx` | **重写**：进度条 + accordion（持久化）+ 已读 ✓ + 三状态色拉开 + 默认隐藏 WIP（可 toggle） |
| Agent 指南 | `app/agent-guide/components/docs-overview-card.tsx` | **删除**（卡片网格不再用） |
| Agent 指南 | `app/agent-guide/components/docs-toc.tsx` | **删除**（右侧 TOC 不再用） |

### 3.2 关键设计决策

#### 3.2.1 极简文档站方向（Linear / Stripe 风格）
- 总览页 = Hero + 学习路径 + 章节列表，**去掉** Hero 装饰、三栏读法、卡片网格
- 章节页 = 单列 max-w-4xl，**去掉** 右侧 TOC（在中等宽度下会挤掉正文）
- sidebar = 进度条 + 分组 accordion + 已读 ✓（Stripe Docs 核心交互）

#### 3.2.2 三状态视觉拉开
- **当前章节**：primary 绿 + 加粗 + 左侧竖条 + 背景高亮
- **已读章节**：foreground/80 深色文字 + **灰色** ✓（不用绿色，避免与当前混淆）
- **未读章节**：muted-foreground 浅色文字 + 空心圆
- **comingSoon（WIP）**：极淡灰 + 锁图标（默认隐藏，可 toggle 显示）

#### 3.2.3 WIP 章节策略
- 总览页：**默认完全隐藏** WIP，底部一句话承诺"后续 N 章正在写作中"
- sidebar：默认隐藏 WIP，底部一个"显示 N 个未完成章节"链接
- 不再显示"X / Y 已发布"的暴露式数字（避免自曝未完成）

#### 3.2.4 首页入口（GuideSeriesCard）
- **位置**：博客首页列表的最顶（HeroCard 之前），真正的"置顶"
- **视觉**：与 PostCard 100% 同源（rounded-xl + border + p-4 sm:p-5 + 相同字号）
- **区别**：渐变 cover 替代图片、进度条替代 viewCount、"已发布 N 章"替代日期
- **顺序写死在 JSX**：本地和线上行为完全一致，部署后不会变

#### 3.2.5 数据自动同步
- `GuideSeriesCard` 自动从 `manifest.ts` 的 `chapters` 数组计算：
  - `publishedCount` = 非 comingSoon 数量
  - `totalCount` = 总章节数
  - `latestPhaseRange` = 从已发布 slug 解析 phase 编号取范围
- 未来 DB 迁移时只需改这一处（接口已留好 props 入口）

---

## 四、Stage B：Admin 后台规划

### 4.1 总体结构

**新开 admin 菜单项："Agent 指南"**，路径 `/admin/guide`，独立于"文章管理"。

```
admin 侧边栏：
  仪表盘
  文章管理        ← 现有，只管博客文章（type=blog）
  Agent 指南      ← 新增，只管指南章节（type=guide）
  评论管理
  分类管理
  标签管理
  用户管理
```

### 4.2 路由规划

| 路径 | 用途 |
|------|------|
| `/admin/guide` | 章节列表（按 group 分组，显示已发布/WIP 状态） |
| `/admin/guide/new` | 新建章节 |
| `/admin/guide/[id]/edit` | 编辑章节 |
| `/admin/guide/settings` | **系列级配置**（封面、文案、阶段定义等） |

### 4.3 编辑器决策：专用编辑器，不复用 PostEditor

虽然之前讨论过"复用 PostEditor + mode 参数"，但根据原则 2.2（不必强行复用），改为：
- **新写**一个 `GuideChapterEditor`
- 复用底层组件（MarkdownEditor、Slug 输入、authFetch）但不复用 PostEditor 本身
- 视觉与字段集专为"指南章节"优化（没有封面/分类/标签，但有 group/difficulty/order/comingSoon 等）

---

## 五、可配置项清单（走读确认）

> **这一节是核心。** 每一个字段都要确认：(a) 是否需要做成配置 (b) 当前在哪里 (c) admin 入口在哪。

### 5.1 系列级配置（整个 Agent 指南一份，存 `GuideSeriesConfig`）

> 大部分目前散落在 `manifest.ts`、`app/agent-guide/page.tsx`、`guide-series-card.tsx` 里硬编码。

| 字段 | 当前位置 | admin 入口 | 类型 | 备注 |
|------|----------|-----------|------|------|
| **系列标题** | `guide-series-card.tsx` L98 / `agent-guide/page.tsx` L93 | 系列设置 | string | "前端工程师转型 Agent 开发指南" |
| **系列副标题/描述** | `guide-series-card.tsx` L103 / `agent-guide/page.tsx` L98 | 系列设置 | text | 用于 PostCard excerpt + Hero 副标题 |
| **系列封面图 URL** | ❌ 当前用 CSS 渐变替代 | 系列设置 | string (URL) | **见 5.4 节封面方案** |
| **系列图标** | hardcode BookOpen | 系列设置（可选） | enum | 暂时 hardcode 也行 |
| **"连载中"徽章文案** | hardcode "连载中" | 系列设置 | string | 默认"连载中" |
| **CTA 文案** | hardcode "从 X 开始" | 系列设置 | string | 默认指向第一章 |
| **价值卡片 1（目标读者）** | `agent-guide/page.tsx` L107 | 系列设置 | string | 默认"前端 / TS 工程师" |
| **价值卡片 2（技术栈）** | L113 | 系列设置 | string | 默认"Python · Qwen · 阿里云" |
| **价值卡片 3（已发布）** | L117 | **自动计算** | — | 不要做成配置 |
| **价值卡片 4（阅读时长）** | L122 | 系列设置 | string | 默认"每章 20-30 分钟" |
| **学习路径 5 阶段定义** | `manifest.ts` GROUPS | 系列设置 | JSON / 子表 | 见 5.2 |
| **后续章节承诺文案** | `agent-guide/page.tsx` L260 | 系列设置（可选） | text | 默认根据 WIP 数自动生成 |
| **SEO og:title / description / image** | ❌ 缺失 | 系列设置 | string | 当前 layout metadata 是硬编码 |

### 5.2 5 大阶段（GROUPS）配置

当前硬编码在 `manifest.ts` 的 `GROUPS` 和 `GROUP_ORDER`。**应该做成 admin 子配置**：

```typescript
// 每个阶段一个对象
{
  key: "intro" | "foundation" | "core" | "system" | "appendix",
  label: "起步",      // 显示名
  hint: "搭建认知地基", // 一句话说明
  icon: "Compass",    // 图标名（lucide）
  order: 1            // 显示顺序
}
```

**admin 入口**：系列设置页 → "学习阶段"区域 → 可编辑 label/hint/icon/顺序。

**约束**：阶段数量保持 5 个左右，不要做成"用户可以加任意多个阶段"——那会破坏路径可视化布局。

### 5.3 单章节配置（每章一份，存 `GuideChapter` 或 `Post` 加 type 字段）

| 字段 | 当前位置 | admin 入口 | 类型 | 备注 |
|------|----------|-----------|------|------|
| **title** | manifest.ts | 章节编辑器 | string | 必填 |
| **slug** | manifest.ts | 章节编辑器 | string | URL 路径，自动生成可改 |
| **content (markdown)** | docs/agent-guide/*.md | 章节编辑器（MarkdownEditor） | text | **唯一不是配置的字段** |
| **group** | manifest.ts | 章节编辑器（Select） | enum | 关联 5.2 的阶段 |
| **difficulty** | manifest.ts | 章节编辑器（Select） | enum | 入门/进阶/实战 |
| **order** | ❌ 当前依赖 phase-N slug 推断 | 章节编辑器（Number） | int | 分组内排序，10/20/30 |
| **description** | manifest.ts | 章节编辑器（Textarea） | text | 用于 sidebar tooltip、总览页、面包屑下副标题 |
| **readingTime** | manifest.ts | 章节编辑器（Number） | int (分钟) | 可选；不填则由正文估算 |
| **comingSoon** | manifest.ts | 章节编辑器（Switch） | bool | 标记 WIP |
| **published** | ❌ 当前所有 md 默认 published | 章节编辑器（Switch） | bool | 是否对读者可见 |
| **作者** | ❌ 当前没有 | 章节编辑器（默认 admin） | relation | 默认当前登录用户 |
| **每章 og:image** | ❌ 缺失 | 章节编辑器（可选） | string (URL) | 默认 fallback 到系列封面 |

### 5.4 系列封面图方案（**已澄清**）

用户原话：
> 当前你博文的 postcard 封面用了个默认图标，现在我能接受，但是 admin agent 博文管理的页面肯定需要一个入口让我上传封面，整个 agent-guide 系列一张封面即可，**大概率能复用我之前主页的**。

后续补充：
> 复用主页封面是指当前 admin 新建文章的时候，有个封面上传，我是说复用这个接口。
> 不一定能复用，你需要评估好。
> 是的，我记错了，是贴图片 url。

**走读后的硬证据：**

| 检查项 | 结果 |
|--------|------|
| `post-editor.tsx:207` Label | `"封面图片 URL"`（字面是 URL 输入，不是文件上传） |
| `post-editor.tsx:208-211` | 普通 `<Input>` 文本框，绑定 string state |
| 全项目搜 `type="file"` | **0 处**（admin 区域没有任何文件选择器） |
| 全项目搜 FormData / multipart / upload API | **0 处**（无上传基础设施） |
| 数据库 `Post.coverImage` | `String?`（URL 字符串字段） |

**结论：** 项目里"封面"全程都是**贴 URL 字符串**模式，没有"上传接口"这种东西存在。用户记忆里的"封面上传"是对 URL 输入框的口语化称呼。

**这意味着方案变得很简单：**

#### 采纳方案 P1：URL 输入（与现有博客封面 100% 同模式）

- admin 系列设置页加一个 `coverImage` URL 输入框
- 视觉与交互**完全复用** `post-editor.tsx` L206-214 的 Cover image block 模式
- 用户自己把图传到图床/阿里云 OSS/任意 CDN，复制 URL 粘贴
- 数据库 `GuideSeriesConfig.coverImage: String?`（与 `Post.coverImage` 同型）
- 前端 `GuideSeriesCard`：
  - 有 URL → `<Image src={coverImage} />`（与 PostCard 一致）
  - 无 URL → fallback 到当前的品牌渐变 cover（与现状一致）

**为什么不需要 P2（文件上传）：**
- 现有博客文章也是这么用的，没有投诉过
- 文件上传需要新建 upload API + 选型存储（本地 or OSS）+ 处理缩放/CDN，工程量大
- 当前阶段目标是"跑通 admin → 发布指南"，不被基础设施拖累
- 如果未来要做 P2，应该是**全站升级**（博客文章也升级为支持上传），而不是只为 Agent 指南做

#### 未来升级路径（不在本次范围）

如果以后真要做文件上传，推荐：
- 接**阿里云 OSS**（你已经在用阿里云 ECS，网络最近）
- 新建 `/api/admin/upload` API，返回 OSS URL
- **全站统一升级**：博客文章封面 + Agent 指南封面都用同一套上传组件
- 替换现有的 URL 输入框为"上传按钮 + URL 预览"组合控件

但这是**独立项目**，不要混在 Agent 指南改造里。

### 5.5 不该做成配置的（明确排除）

为了避免 admin 过度复杂，以下**不**做成配置：
- 已发布章节数（自动算）
- 进度条百分比（自动算）
- 学习路径节点上的"X / Y 已发布"（自动算）
- 阅读时长估算（不填 readingTime 时由正文算）
- 阅读进度（用户 localStorage）
- sidebar accordion 折叠状态（用户 localStorage）

---

## 六、数据模型建议

> 根据原则 2.2（可新开表，不必复用 Post），列出两个可选方案。

### 6.1 方案 D1：复用 Post 表 + type 字段（原方案）

```prisma
model Post {
  // ...现有字段全部保留
  type       String     @default("blog")    // "blog" | "guide"
  guideMeta  Json?                            // 仅 type=guide 时使用
}
```

**优点**：
- 共享 slug 唯一约束、author 关系、view 统计等基础设施
- `/blog/*` 和 `/agent-guide/*` 用同一个表，加 `type` 过滤即可
- 文章/指南可以共享评论、查看统计

**缺点**：
- 一个表混两类内容，schema 略耦合
- `guideMeta` 是 JSON，类型安全较弱

### 6.2 方案 D2：新开 GuideChapter 表（推荐，符合原则 2.2）

```prisma
model GuideChapter {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  description String?
  group       String   // intro/foundation/core/system/appendix
  difficulty  String   // 入门/进阶/实战
  order       Int      // 分组内排序
  readingTime Int?
  comingSoon  Boolean  @default(false)
  published   Boolean  @default(false)
  ogImage     String?
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model GuideSeriesConfig {
  id            String   @id @default("singleton") // 单例
  title         String
  subtitle      String?
  coverImage    String?
  badge         String   @default("连载中")
  cta           String?
  valueCard1    String?
  valueCard2    String?
  valueCard4    String?
  ogTitle       String?
  ogDescription String?
  ogImage       String?
  // 5 阶段定义用 JSON 存（label/hint/icon/order）
  groups        Json
  updatedAt     DateTime @updatedAt
}
```

**优点**：
- 干净，符合"Agent 指南是独立内容类型"的认知
- 类型强，没有 JSON 字段
- 系列配置单独一张表，避免硬编码

**缺点**：
- 跟 Post 不共享评论/统计（但 Agent 指南可能本来就不需要评论）
- 需要新写一套 API

### 6.3 推荐方案

**推荐方案 D2**。理由：
1. 完全符合原则 2.2（不强行复用）
2. `GuideSeriesConfig` 这张表是 D1 方案缺的（D1 没地方放系列级配置）
3. Agent 指南和博客文章是**两种心智模型**，分开表更清晰

---

## 七、API 设计建议（基于方案 D2）

```
GET    /api/admin/guide/chapters          # 列表
POST   /api/admin/guide/chapters          # 新建
GET    /api/admin/guide/chapters/[id]     # 单章
PUT    /api/admin/guide/chapters/[id]     # 更新
DELETE /api/admin/guide/chapters/[id]     # 删除

GET    /api/admin/guide/series-config     # 读取系列配置
PUT    /api/admin/guide/series-config     # 更新系列配置

# 公开（前端用）
GET    /api/guide/chapters                # 已发布章节列表（含分组聚合）
GET    /api/guide/chapters/[slug]         # 单章详情
GET    /api/guide/series-config           # 公开系列配置（仅返回前端需要的字段）
```

**鉴权**：复用现有 `verifyAdmin()` 中间件（见 `lib/auth-middleware.ts`）。

---

## 八、Admin UI 设计

### 8.1 `/admin/guide`（章节列表）

```
┌──────────────────────────────────────────────────────┐
│  Agent 指南章节                              [+ 新建] │
│  [设置系列信息 →]                                    │
├──────────────────────────────────────────────────────┤
│  起步（2 章）                                        │
│  ┌─ ✓ 这份指南怎么读 · intro · [已发布] [编辑] [删] ┐│
│  └─ ✓ Phase 0 · 术语地基 · phase-0 · [已发布] ...   ┘│
│                                                       │
│  基础（3 章）                                        │
│  ┌─ ✓ Phase 1 · 心智模型迁移 · phase-1 · ...        ┐│
│  └─ ⚠ Phase 3 · 接入 Qwen · phase-3 · [WIP] ...    ┘│
└──────────────────────────────────────────────────────┘
```

按 group 分组、显示 published/comingSoon 状态、紧凑列表。

### 8.2 `/admin/guide/[id]/edit`（章节编辑器）

```
┌───────────────────────────┬──────────────────────────┐
│  ← 返回                  │  [保存草稿] [发布]       │
│  Agent 指南 · 编辑章节   │                          │
├───────────────────────────┼──────────────────────────┤
│                           │  章节元信息              │
│  [标题输入]               │  ─────────────           │
│  [/slug 输入]             │  阶段：[Select]          │
│                           │  难度：[Select]          │
│  [MarkdownEditor]         │  排序：[Number]          │
│                           │  阅读时长：[Number?]     │
│                           │  摘要：[Textarea]        │
│                           │  Coming Soon：[Switch]   │
│                           │  og:image URL：[?]       │
└───────────────────────────┴──────────────────────────┘
```

不复用 PostEditor（专写一个），但视觉语言一致。

### 8.3 `/admin/guide/settings`（系列配置）

按 5.1 / 5.2 节列表组织，分组：
- **基础信息**：标题、副标题、封面 URL、徽章、CTA、SEO
- **价值卡片**：卡片 1/2/4 的文案（卡片 3 自动算）
- **学习阶段**：5 个阶段的 label/hint/icon/顺序

---

## 九、实施顺序

### Stage B-1：基础脚手架
1. 决策方案（D1 vs D2 — 推荐 D2）
2. 写 schema → `pnpm prisma migrate dev`
3. 新建 admin sidebar 菜单项
4. 新建空路由：`/admin/guide`、`/admin/guide/new`、`/admin/guide/[id]/edit`、`/admin/guide/settings`

### Stage B-2：CRUD
5. 写 `/api/admin/guide/chapters` 系列 API
6. 写章节列表页（按 group 分组）
7. 写章节编辑器（MarkdownEditor + 元信息子表单）
8. 创建 `lib/types/guide.ts`、`components/ui/switch.tsx`、`components/admin/guide-meta-editor.tsx`

### Stage B-3：系列配置
9. 写 `/api/admin/guide/series-config` GET/PUT
10. 写系列配置页（基础信息 + 价值卡片 + 学习阶段）
11. 用 mock 数据先跑通 admin 流程

### Stage C：数据源切换（前端从 manifest 切到 DB）
12. 写迁移脚本：把现有 8 个 md + manifest 数据写入数据库
13. 重写 `lib/docs.ts`：从 prisma 查
14. `manifest.ts` 精简为只剩 GROUPS 字典 → 之后也由 DB 替代
15. `guide-series-card.tsx` 改为接收 server props
16. `/agent-guide/*` 全部从 DB 取数据
17. `/blog/*` 加 `type: "blog"` 过滤（如果是 D1 方案；D2 方案不需要）

### Stage D：部署
18. 本地全功能验证
19. 服务器：`prisma migrate deploy` + 跑数据迁移脚本 + 重启

---

## 十、决策记录（✅ 全部已敲定 2026-07-19）

### Q1：数据模型走 D1 还是 D2？✅ D2（新开表）
- **决策**：D2 — 新开 `GuideChapter` + `GuideSeriesConfig` 两张表
- **理由**：见 6.3，符合原则 2.2（不必强行复用 Post）

### Q2：系列封面如何配置？✅ P1（URL 输入）
- **决策**：方案 P1，URL 输入框，与现有博客封面 100% 同模式
- **复用点**：直接参考 `post-editor.tsx` L206-214 的 Cover image block 写法
- **数据模型**：`GuideSeriesConfig.coverImage: String?`
- **前端 fallback**：URL 为空时显示当前品牌渐变
- **不做** P2（文件上传），将来如果做要全站统一升级，不混在 Agent 指南改造里

### Q3：5 大阶段是否允许 admin 增减？✅ 不允许
- **决策**：**不允许**。只允许编辑现有 5 个的 label/hint/icon/顺序，**不能加新阶段、不能删**
- **理由**：阶段数量变化会破坏学习路径可视化布局；如果真的需要加阶段，再做 migration

### Q4：章节是否需要评论功能？✅ 不需要
- **决策**：**不需要**
- **理由**：指南是"读"的内容，不是"讨论"的内容；如果要反馈，用户可以发博客评论或在关于页联系

### Q5：已发布章节是否可以下架？✅ 支持下架
- **决策**：**支持**（`published=false` 可切换）
- **理由**：发布后发现错误需要临时下架是常见需求；下架后前端 404，但 admin 还能看到

### Q6：Coming Soon 与 Published 的关系？✅ 4 种组合都支持
- **决策**：两个字段独立，组合表达 4 种状态：
  - `comingSoon=true, published=true`：sidebar 灰显但 admin 标记"准备中"
  - `comingSoon=true, published=false`：草稿状态，前端完全看不到
  - `comingSoon=false, published=true`：正常发布
  - `comingSoon=false, published=false`：草稿

---

## 附：Stage A 之后的"如果还要调整"

如果用户在 Stage A 之后还有视觉微调需求，常见调整点：

| 调整点 | 文件位置 |
|--------|---------|
| Hero 4 张价值卡片文案 | `app/agent-guide/page.tsx` L106-125 |
| Hero 装饰光晕大小/位置 | `app/agent-guide/page.tsx` L80 |
| 学习路径节点图标 | `app/agent-guide/page.tsx` PATH_NODES 数组 L40-46 |
| "学习路径"小标题文案 | `app/agent-guide/page.tsx` L142 |
| GuideSeriesCard 摘要 | `components/blog/guide-series-card.tsx` L102-104 |
| GuideSeriesCard 渐变色 | `components/blog/guide-series-card.tsx` L80 |
| sidebar 进度条颜色 | `app/agent-guide/components/docs-sidebar.tsx` L150 |
| 章节正文宽度 | `app/agent-guide/[slug]/page.tsx` 第一行 `max-w-4xl` |

但这些在 Stage B 完成后**应该都不需要改代码**，而是通过 admin 配置修改。
