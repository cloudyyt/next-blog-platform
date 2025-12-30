# Vercel 部署配置指南

## 📋 在 Vercel 配置页面需要做的操作

### 1. ✅ 构建配置（已自动检测，无需修改）

Vercel 已经自动检测到：
- Framework Preset: Next.js ✅
- Build Command: `npm run build` ✅（已添加 postinstall 脚本，会自动生成 Prisma Client）
- Install Command: `npm install` ✅
- Output Directory: Next.js default ✅

**无需修改！** 我已经在 `package.json` 中添加了 `postinstall` 脚本，Vercel 会在安装依赖后自动运行 `prisma generate`。

### 2. 🔧 环境变量配置（重要！）

**不要直接导入 `.env` 文件！** 需要手动添加以下环境变量：

#### 必需的环境变量：

1. **JWT_SECRET**（必需）
   - 生成方法（在本地终端运行）：
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - 在 Vercel 环境变量中添加：
     - Key: `JWT_SECRET`
     - Value: `<上面生成的字符串>`
     - Environment: 选择 `Production`, `Preview`, `Development`（全选）

2. **DATABASE_URL**（如果使用 Vercel Postgres，会自动配置）
   - 如果使用 Vercel Postgres：创建数据库后会自动添加，无需手动配置
   - 如果使用外部数据库：需要手动添加连接字符串

### 3. 🗄️ 数据库配置

#### 方案 A：使用 Vercel Postgres（推荐，最简单）

1. **创建数据库**：
   - 在 Vercel 项目页面，点击 "Storage" 标签
   - 点击 "Create Database"
   - 选择 "Postgres"
   - 选择区域（建议选择 `hkg1` 或离你最近的区域）
   - 点击 "Create"

2. **修改 Prisma Schema**（需要修改代码）：
   
   修改 `prisma/schema.prisma`：
   ```prisma
   datasource db {
     provider = "postgresql"  // 从 sqlite 改为 postgresql
     url      = env("DATABASE_URL")
   }
   ```

3. **提交代码并推送**：
   ```bash
   git add prisma/schema.prisma package.json
   git commit -m "配置 Vercel Postgres"
   git push
   ```

4. **Vercel 会自动**：
   - 配置 `DATABASE_URL` 环境变量
   - 在部署时运行 `prisma generate`
   - 首次部署后，需要手动运行数据库迁移（见下方）

#### 方案 B：使用外部数据库（MySQL/PostgreSQL）

1. **配置环境变量**：
   - 在 Vercel 环境变量中添加 `DATABASE_URL`
   - 格式：`mysql://user:password@host:3306/database?schema=public`
   - 或：`postgresql://user:password@host:5432/database?schema=public`

2. **修改 Prisma Schema**（如果使用 MySQL）：
   ```prisma
   datasource db {
     provider = "mysql"  // 或 "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

### 4. 🚀 首次部署后的数据库迁移

部署成功后，需要初始化数据库表结构：

**方法 1：使用 Vercel CLI（推荐）**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 运行数据库迁移
vercel env pull .env.local  # 拉取环境变量
npx prisma db push
```

**方法 2：在 Vercel 项目设置中添加构建后命令**

在 Vercel 项目设置中，可以添加一个部署钩子或使用 Vercel 的 Post Deploy Script。

**方法 3：手动执行（最简单）**

1. 在本地拉取环境变量：
   ```bash
   vercel env pull .env.local
   ```

2. 运行迁移：
   ```bash
   npx prisma db push
   ```

### 5. ✅ 部署检查清单

部署前确认：
- [ ] 已添加 `JWT_SECRET` 环境变量
- [ ] 已创建 Vercel Postgres 数据库（如果使用）
- [ ] 已修改 `prisma/schema.prisma` 的 provider（如果使用 Postgres）
- [ ] 已提交并推送代码到 GitHub

部署后确认：
- [ ] 访问部署的 URL，检查是否正常
- [ ] 检查 Vercel 部署日志，确认没有错误
- [ ] 运行数据库迁移（`prisma db push`）
- [ ] 测试注册和登录功能
- [ ] 设置第一个管理员账号

### 6. 🔐 设置管理员账号

部署成功后，需要设置第一个管理员：

```bash
# 在本地运行（需要先拉取环境变量）
vercel env pull .env.local
npm run set-admin <你的用户名>
```

或者通过 Vercel CLI 远程执行（需要配置）。

---

## 📝 快速部署步骤总结

1. ✅ **代码已准备好**（已添加 postinstall 脚本）
2. 🔧 **在 Vercel 配置页面**：
   - 添加 `JWT_SECRET` 环境变量
   - 创建 Vercel Postgres 数据库（推荐）
3. 📝 **修改代码**（如果使用 Postgres）：
   - 修改 `prisma/schema.prisma` 的 provider 为 `postgresql`
   - 提交并推送代码
4. 🚀 **部署**：
   - Vercel 会自动部署
   - 部署成功后运行 `prisma db push` 初始化数据库
5. ✅ **测试**：
   - 访问部署的 URL
   - 注册账号并设置为管理员

---

## ❓ 常见问题

### Q: 为什么不能直接导入 .env 文件？

`.env` 文件包含本地开发配置（SQLite），而生产环境需要不同的配置（Postgres）。直接导入会导致配置冲突。

### Q: 部署后数据库是空的吗？

是的，首次部署后数据库是空的。需要：
1. 运行 `prisma db push` 创建表结构
2. 注册第一个用户
3. 设置为管理员

### Q: 如何查看部署日志？

在 Vercel 项目页面，点击 "Deployments" → 选择部署 → 查看 "Build Logs" 和 "Function Logs"。

### Q: 如何回滚部署？

在 Vercel 项目页面，点击 "Deployments" → 选择之前的部署 → 点击 "..." → "Promote to Production"。

