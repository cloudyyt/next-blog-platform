# Blog Platform

一个现代化的全栈博客平台，使用 Next.js 14、Shadcn/ui、Tailwind CSS、Prisma 和 MySQL 构建。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI 组件库**: Shadcn/ui
- **样式**: Tailwind CSS
- **ORM**: Prisma
- **数据库**: SQLite (开发环境) / PostgreSQL 或 MySQL (生产环境)
- **部署**: Vercel
- **语言**: TypeScript

## 项目结构

```
blog-platform/
├── app/                    # Next.js App Router 目录
│   ├── blog/              # 博客前端页面
│   │   ├── layout.tsx     # 博客布局
│   │   └── page.tsx       # 博客首页
│   ├── admin/             # 后台管理界面
│   │   ├── layout.tsx     # 管理后台布局
│   │   └── page.tsx       # 管理后台首页
│   ├── api/               # API 路由
│   │   └── route.ts       # API 示例
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   └── ui/               # Shadcn/ui 组件
├── lib/                  # 工具函数和配置
│   ├── prisma.ts         # Prisma 客户端实例
│   └── utils.ts          # 工具函数
├── prisma/               # Prisma 配置
│   └── schema.prisma     # 数据库模型定义
├── components.json        # Shadcn/ui 配置
├── next.config.js        # Next.js 配置
├── tailwind.config.ts    # Tailwind CSS 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目依赖

```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

默认配置使用 SQLite，适合本地开发：

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
```

**数据库选择**：

- **开发环境（推荐）**: 使用 SQLite，无需额外配置
- **生产环境（Vercel）**: 使用 Vercel Postgres，部署后自动配置
- **其他选项**: MySQL 或 PostgreSQL，需自行配置 `DATABASE_URL`

**安全提示**：
- `JWT_SECRET` 用于加密 Token，生产环境务必使用强随机字符串
- 生成强密钥：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库架构（开发环境）
npm run db:push

# 或使用迁移（生产环境推荐）
npm run db:migrate
```

### 4. 启动开发服务器

**博客前端（默认端口 3000）：**
```bash
npm run dev
```
访问 [http://localhost:3000](http://localhost:3000) 查看博客前端。

**管理后台（端口 3001）：**
```bash
npm run dev:admin
```
访问 [http://localhost:3001](http://localhost:3001) 查看管理后台。

**注意**：博客前端和管理后台可以同时运行，它们共享同一个数据库和API。

## 可用脚本

- `npm run dev` - 启动博客前端开发服务器（端口 3000）
- `npm run dev:admin` - 启动管理后台开发服务器（端口 3001）
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器（端口 3000）
- `npm run start:admin` - 启动管理后台生产服务器（端口 3001）
- `npm run lint` - 运行 ESLint
- `npm run db:generate` - 生成 Prisma Client
- `npm run db:push` - 推送数据库架构变更（开发）
- `npm run db:migrate` - 创建数据库迁移（生产）
- `npm run db:studio` - 打开 Prisma Studio（数据库可视化工具）
- `npm run set-admin <用户名>` - 将指定用户设置为管理员（用户需先注册）

## 数据库模型

项目包含以下数据模型：

- **User** - 用户模型（支持普通用户和管理员）
- **Post** - 文章模型
- **Category** - 分类模型
- **Tag** - 标签模型
- **Comment** - 评论模型

详细模型定义请查看 `prisma/schema.prisma`。

## 环境变量说明

| 变量名 | 说明 | 开发环境默认值 | 生产环境要求 |
|--------|------|----------------|--------------|
| `DATABASE_URL` | 数据库连接字符串 | `file:./dev.db` (SQLite) | 由 Vercel Postgres 自动提供 |
| `JWT_SECRET` | JWT 密钥 | 需手动配置 | 必须使用强随机字符串 |
| `PORT` | 服务器端口 | `3000` 或 `3001` | Vercel 自动配置 |
| `ADMIN_USERNAME` | 管理员用户名 | 可选 | 可选 |

### 生产环境配置

部署到 Vercel 时，需要在 Vercel 项目设置中配置以下环境变量：

1. **DATABASE_URL**：如果使用 Vercel Postgres，部署后 Vercel 会自动提供
2. **JWT_SECRET**：必须设置强随机字符串（生成方法见上）
3. 运行数据库迁移（Vercel 会自动在部署时执行 `npm run db:generate`）

## 架构说明

项目采用前后端分离的架构设计：

- **`/blog`** - 前端展示页面（面向访客）
- **`/admin`** - 管理后台界面（面向博主，用于内容管理）
- **`/api`** - 后端 API 接口（所有数据操作）

`/blog` 和 `/admin` 都是前端展示页面，它们通过调用 `/api` 下的接口来完成数据交互。这样的设计使得前后端职责清晰，便于维护和扩展。

## 路由说明

### 前端展示路由

#### 博客前端（/blog）- 面向访客

- `/blog` - 博客首页（文章列表）
- `/blog/[slug]` - 文章详情页（待实现）
- `/blog/about` - 关于页面（待实现）

#### 管理后台（/admin）- 面向博主

- `/admin` - 管理后台首页（仪表盘）
- `/admin/posts` - 文章管理页面（待实现）
  - 显示文章列表
  - 提供创建、编辑、删除文章的 UI
  - 所有操作通过调用 `/api` 接口完成
- `/admin/users` - 用户管理页面（待实现）

### API 路由（/api）- 后端接口

所有数据操作（增删改查）都在 `/api` 路由下实现：

- `/api` - API 根路径（示例）
- `/api/posts` - 文章相关接口
  - `GET /api/posts` - 获取文章列表
  - `POST /api/posts` - 创建文章
  - `GET /api/posts/[id]` - 获取单篇文章（待实现）
  - `PUT /api/posts/[id]` - 更新文章（待实现）
  - `DELETE /api/posts/[id]` - 删除文章（待实现）
- `/api/categories` - 分类相关接口（待实现）
- `/api/tags` - 标签相关接口（待实现）
- `/api/users` - 用户相关接口（待实现）

## 公共组件和功能

项目已封装了以下公共组件，可在 `/blog` 和 `/admin` 中复用：

### 主题切换

项目已集成 `next-themes`，支持明暗主题切换：

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle"

// 在页面中使用
<ThemeToggle />
```

主题配置已在根布局中完成，支持：
- 跟随系统主题
- 手动切换明暗主题
- 主题状态持久化

### Toast 通知

使用 `sonner` 封装的 Toast 组件：

```tsx
import { toast } from "@/lib/toast"

// 成功提示
toast.success("操作成功", "详细描述")

// 错误提示
toast.error("操作失败", "错误详情")

// 信息提示
toast.info("提示信息")

// 警告提示
toast.warning("警告信息")

// 加载提示
const toastId = toast.loading("加载中...")
// 稍后可以关闭
toast.dismiss(toastId)

// Promise 自动处理
toast.promise(promise, {
  loading: "处理中...",
  success: "成功",
  error: "失败"
})
```

### Loading 加载

提供三种 Loading 组件：

```tsx
import { Loading, LoadingScreen, LoadingInline } from "@/components/ui/loading"

// 基础加载（可自定义大小和文本）
<Loading size="md" text="加载中..." />

// 全屏加载
<LoadingScreen text="正在加载..." />

// 内联加载（小尺寸）
<LoadingInline text="加载中" />
```

### 确认对话框

用于需要用户确认的操作：

```tsx
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="确认删除"
  description="此操作不可撤销，确定要删除吗？"
  confirmText="删除"
  cancelText="取消"
  variant="destructive" // 或 "default"
  onConfirm={async () => {
    // 执行删除操作
  }}
/>
```

### 组件导出

所有公共组件都从 `@/components` 统一导出：

```tsx
import { 
  Button, 
  ThemeToggle, 
  Loading, 
  ConfirmDialog,
  toast 
} from "@/components"
```

## 添加 Shadcn/ui 组件

使用 Shadcn/ui CLI 添加组件：

```bash
npx shadcn-ui@latest add [component-name]
```

例如：

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
```

## 部署到 Vercel

### 方式一：使用 Vercel Postgres（推荐）

这是最简单的方式，Vercel Postgres 无需额外配置，自动处理数据库连接。

#### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

#### 2. 在 Vercel 中创建项目

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 框架选择 "Next.js"，Vercel 会自动检测配置
5. 点击 "Deploy" 开始部署

#### 3. 创建 Vercel Postgres 数据库

部署完成后：

1. 在项目首页点击 "Storage" 标签
2. 点击 "Create Database"，选择 "Postgres"
3. 选择区域（建议选择离用户最近的区域）
4. 点击 "Create"

Vercel 会自动完成：
- 创建 Postgres 数据库
- 配置 `DATABASE_URL` 环境变量
- 运行 `prisma generate` 和 `prisma db push`（如果配置了）

#### 4. 配置环境变量

在 Vercel 项目设置中添加：

```env
JWT_SECRET=<生成的强随机字符串>
```

生成方法：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5. 重新部署

配置完成后，点击 "Redeploy" 按钮重新部署项目。

---

### 方式二：使用外部数据库（MySQL/PostgreSQL）

如果你已有外部数据库（如 AWS RDS、PlanetScale、Railway 等）：

#### 1. 配置环境变量

在 Vercel 项目设置中添加：

```env
DATABASE_URL="mysql://user:password@host:3306/database?schema=public"
JWT_SECRET=<生成的强随机字符串>
```

#### 2. 修改 Prisma Schema

如果使用 MySQL，修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

#### 3. 运行数据库迁移

部署到 Vercel 后，数据库会自动同步。如果需要手动迁移：

```bash
# 本地开发环境
npm run db:push

# 或使用迁移
npm run db:migrate
```

---

### 部署后检查

1. **访问应用**：Vercel 会提供部署后的 URL
2. **测试功能**：
   - 访问 `/admin` 进入管理后台
   - 注册第一个用户
   - 运行以下命令设置为管理员：

```bash
npm run set-admin <你的用户名>
```

3. **检查日志**：在 Vercel 控制台查看部署日志

---

### 生产环境注意事项

⚠️ **安全检查清单**：

- [ ] 已设置强 `JWT_SECRET`（至少 32 个字符）
- [ ] 已移除默认的管理员账号硬编码
- [ ] 环境变量不在代码中暴露
- [ ] 数据库连接使用 HTTPS
- [ ] 启用了 Vercel 的自动 HTTPS
- [ ] 考虑添加速率限制和 CSRF 保护

🚀 **性能优化**：

- 使用 Vercel Postgres（最低延迟）
- 启用 Next.js 图片优化
- 配置 CDN（Vercel 自动提供）
- 考虑使用 Vercel KV 进行缓存

## 样式和 CSS

### CSS 预处理器

**客观说明：**

- **Next.js 原生支持**：CSS Modules、全局 CSS、Sass/SCSS（需安装 `sass`）
- **Tailwind CSS 场景**：使用 Tailwind 时，通常**不需要**预处理器
  - Tailwind 是 utility-first，样式通过类名完成
  - `globals.css` 用于 Tailwind 的基础样式和 CSS 变量（这是正常的）
- **企业项目实践**：
  - 如果只用 Tailwind：通常不需要预处理器
  - 如果团队习惯 SCSS/Less：可以添加，但会增加复杂度
  - 混合使用：Tailwind 处理大部分样式，SCSS 处理复杂动画或特殊场景

**本项目选择**：使用 Tailwind CSS + `globals.css`，不引入预处理器，保持技术栈简洁。

### 样式开发规范

1. **优先使用 Tailwind 类名**：遵循 utility-first 原则
2. **CSS 变量**：在 `globals.css` 中定义主题相关的 CSS 变量
3. **组件样式**：使用 `cn()` 工具函数合并类名（来自 `@/lib/utils`）
4. **响应式设计**：使用 Tailwind 的响应式前缀（`sm:`, `md:`, `lg:` 等）

## 开发建议

1. **组件开发**: 在 `components/` 目录下创建可复用组件
2. **API 开发**: 在 `app/api/` 目录下创建 API 路由，所有数据操作都在这里实现
3. **前后端交互**: `/blog` 和 `/admin` 页面通过 `fetch` 或 `axios` 调用 `/api` 接口
4. **样式**: 使用 Tailwind CSS 类名，遵循 Shadcn/ui 的设计规范
5. **类型安全**: 充分利用 TypeScript 的类型检查
6. **数据库**: 使用 Prisma Studio (`npm run db:studio`) 可视化查看和编辑数据
7. **公共组件**: 优先使用已封装的公共组件（Toast、Loading、ConfirmDialog 等）
8. **主题切换**: 使用 `ThemeToggle` 组件，主题状态会自动持久化

### 开发流程示例

**创建文章功能：**

1. 在 `/admin/posts` 页面创建表单 UI
2. 表单提交时调用 `POST /api/posts` 接口
3. 接口在 `app/api/posts/route.ts` 中处理业务逻辑和数据库操作
4. 返回结果后，前端更新 UI

## 常见问题

### Q: 如何设置第一个管理员？

1. 访问应用，注册一个账号
2. 运行以下命令将该用户设为管理员：

```bash
npm run set-admin <你的用户名>
```

或设置环境变量：

```bash
ADMIN_USERNAME=<你的用户名> npm run set-admin
```

### Q: 开发环境使用 SQLite，部署到 Vercel 需要改代码吗？

不需要！`DATABASE_URL` 通过环境变量配置，Prisma 会自动适配：
- 开发环境：`file:./dev.db` (SQLite)
- 生产环境：`postgresql://...` (Vercel Postgres)

### Q: 数据迁移会自动执行吗？

- **Vercel Postgres**: 是的，Vercel 会在部署时自动运行 `prisma db push`
- **外部数据库**: 需要手动运行迁移命令

### Q: 如何备份数据？

- **Vercel Postgres**: 在 Vercel 控制台的 Storage 页面可以导出数据
- **其他数据库**: 使用数据库服务商提供的备份功能

---

## 下一步计划

- [ ]  实现用户认证系统（部分完成）
- [ ]  实现文章 CRUD 功能
- [ ]  实现分类和标签管理
- [ ]  实现博客前端文章列表和详情页
- [ ]  实现管理后台完整功能
- [ ]  添加 Markdown 编辑器
- [ ]  实现图片上传功能
- [ ]  添加 SEO 优化
- [ ]  实现评论系统
- [ ]  添加搜索功能

## 许可证

MIT
