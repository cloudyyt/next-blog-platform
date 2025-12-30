import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../lib/auth"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 开始创建测试数据...")

  // 1. 创建管理员用户（博主）
  console.log("📝 创建用户...")
  const adminPassword = await hashPassword("admin123")
  const admin = await prisma.user.upsert({
    where: { name: "博主" },
    update: {},
    create: {
      name: "博主",
      password: adminPassword,
      role: "admin",
    },
  })
  console.log("✅ 用户创建成功:", admin.name)

  // 2. 创建分类
  console.log("📁 创建分类...")
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "react-learning" },
      update: {},
      create: {
        name: "React学习",
        slug: "react-learning",
        description: "React 框架相关文章",
      },
    }),
    prisma.category.upsert({
      where: { slug: "frontend-engineering" },
      update: {},
      create: {
        name: "前端工程化",
        slug: "frontend-engineering",
        description: "前端工程化实践",
      },
    }),
    prisma.category.upsert({
      where: { slug: "network-basics" },
      update: {},
      create: {
        name: "网络基础",
        slug: "network-basics",
        description: "计算机网络基础知识",
      },
    }),
  ])
  console.log("✅ 分类创建成功:", categories.length, "个")

  // 3. 创建标签
  console.log("🏷️ 创建标签...")
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "react" },
      update: {},
      create: { name: "React", slug: "react" },
    }),
    prisma.tag.upsert({
      where: { slug: "vue3" },
      update: {},
      create: { name: "Vue3", slug: "vue3" },
    }),
    prisma.tag.upsert({
      where: { slug: "nextjs" },
      update: {},
      create: { name: "Next.js", slug: "nextjs" },
    }),
    prisma.tag.upsert({
      where: { slug: "typescript" },
      update: {},
      create: { name: "TypeScript", slug: "typescript" },
    }),
    prisma.tag.upsert({
      where: { slug: "frontend-engineering" },
      update: {},
      create: { name: "前端工程化", slug: "frontend-engineering" },
    }),
    prisma.tag.upsert({
      where: { slug: "network-basics" },
      update: {},
      create: { name: "网络基础", slug: "network-basics" },
    }),
    prisma.tag.upsert({
      where: { slug: "vanilla-js" },
      update: {},
      create: { name: "原生JavaScript", slug: "vanilla-js" },
    }),
  ])
  console.log("✅ 标签创建成功:", tags.length, "个")

  // 4. 创建文章
  console.log("📄 创建文章...")
  
  const reactTag = tags.find(t => t.slug === "react")!
  const tsTag = tags.find(t => t.slug === "typescript")!
  const nextjsTag = tags.find(t => t.slug === "nextjs")!
  const feTag = tags.find(t => t.slug === "frontend-engineering")!
  const networkTag = tags.find(t => t.slug === "network-basics")!
  
  const post1 = await prisma.post.upsert({
    where: { slug: "learning-react-from-hooks-part-1" },
    update: {},
    create: {
      title: "从React hooks学习React系列 (一)",
      slug: "learning-react-from-hooks-part-1",
      content: `# 从React hooks学习React系列 (一)

个人觉得hook的学习是一个很好的React框架学习切入点，通过理解基本使用、常见使用场景来逐渐掌握框架脉络。

## 为什么从Hooks开始？

React Hooks 是 React 16.8 引入的新特性，它让我们可以在函数组件中使用状态和其他 React 特性。学习 Hooks 有以下几个优势：

1. **函数式编程思维**：Hooks 鼓励使用函数组件，代码更简洁
2. **逻辑复用**：自定义 Hooks 可以轻松复用状态逻辑
3. **更好的性能**：函数组件通常比类组件性能更好
4. **未来趋势**：React 团队推荐使用 Hooks

## useState - 状态管理的基础

\`useState\` 是 React 中最基础的 Hook，用于在函数组件中添加状态。

### 基本用法

\`\`\`tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        点击增加
      </button>
    </div>
  );
}
\`\`\`

### 使用场景

- 表单输入
- 开关状态
- 计数器
- 任何需要响应式更新的数据

## useEffect - 副作用处理

\`useEffect\` 用于处理副作用，如数据获取、订阅、手动 DOM 操作等。

### 基本用法

\`\`\`tsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 组件挂载或 userId 变化时执行
    fetchUser(userId).then(setUser);
  }, [userId]); // 依赖数组

  return <div>{user?.name}</div>;
}
\`\`\`

## 总结

通过理解 \`useState\` 和 \`useEffect\`，我们已经掌握了 React Hooks 的基础。这两个 Hook 是构建 React 函数组件的基石。

提示:实践是最好的老师,建议多写代码来加深理解。`,
      excerpt: "从 React Hooks 开始学习 React，理解 useState 和 useEffect 的基本用法和使用场景。",
      published: true,
      authorId: admin.id,
      categories: {
        connect: [{ id: categories[0].id }],
      },
      tags: {
        connect: [reactTag.id, tsTag.id].map(id => ({ id })),
      },
    },
  })

  const post2 = await prisma.post.upsert({
    where: { slug: "understanding-http-protocol" },
    update: {},
    create: {
      title: "深入理解 HTTP 协议",
      slug: "understanding-http-protocol",
      content: `# 深入理解 HTTP 协议

HTTP（HyperText Transfer Protocol）是互联网上应用最广泛的网络协议之一。

## HTTP 基础

HTTP 是一个**无状态**的协议，每个请求都是独立的，服务器不会记住之前的请求。

### HTTP 请求方法

- **GET**: 获取资源
- **POST**: 创建资源
- **PUT**: 更新资源
- **DELETE**: 删除资源
- **PATCH**: 部分更新资源

### HTTP 状态码

- **200**: 成功
- **404**: 未找到
- **500**: 服务器错误
- **301**: 永久重定向

## HTTPS 与安全

HTTPS 是 HTTP 的安全版本，通过 TLS/SSL 加密传输数据。

## 总结

理解 HTTP 协议对于前端开发至关重要，它帮助我们更好地理解网络请求和响应。`,
      excerpt: "深入理解 HTTP 协议的基本概念、请求方法、状态码以及 HTTPS 安全机制。",
      published: true,
      authorId: admin.id,
      categories: {
        connect: [{ id: categories[2].id }],
      },
      tags: {
        connect: [{ id: networkTag.id }],
      },
    },
  })

  const post3 = await prisma.post.upsert({
    where: { slug: "modern-frontend-build-tools" },
    update: {},
    create: {
      title: "现代前端构建工具对比",
      slug: "modern-frontend-build-tools",
      content: `# 现代前端构建工具对比

前端构建工具的发展经历了从 Grunt、Gulp 到 Webpack、Vite 的演进。

## Webpack

Webpack 是目前最流行的模块打包器，功能强大但配置复杂。

### 特点

- 支持多种模块格式
- 强大的插件系统
- 代码分割和懒加载
- 热模块替换（HMR）

## Vite

Vite 是新一代的前端构建工具，由 Vue 作者尤雨溪开发。

### 特点

- 极速的开发服务器启动
- 基于 ES 模块的构建
- 原生支持 TypeScript
- 开箱即用的优化

## 选择建议

- **大型项目**: 选择 Webpack（生态成熟）
- **新项目**: 选择 Vite（开发体验更好）
- **React 项目**: 两者都支持，根据团队熟悉度选择

## 总结

选择合适的构建工具可以大大提升开发效率和项目性能。`,
      excerpt: "对比 Webpack 和 Vite 等现代前端构建工具的特点和适用场景。",
      published: true,
      authorId: admin.id,
      categories: {
        connect: [{ id: categories[1].id }],
      },
      tags: {
        connect: [feTag.id, nextjsTag.id].map(id => ({ id })),
      },
    },
  })

  const post4 = await prisma.post.upsert({
    where: { slug: "typescript-best-practices" },
    update: {},
    create: {
      title: "TypeScript 最佳实践",
      slug: "typescript-best-practices",
      content: `# TypeScript 最佳实践

TypeScript 为 JavaScript 添加了类型系统，让代码更加健壮和可维护。

## 类型定义

### 基础类型

\`\`\`typescript
let name: string = "John"
let age: number = 30
let isActive: boolean = true
\`\`\`

### 接口和类型别名

\`\`\`typescript
interface User {
  id: number
  name: string
  email?: string // 可选属性
}

type Status = "pending" | "approved" | "rejected"
\`\`\`

## 最佳实践

1. **严格模式**: 启用 \`strict: true\`
2. **避免使用 \`any\`**: 尽量使用具体类型
3. **利用类型推断**: 让 TypeScript 自动推断类型
4. **使用泛型**: 提高代码复用性

## 总结

TypeScript 的类型系统可以帮助我们在开发阶段发现错误，提高代码质量。`,
      excerpt: "学习 TypeScript 的类型定义、接口使用和最佳实践，提升代码质量。",
      published: true,
      authorId: admin.id,
      categories: {
        connect: [{ id: categories[0].id }],
      },
      tags: {
        connect: [tsTag.id, reactTag.id].map(id => ({ id })),
      },
    },
  })

  console.log("✅ 文章创建成功:", 4, "篇")

  // 5. 创建一些测试用户和评论
  console.log("💬 创建测试用户和评论...")
  
  const testUserPassword = await hashPassword("test123")
  const testUser = await prisma.user.upsert({
    where: { name: "测试用户" },
    update: {},
    create: {
      name: "测试用户",
      password: testUserPassword,
      role: "user",
    },
  })

  // 为第一篇文章创建评论
  await prisma.comment.create({
    data: {
      content: "这篇文章写得很好，让我对 React Hooks 有了更深入的理解！",
      postId: post1.id,
      authorId: testUser.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: "感谢分享，useEffect 的依赖数组确实容易出错，需要仔细理解。",
      postId: post1.id,
      authorId: admin.id,
    },
  })

  console.log("✅ 评论创建成功")

  console.log("\n🎉 测试数据创建完成！")
  console.log("\n📊 数据统计:")
  console.log(`   - 用户: 2 个 (1 个管理员, 1 个普通用户)`)
  console.log(`   - 分类: ${categories.length} 个`)
  console.log(`   - 标签: ${tags.length} 个`)
  console.log(`   - 文章: 4 篇`)
  console.log(`   - 评论: 2 条`)
  console.log("\n🔑 测试账号:")
  console.log(`   管理员: 博主 / admin123`)
  console.log(`   普通用户: 测试用户 / test123`)
}

main()
  .catch((e) => {
    console.error("❌ 创建测试数据失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
