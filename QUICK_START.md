# 快速启动指南

## 方案一：使用本地 MySQL（推荐，如果 MySQL 已安装）

### 1. 检查并启动 MySQL 服务

```bash
# 检查 MySQL 服务状态
brew services list | grep mysql

# 如果未运行，启动 MySQL
brew services start mysql

# 或者使用 mysqld_safe 启动
mysql.server start
```

### 2. 创建数据库和用户

```bash
# 登录 MySQL（可能需要输入 root 密码）
mysql -u root -p
```

在 MySQL 命令行中执行：

```sql
-- 创建数据库
CREATE DATABASE blog_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选，也可以直接用 root）
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'blog_password';
GRANT ALL PRIVILEGES ON blog_platform.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 3. 配置 .env 文件

创建 `.env` 文件：

```env
# 如果使用 root 用户
DATABASE_URL="mysql://root:你的root密码@localhost:3306/blog_platform?schema=public"

# 或者使用新创建的用户
DATABASE_URL="mysql://blog_user:blog_password@localhost:3306/blog_platform?schema=public"

JWT_SECRET="your-secret-key-change-in-production"
```

### 4. 初始化数据库

```bash
npm run db:generate
npm run db:push
```

---

## 方案二：临时使用 SQLite（最快，无需配置）

如果想**立即看到效果**，可以临时切换到 SQLite：

### 1. 修改 prisma/schema.prisma

将：
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

改为：
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. 初始化数据库

```bash
npm run db:generate
npm run db:push
```

### 3. 启动开发服务器

```bash
npm run dev
```

**注意**：SQLite 是临时方案，后续可以轻松切换回 MySQL。

---

## 推荐流程

1. **先尝试方案一**（本地 MySQL）- 如果 MySQL 服务正在运行
2. **如果方案一有问题，用方案二**（SQLite）- 先看到效果，后续再切换

