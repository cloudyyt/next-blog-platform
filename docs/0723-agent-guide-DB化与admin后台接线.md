# 0723 · Agent 指南 DB 化与 Admin 后台接线（实施记录）

> 本文档记录 2026-07-23 完成的工作：把 Agent 指南从「mock / 硬编码 md」彻底改为「数据库驱动 + admin 可编辑」，打通 admin 编辑 → 前端实时生效的闭环。
> 承接 [`0719-agent-guide-视觉改造与admin规划.md`](./0719-agent-guide-视觉改造与admin规划.md)，对应其中的 **Stage B-2（章节 CRUD）+ B-3（系列配置）+ C（前端数据源切换）**。
> 用户原话：v1 的 `docs/agent-guide/*.md` + `manifest.ts` 「过于硬编码」，改成后台能上传/编辑更新。

---

## 一、本轮范围与结果

| 阶段 | 状态 | 内容 |
|------|------|------|
| Stage 0 前置 | ✅ | prisma 两张表 + 迁移 + 一次性 seed |
| Stage B-2 章节 CRUD | ✅ | admin API + 列表/编辑/新建页接线 |
| Stage B-3 系列配置 | ✅ | admin API + settings 页接线 |
| Stage C 数据源切换 | ✅ | 数据层 + 前端 6 处消费方切到 DB |
| Stage D 部署 | ⏳ | 未做（本地全功能验证已通过） |

**验证结论**：`pnpm build` 通过；运行时 curl 实测总览页/章节页从 DB 渲染；admin 改系列配置/章节后前端**立即**生效（`revalidatePath`）；章节下架即 404。

---

## 二、数据模型（D2 落地）

`prisma/schema.prisma` 新增两张表（决策见 0719 文档第六节，全部按 D2 实现）：

```prisma
model GuideChapter {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String                          // markdown
  description String?
  group       String                          // intro|foundation|core|system|appendix
  difficulty  String                          // 入门|进阶|实战
  order       Int      @default(10)           // 分组内排序
  readingTime Int?                            // 留空则前端按正文估算
  comingSoon  Boolean  @default(false)
  published   Boolean  @default(false)
  ogImage     String?
  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([group, order])
  @@index([published])
  @@map("guide_chapters")
}

model GuideSeriesConfig {
  id            String   @id @default("singleton")  // 固定 id + upsert 实现单例
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
  groups        Json                             // GuideGroupMeta[]（5 阶段 label/hint/icon/order）
  updatedAt     DateTime @updatedAt
  @@map("guide_series_config")
}
```

`User` 加反向关系 `guideChapters GuideChapter[]`。

**singleton 实现**：`id @default("singleton")`，读写一律 `upsert({ where: { id: "singleton" }, update, create: { id: "singleton", ... } })`，物理上只有一条记录。

---

## 三、数据流架构（Stage C 核心：方案 A）

### 难点
客户端 `docs-sidebar.tsx`（`"use client"`）原本模块顶层同步 `import { getChaptersGrouped } from manifest`，而 DB 查询只能在 server 异步做。

### 采纳：方案 A — layout 查 DB → props 下传

```
app/agent-guide/layout.tsx (async server)
  └─ sidebarData = await getGuideSidebarData()   ← 一次性查 DB
  └─ <DocsShell sidebarData={sidebarData}>{children}</DocsShell>
        ├─ 桌面 aside: <DocsSidebar data={sidebarData} />
        └─ 移动抽屉:   <DocsSidebar data={sidebarData} onNavigate={...} />  // 同一份数据
```

**为什么选 A 而不是「sidebar 内 useEffect fetch 公开 API」：**
- 首屏无 loading 闪烁（契合 0719 原则 2.1 视觉优先）
- 桌面常驻 + 移动抽屉用**同一份 props**，杜绝两份数据不一致
- sidebar 数据与正文同处一个 revalidate 边界，admin 改动后一起更新
- `getGuideSidebarData` 是 **slim 版**（只 select 必要字段，不含 markdown 正文），不把正文塞进 client bundle

**不建公开 `/api/guide/*`**：方案 A 无需 client fetch，YAGNI。未来要开放第三方再补 GET 即可。

### 数据层 `lib/guide/data.ts`（server-only）
所有前端 + admin 读都走这里，用 React `cache()` 在同请求内去重（layout / page / 章节页共享）：

| 函数 | 用途 |
|------|------|
| `getGuideSeriesConfig()` | 读 singleton，`parseGroups` 安全断言 Json→`GuideGroupMeta[]`，脏数据 fallback |
| `getGuideSidebarData()` | slim 章节分组（含 comingSoon 灰显），传给客户端 |
| `getGuideOverviewData()` | 总览页：分组 + description + series config |
| `getGuideChapterFull(slug)` | 单章；`!published` 或 `comingSoon` → null（前端 404） |
| `getGuideAdjacentChapters(slug)` | 上一/下一章（仅 published & !comingSoon） |
| `getGuidePublishedSlugs()` | `generateStaticParams` 用 |
| `getGuideHomeCardData()` | 首页卡 config + 统计 + Phase 范围 |
| `estimateReadingTime(content)` | 从 `lib/docs.ts` 迁入 |

---

## 四、Admin API（仅 admin，镜像现有 posts 范式）

```
GET    /api/admin/guide/chapters            # 列表（含草稿/WIP）
POST   /api/admin/guide/chapters            # 新建
GET    /api/admin/guide/chapters/[id]       # 单章（编辑器回填）
PUT    /api/admin/guide/chapters/[id]       # 更新
DELETE /api/admin/guide/chapters/[id]       # 删除
GET    /api/admin/guide/series-config       # 读 singleton
PUT    /api/admin/guide/series-config       # upsert singleton
```

- 鉴权复用 `verifyAdmin(request)`（`@/lib/auth-middleware`），`[id]` 路由用**同步** `params: { id: string }`。
- 错误处理 `P2002`(slug 冲突) / `P2025`(未找到)，与 posts 一致。
- 前端调用用 `authFetch`（`@/lib/admin-fetch`，自动带 Bearer、401 跳登录）。

### ISR + on-demand revalidate
所有写操作（POST/PUT/DELETE）成功后调用：
```ts
revalidatePath("/agent-guide", "page")
revalidatePath("/agent-guide/[slug]", "page")
revalidatePath("/blog", "page")
```
章节页保留 `revalidate = 600` 兜底。第二参数务必传 `"page"` 才覆盖动态路由与 layout。

---

## 五、数据迁移（seed）与迁移环境坑

### 一次性内容迁移：`prisma/seed-guide.ts`
- 读 `docs/agent-guide/manifest.ts` + 10 个 md，写入 `GuideChapter`（`upsert by slug`）+ `GuideSeriesConfig`（`upsert by singleton`）。
- **容错**：`appendix-glossary.md` 缺失 → `content=""`（该章 comingSoon，不影响读者）。
- **推导 order**：manifest 无 order 字段，按 group 内出现顺序 ×10 递增。
- **幂等 + `--force` 守卫**：默认只插入新章、跳过已存在 slug；`pnpm db:seed:guide --force` 才覆盖（避免重跑覆盖 admin 手动编辑）。
- package.json 加 `"db:seed:guide": "tsx prisma/seed-guide.ts"`。

实际 seed 结果：11 章入库（4 可访问、7 WIP），singleton 已建。

### ⚠️ 迁移环境坑（重要，下次改 schema 会再遇到）
本项目 DB（postgres，Docker，127.0.0.1:5432，库名 `blog_platform`）**之前是 drift 状态**：有 `prisma/migrations/` 文件，但 DB 里没有 `_prisma_migrations` 历史表（早期用 `db push` 建的）。直接跑会报错：

```
prisma migrate dev          → "non-interactive not supported"
prisma migrate deploy       → P3005 "database schema is not empty"
```

**正确流程（baseline + deploy）：**
1. `prisma migrate resolve --applied 20251230174814_init`
2. `prisma migrate resolve --applied 20260413205000_add_post_view_tracking`
3. 手写迁移 SQL 到 `prisma/migrations/20260723000000_add_guide_models/migration.sql`（postgres 风格：`TIMESTAMP(3)`、`@@map` 蛇形小写）
4. `npx prisma migrate deploy`（非交互，应用新迁移）
5. `npx prisma generate`

baseline 已做完，DB 现已正式纳入 migrate 管理，**下次改 schema 走「手写 SQL + migrate deploy」即可**，别再用 `migrate dev`。

---

## 六、前端消费方切换清单

manifest/md 运行时消费方 6 处，全部改读 `lib/guide/data.ts`：

| 文件 | 改动 |
|------|------|
| `app/agent-guide/layout.tsx` | 改 async server，`getGuideSidebarData()` 传给 DocsShell；`generateMetadata` 读 series config（ogTitle/ogDescription/ogImage，缺省 fallback 标题/副标题） |
| `app/agent-guide/components/docs-shell.tsx` | 新增 `sidebarData` prop，透传两处 DocsSidebar |
| `app/agent-guide/components/docs-sidebar.tsx` | 删 manifest import 与顶层 `getChaptersGrouped()`，改 `data` prop |
| `app/agent-guide/page.tsx` | `getGuideOverviewData()`；Hero 标题/副标题/价值卡片 1·2·4/CTA 读 config；学习路径用 config.groups |
| `app/agent-guide/[slug]/page.tsx` | `getGuideChapterFull` 等；`generateStaticParams` 改 async；metadata 支持 ogImage |
| `app/agent-guide/components/docs-pager.tsx` | type-only：`ChapterMeta` → `GuideChapterSummary` |
| `components/blog/guide-series-card.tsx` | 删 manifest；改接收 `data: GuideHomeCardData`；cover 支持 coverImage 图片/渐变 fallback |
| `app/blog/page.tsx` + `blog-page-client.tsx` + `load-more-button.tsx` | 串 `guideCardData` props 到卡片 |

**删除**：`lib/docs.ts`（`estimateReadingTime` 已迁走）、`lib/mock/guide-data.ts`（DB 接入后无用，常量已内联进 seed-guide.ts）。

**保留**：`docs/agent-guide/manifest.ts` + `*.md`（seed 依赖；运行时无 import）。Stage D 上线稳定后可再删。

---

## 七、Admin 接线清单

| 文件 | 改动 |
|------|------|
| `app/admin/guide/page.tsx` | 改 server 取数（无闪烁）；抽 client 组件 `guide-chapters-list.tsx` 处理删除 |
| `components/admin/guide-chapters-list.tsx` | **新建**：删除对话框 + DELETE fetch |
| `app/admin/guide/[id]/edit/page.tsx` | server 查 `prisma.guideChapter.findUnique` + `getGuideGroups()` |
| `app/admin/guide/new/page.tsx` | server 查 groups 传编辑器 |
| `app/admin/guide/settings/page.tsx` | server 查 singleton 传 form |
| `components/admin/guide-chapter-editor.tsx` | 新增 `groups` prop；保存改 `authFetch`（create→POST / edit→PUT） |
| `components/admin/guide-meta-editor.tsx` | 删 `MOCK_GROUPS`，改接收 `groups` prop |
| `components/admin/guide-series-config-form.tsx` | 保存改 `authFetch PUT` + `router.refresh()` |

---

## 八、验证记录

1. **迁移/seed**：`migrate deploy` 成功；`db:seed:guide` 打印 11 章入库、singleton 已建。
2. **build**：`pnpm build` 通过。`/agent-guide/[slug]` 为 SSG，预渲染 **4 章**（intro / phase-0 / phase-1 / phase-2），正好等于 DB 里 published & !comingSoon 的章。
3. **运行时 curl**：总览页从 DB 渲染（系列标题、价值卡片、学习路径、章节列表）；`/agent-guide/phase-3-first-agent`（comingSoon）正确 **404**；`/blog` 200。
4. **admin 闭环实测**（登录拿 token 直接打 API）：
   - 改 series 配置 `valueCard1` → 总览页**立即**显示新值（revalidatePath 生效）→ 已还原
   - 章节 `intro` `published=false` → 前端 **404**；`published=true` → **200**（下架/上架闭环）
5. **未做**：浏览器实际点击 admin UI（API 层等价验证过，建议手动点一遍确认表单手感）。

---

## 九、剩余工作：Stage D 部署

服务器上线步骤（参考 [`本地构建部署到服务器（不带node_modules）.md`](./本地构建部署到服务器（不带node_modules）.md)）：

1. 服务器 `prisma migrate deploy`（应用 `add_guide_models` 迁移，建两张表）
2. 跑一次 `pnpm db:seed:guide`（灌入初始内容；**注意 `--force` 慎用**，会覆盖已编辑数据）
3. 重启服务
4. 登录 admin 抽查 `/admin/guide`、`/agent-guide`、首页卡片

---

## 附：本轮新增/修改文件

**新增**
- `prisma/migrations/20260723000000_add_guide_models/migration.sql`
- `prisma/seed-guide.ts`
- `app/api/admin/guide/chapters/route.ts`、`chapters/[id]/route.ts`、`series-config/route.ts`
- `lib/guide/data.ts`
- `components/admin/guide-chapters-list.tsx`
- `lib/types/guide.ts`（含 `SidebarGroup` / `OverviewGroup` / `GuideHomeCardData` / `GuideChapterSummary` 视图类型）

**修改**
- `prisma/schema.prisma`、`package.json`
- `app/admin/guide/{page,[id]/edit/page,new/page,settings/page}.tsx`
- `components/admin/guide-{chapter-editor,meta-editor,series-config-form}.tsx`
- `app/agent-guide/{layout,page}.tsx`、`[slug]/page.tsx`、`components/{docs-shell,docs-sidebar,docs-pager}.tsx`
- `components/blog/{guide-series-card,blog-page-client,load-more-button}.tsx`、`app/blog/page.tsx`

**删除**
- `lib/docs.ts`、`lib/mock/guide-data.ts`
