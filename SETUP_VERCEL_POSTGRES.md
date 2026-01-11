# Vercel Postgres 配置指南

## 目标
本地和线上都使用同一个 Vercel Postgres 数据库。

## ✅ 重要更新
代码已更新为使用 `PRISMA_DATABASE_URL`（Vercel Postgres 自动提供），**无需手动配置 `DATABASE_URL`**！

## 步骤 1：确认数据库已连接

1. **检查数据库连接**：
   - 进入 Vercel Dashboard → 你的项目
   - 点击 "Storage" 标签
   - 确认 `blog-platform-database` 已连接到项目
   - 查看 "Connection Info"，应该能看到 `PRISMA_DATABASE_URL` 和 `POSTGRES_URL`

2. **确认环境变量**：
   - 进入 Settings → Environment Variables
   - 确认能看到 `PRISMA_DATABASE_URL`（Vercel 自动创建）
   - 确认能看到 `JWT_SECRET`（需要手动添加）

## 步骤 2：配置本地环境

### 方法 A：使用 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 链接项目（如果还没链接）
cd /Users/liaozijie/Desktop/code/blog-platform
vercel link

# 4. 拉取环境变量到本地
vercel env pull .env.local

# 5. 初始化数据库表结构
pnpm prisma db push
```

### 方法 B：手动配置（如果 CLI 不可用）

1. 在 Vercel Dashboard → Storage → 你的数据库 → Connection Info
2. 复制 `PRISMA_DATABASE_URL` 的值（点击 "Show secret" 查看）
3. 在项目根目录创建 `.env.local` 文件：
   ```env
   PRISMA_DATABASE_URL="粘贴你复制的 PRISMA_DATABASE_URL 值"
   JWT_SECRET="c1d4f3f8133d8f988eaf6998a0b0e7fcdaa51c8b0ac57a9748c8b8d2888a5a08"
   ```
4. 运行数据库迁移：
   ```bash
   pnpm prisma db push
   ```

## 步骤 3：重新部署 Vercel

1. 在 Vercel Dashboard → Deployments
2. 点击最新部署右侧的 "..." → Redeploy
3. 等待部署完成

## 步骤 4：验证

1. **本地验证**：
   ```bash
   pnpm dev
   ```
   访问 http://localhost:3000/blog，应该能正常显示

2. **线上验证**：
   - 访问 `https://你的域名.vercel.app/api` - 应该返回 JSON
   - 访问 `https://你的域名.vercel.app/blog` - 应该正常显示
   - 检查 Function Logs，确认没有数据库连接错误

## 常见问题

### Q: 为什么使用 PRISMA_DATABASE_URL 而不是 DATABASE_URL？
A: Vercel Postgres 自动提供 `PRISMA_DATABASE_URL`，这是专门为 Prisma 优化的连接字符串。使用它可以避免手动配置环境变量。

### Q: 本地和线上使用同一个数据库安全吗？
A: 对于开发阶段是可以的。生产环境建议使用单独的数据库。

### Q: 数据库表会自动创建吗？
A: 不会。需要手动运行 `pnpm prisma db push` 来创建表结构。只需要运行一次。

## 检查清单

- [ ] 确认 Vercel Postgres 数据库已连接到项目
- [ ] 确认 `PRISMA_DATABASE_URL` 环境变量存在（Vercel 自动创建）
- [ ] 确认 `JWT_SECRET` 环境变量存在（需要手动添加）
- [ ] 使用 Vercel CLI 拉取了环境变量到本地（或手动创建了 `.env.local`）
- [ ] 运行了 `pnpm prisma db push` 初始化数据库表
- [ ] 提交了代码更改（Prisma schema 已更新为使用 `PRISMA_DATABASE_URL`）
- [ ] 重新部署了 Vercel 项目
- [ ] 验证了本地和线上都能正常访问
