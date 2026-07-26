# Blog Platform

一个现代化的全栈博客平台 + Agent 开发指南站，使用 Next.js 14 (App Router)、Tailwind CSS、Prisma 和 PostgreSQL 构建。
部署在阿里云 ECS + pm2（本地构建 → 上传 → 重启），图片走阿里云 OSS。

## 技术栈

- **框架**: Next.js 14 (App Router, Turbopack dev)
- **UI**: Shadcn/ui + Tailwind CSS + Radix
- **Markdown**: react-markdown + remark-gfm + react-syntax-highlighter + mermaid + **内联 SVG 渲染**（rehype-raw）
- **ORM**: Prisma 5
- **数据库**: PostgreSQL（本地 Docker，生产自建）
- **对象存储**: 阿里云 OSS（图片上传，正文插图/封面/头像）
- **图片处理**: sharp（上传时 resize + 转 webp）
- **进程管理**: pm2（生产）
- **语言**: TypeScript

## 项目结构

```
blog-platform/
├── app/                       # Next.js App Router
│   ├── blog/                  # 博客前端（面向访客）
│   ├── agent-guide/           # Agent 指南（独立内容类型，DB 驱动）
│   ├── admin/                 # 管理后台
│   │   ├── posts/  guide/  categories/  tags/
│   │   ├── comments/  users/  login/
│   ├── api/                   # API 路由
│   │   ├── admin/             # admin 鉴权接口（含 upload 图片上传）
│   │   ├── auth/  blog/  posts/  comments/  search/  track/
│   ├── layout.tsx  page.tsx  globals.css
├── components/                # React 组件
│   ├── ui/                    # Shadcn/ui 基础组件 + ImageUploader
│   ├── blog/                  # 博客前端组件（PostCard/CoverImage/...）
│   ├── admin/                 # 后台组件（编辑器/MetaEditor/...）
├── lib/                       # 工具与数据层
│   ├── guide/                 # Agent 指南数据层（server-only）
│   ├── storage/               # OSS 存储驱动（内外网 endpoint 切换）
│   ├── hooks/                 # React hooks（正文插图上传）
│   ├── markdown/              # rehype schema（SVG 白名单）
│   ├── prisma.ts              # Prisma 客户端
│   ├── auth-middleware.ts     # admin 鉴权中间件
│   ├── admin-fetch.ts         # 前端调 admin API 的封装
│   ├── themes.ts  site-profile.ts
├── prisma/
│   ├── schema.prisma          # 数据模型
│   ├── migrations/            # 迁移（手写 SQL + migrate deploy 管理）
│   ├── seed.ts                # 基础数据 seed
│   ├── seed-guide.ts          # Agent 指南内容 seed
├── scripts/                   # 部署与运维脚本
│   ├── deploy.local.sh        # 本地一键部署（build + 打包 + 上传 + 触发服务器）
│   ├── deploy.server.sh       # 服务器端部署脚本
│   ├── deploy.config.example.sh  # 部署配置模板
│   ├── preflight-check.sh     # 部署前自检
│   ├── test-oss.ts            # OSS 接入联调验证
│   ├── cleanup-oss-test.ts    # OSS 测试文件清理
├── docs/                      # 公开文档（架构/设计/接入指南）
├── docs_memo/                 # 私人开发备忘（gitignore，不进仓库）
├── next.config.js
└── package.json
```

## 快速开始

### 1. 环境要求
- Node.js 20.x
- pnpm
- PostgreSQL（本地推荐用 Docker 起一个）

### 2. 安装依赖
```bash
pnpm install
```

### 3. 配置环境变量
```bash
cp .env.example .env
```
按 `.env.example` 注释填入数据库连接串、JWT 密钥、OSS 配置等。

### 4. 初始化数据库
```bash
# 生成 Prisma Client（postinstall 已自动执行，可跳过）
pnpm db:generate

# 应用迁移建表（注意：本项目用手写 SQL + migrate deploy，不用 migrate dev）
npx prisma migrate deploy

# 灌入基础数据
pnpm db:seed

# （可选）灌入 Agent 指南初始内容（幂等；--force 覆盖已编辑数据，慎用）
pnpm db:seed:guide
```

> ⚠️ 迁移管理：本项目数据库已纳入 `prisma migrate` 管理（baseline 已完成）。**改 schema 时走「手写 SQL + `npx prisma migrate deploy`」**，不要用 `prisma migrate dev`（会因 drift 报错）。详见 `docs/0723-agent-guide-DB化与admin后台接线.md` 第五节。

### 5. 启动开发服务器
```bash
pnpm dev
```
访问 [http://localhost:3000](http://localhost:3000)（根路径会重定向到 `/blog`）。

## 可用脚本

| 命令 | 用途 |
|------|------|
| `pnpm dev` | 启动开发服务器（Turbopack） |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint |
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:studio` | 打开 Prisma Studio（数据库可视化） |
| `pnpm db:seed` | 灌入基础 seed 数据 |
| `pnpm db:seed:guide` | 灌入 Agent 指南初始内容（幂等） |
| `bash scripts/preflight-check.sh` | 部署前自检（9 项检查） |
| `bash scripts/deploy.local.sh` | 一键部署到服务器 |
| `pnpm tsx scripts/test-oss.ts` | OSS 接入联调验证 |
| `pnpm tsx scripts/cleanup-oss-test.ts` | 清理 OSS 测试文件 |

## 架构说明

- **`/blog`** — 博客前端（面向访客）：文章列表、详情、关于、RSS
- **`/agent-guide`** — Agent 指南（独立内容类型，数据库驱动，与博客文章并存）
- **`/admin`** — 管理后台（面向博主）：仪表盘、文章、Agent 指南、分类、标签、评论、用户
- **`/api`** — 后端接口：admin 鉴权接口走 `verifyAdmin(request)`，公开接口直接读 DB

## 数据模型

主要模型（详见 `prisma/schema.prisma`）：
- **User** — 用户（user / admin 角色）
- **Post** — 博客文章
- **Category / Tag** — 分类与标签
- **Comment** — 评论
- **GuideChapter** — Agent 指南章节（独立于 Post）
- **GuideSeriesConfig** — Agent 指南系列配置（单例）

## 图片处理

- **上传**：`POST /api/admin/upload`，multipart + sharp 处理（按 folder resize + 转 webp）
- **存储**：阿里云 OSS，`lib/storage/` 抽象驱动（支持内外网 endpoint 切换）
- **封面**：`<CoverImage>` 通用组件（固定高度 + object-cover + overlay）
- **正文插图**：MarkdownEditor 工具栏，支持点击/粘贴/拖拽上传，自动插入 markdown
- **SVG 渲染**：正文支持内联 SVG（rehype-raw + 白名单透传），可放技术示意图

## 生产部署（阿里云 ECS + pm2）

采用「**本地构建 → 打包 → 上传 → 服务器装依赖 + pm2 重启**」流程，适用于配置较小的 ECS。

### 一键部署

```bash
# 1. 首次：复制部署配置模板并填入服务器信息
cp scripts/deploy.config.example.sh scripts/deploy.config.sh
vi scripts/deploy.config.sh   # 填 IP/目录/pm2 名

# 2. 部署前自检（可选，检查 build/迁移/依赖等）
bash scripts/preflight-check.sh

# 3. 一键部署
bash scripts/deploy.local.sh
```

脚本自动完成：本地 build → 打包 → scp 上传 → ssh 触发服务器部署（解压 + 装依赖 + migrate + seed + 重启）。

灵活控制（编辑 `scripts/deploy.config.sh`）：
- `DEPLOY_MIGRATE=true/false` — 是否跑 migrate
- `DEPLOY_SEED_GUIDE=true/false` — 是否灌 guide 数据
- `DEPLOY_SEED_FORCE=true/false` — seed 是否覆盖（慎用）

> 部署文档详见 `docs/0726-部署上线与数据同步.md`。

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `PRISMA_DATABASE_URL` | Prisma 主连接串（schema.prisma 读这个） | ✅ |
| `DATABASE_URL` | 脚本用的连接串（与上面同库即可） | ✅ |
| `JWT_SECRET` | JWT 密钥（≥32 字符） | ✅ |
| `NEXT_PUBLIC_BASE_URL` | 站点根 URL | ✅ |
| `IP_HASH_SALT` | IP 哈希盐值 | ✅ |
| `OSS_REGION` | 阿里云 OSS 区域（如 `oss-cn-guangzhou`） | OSS |
| `OSS_BUCKET` | OSS Bucket 名 | OSS |
| `OSS_ACCESS_KEY_ID` | RAM 子账号 AK | OSS |
| `OSS_ACCESS_KEY_SECRET` | RAM 子账号 SK | OSS |
| `OSS_USE_INTERNAL` | 服务器设 `true` 走内网 endpoint | OSS·服务器 |

## 文档

公开文档（`docs/`）按时间倒序：
- [`0726-部署上线与数据同步.md`](./docs/0726-部署上线与数据同步.md) — 部署流程 + 数据同步方案
- [`0725-oss-接入调研与接入草案.md`](./docs/0725-oss-接入调研与接入草案.md) — 阿里云 OSS 完整接入指南
- [`0724-agent-guide-主题架构评估与代码块修复.md`](./docs/0724-agent-guide-主题架构评估与代码块修复.md) — 主题/明暗架构评估 + 代码块修复
- [`0723-agent-guide-DB化与admin后台接线.md`](./docs/0723-agent-guide-DB化与admin后台接线.md) — Agent 指南 DB 化 + admin 后台
- [`0719-agent-guide-视觉改造与admin规划.md`](./docs/0719-agent-guide-视觉改造与admin规划.md) — Agent 指南视觉改造 + admin 规划

> 私人开发备忘在 `docs_memo/`（gitignore，不进仓库）。

## 许可证

MIT
