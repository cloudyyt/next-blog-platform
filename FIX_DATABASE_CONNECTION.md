# 修复数据库连接超时问题

## 问题诊断

从日志看，数据库连接仍然超时。可能的原因：
1. 部署的代码还是旧版本（使用 `DATABASE_URL` 而不是 `PRISMA_DATABASE_URL`）
2. Vercel 环境变量中 `PRISMA_DATABASE_URL` 未正确配置
3. 数据库表还没有创建

## 立即操作步骤

### 步骤 1：确认代码已提交并推送

```bash
# 检查当前更改
git status

# 提交所有更改
git add .
git commit -m "使用 PRISMA_DATABASE_URL 并优化 Prisma 生成"

# 推送到 GitHub
git push
```

### 步骤 2：在 Vercel Dashboard 检查环境变量

1. **进入 Vercel Dashboard** → 你的项目 → Settings → Environment Variables
2. **确认以下环境变量存在**：
   - `PRISMA_DATABASE_URL`（Vercel Postgres 自动创建，应该存在）
   - `JWT_SECRET`（需要手动添加，如果还没有）

3. **如果 `PRISMA_DATABASE_URL` 不存在**：
   - 进入 Storage → 你的数据库 → Connection Info
   - 点击 "Show secret" 查看 `PRISMA_DATABASE_URL`
   - 复制这个值
   - 在 Environment Variables 中手动添加：
     - Key: `PRISMA_DATABASE_URL`
     - Value: 粘贴复制的值
     - Environment: 选择所有环境（Production、Preview、Development）

### 步骤 3：重新部署

1. 在 Vercel Dashboard → Deployments
2. 等待自动部署完成（推送代码后会自动触发）
3. 或手动点击最新部署右侧的 "..." → Redeploy

### 步骤 4：初始化数据库表（重要！）

数据库连接成功后，需要创建表结构。在本地运行：

```bash
# 1. 确保已安装并登录 Vercel CLI
npm i -g vercel
vercel login

# 2. 链接项目（如果还没链接）
vercel link

# 3. 拉取环境变量到本地
vercel env pull .env.local

# 4. 初始化数据库表结构（只需要运行一次）
pnpm prisma db push
```

**注意**：`pnpm prisma db push` 会使用 `.env.local` 中的 `PRISMA_DATABASE_URL` 连接到 Vercel Postgres 并创建表结构。

### 步骤 5：验证

1. **检查 Vercel Function Logs**：
   - 进入 Deployments → 最新部署 → Functions
   - 查看是否有 `PRISMA_DATABASE_URL is not set` 的错误
   - 如果没有这个错误，说明环境变量配置正确

2. **测试 API**：
   - 访问 `https://你的域名.vercel.app/api/blog/posts`
   - 应该返回 JSON（可能为空数组，但不应超时）

3. **测试页面**：
   - 访问 `https://你的域名.vercel.app/blog`
   - 应该正常显示（即使没有数据）

## 常见问题排查

### Q: 为什么还是连接超时？

**检查清单**：
- [ ] 代码已提交并推送到 GitHub
- [ ] Vercel 已重新部署（查看 Deployments 中的最新部署时间）
- [ ] `PRISMA_DATABASE_URL` 环境变量存在于 Vercel
- [ ] 已运行 `pnpm prisma db push` 初始化数据库表
- [ ] 数据库已连接到项目（Storage → 你的数据库 → Connected Projects）

### Q: 如何确认环境变量是否正确？

在 Vercel Function Logs 中查看：
- 如果有 `PRISMA_DATABASE_URL is not set` 错误 → 环境变量未配置
- 如果有 `Can't reach database server` 错误 → 连接字符串可能不正确
- 如果有 `relation "users" does not exist` 错误 → 数据库表未创建，需要运行 `pnpm prisma db push`

### Q: 本地如何测试？

```bash
# 1. 拉取环境变量
vercel env pull .env.local

# 2. 启动开发服务器
pnpm dev

# 3. 访问 http://localhost:3000/blog
```

## 快速检查命令

```bash
# 检查 .env.local 文件是否存在 PRISMA_DATABASE_URL
grep PRISMA_DATABASE_URL .env.local

# 检查 Prisma schema 是否使用 PRISMA_DATABASE_URL
grep PRISMA_DATABASE_URL prisma/schema.prisma

# 测试数据库连接（需要先拉取环境变量）
pnpm prisma db push --skip-generate
```

## 如果问题仍然存在

1. **检查 Vercel Function Logs** 中的具体错误信息
2. **确认数据库区域**：在 Storage → 你的数据库 → Settings，确认区域是 `hkg1`（与 vercel.json 中的 regions 一致）
3. **尝试重新连接数据库**：在 Storage → 你的数据库 → Settings → Disconnect，然后重新连接
