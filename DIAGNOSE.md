# 诊断和修复指南

## 当前状态
- ✅ 数据库已同步（`pnpm prisma db push` 成功）
- ✅ 所有函数已正确部署
- ❌ 网页仍然无法打开（连接超时）

## 诊断步骤

### 1. 测试基础 API

在浏览器中访问：
```
https://你的域名.vercel.app/api
```

如果返回 JSON（包含环境变量信息），说明服务器正常；如果超时，说明服务器有问题。

### 2. 检查生产部署的 Function Logs

在 Vercel Dashboard：
1. 进入 Deployments → 找到生产部署（标记为 "Production Current"）
2. 点击 "Functions" 标签
3. 查看 `/api` 或 `/blog` 的日志
4. 检查是否有错误：
   - `PRISMA_DATABASE_URL is not set`
   - `数据库连接超时`
   - 其他 Prisma 错误

### 3. 确认环境变量配置

在 Vercel Dashboard → Settings → Environment Variables：
1. 确认 `PRISMA_DATABASE_URL` 存在
2. **重要**：点击 `PRISMA_DATABASE_URL`，确认 "Environment" 选择了：
   - ✅ Production
   - ✅ Preview
   - ✅ Development

3. 确认 `JWT_SECRET` 也选择了所有环境

### 4. 检查生产部署的代码版本

在 Vercel Dashboard → Deployments → 生产部署：
1. 查看 "Source" 部分
2. 确认提交信息是最新的（包含 "使用 PRISMA_DATABASE_URL" 或类似信息）
3. 如果不是最新代码，需要重新部署

### 5. 重新部署生产环境

如果生产部署使用的是旧代码：
1. 在 Deployments 中找到生产部署
2. 点击 "..." → "Redeploy"
3. 等待部署完成

## 可能的问题和解决方案

### 问题 1：环境变量未配置到生产环境

**症状**：预览部署正常，但生产部署超时

**解决方案**：
1. 进入 Settings → Environment Variables
2. 编辑 `PRISMA_DATABASE_URL`
3. 确保选择了 "Production" 环境
4. 保存并重新部署

### 问题 2：生产部署使用旧代码

**症状**：代码已更新，但生产部署仍使用旧版本

**解决方案**：
1. 确认代码已推送到 GitHub
2. 在 Deployments 中重新部署生产环境
3. 或等待自动部署完成

### 问题 3：服务器启动失败

**症状**：所有请求都超时

**解决方案**：
1. 检查 Function Logs 中的启动错误
2. 确认环境变量正确配置
3. 确认数据库已连接到项目

## 快速测试命令

```bash
# 测试数据库连接
pnpm prisma db push --skip-generate

# 检查环境变量
grep PRISMA_DATABASE_URL .env.local

# 检查 Prisma schema
grep PRISMA_DATABASE_URL prisma/schema.prisma
```

## 下一步

1. 访问 `https://你的域名.vercel.app/api` 测试基础 API
2. 检查生产部署的 Function Logs
3. 确认环境变量选择了所有环境
4. 如果问题仍然存在，提供 Function Logs 中的具体错误信息
