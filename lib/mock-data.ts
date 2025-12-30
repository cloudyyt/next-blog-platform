/**
 * Mock 数据
 * 用于开发和测试，后续会替换为真实 API 调用
 */

import { BlogPost, Tag, Category, AuthorInfo, BlogConfig } from "./types/blog"

export const mockAuthor: AuthorInfo = {
  id: "author-1",
  name: "博主",
  email: "blogger@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blogger",
  bio: "一个热爱技术、喜欢分享的前端开发者。专注于 React、Vue、Next.js 等技术栈。",
  socialLinks: {
    github: "https://github.com/example",
    twitter: "https://twitter.com/example",
    website: "https://example.com",
  },
  postCount: 12,
}

export const mockBlogConfig: BlogConfig = {
  siteName: "技术博客",
  siteDescription: "分享前端开发经验和技术思考",
  author: mockAuthor,
}

export const mockTags: Tag[] = [
  { id: "tag-1", name: "React", slug: "react", postCount: 5 },
  { id: "tag-2", name: "Vue3", slug: "vue3", postCount: 3 },
  { id: "tag-3", name: "Next.js", slug: "nextjs", postCount: 4 },
  { id: "tag-4", name: "TypeScript", slug: "typescript", postCount: 6 },
  { id: "tag-5", name: "前端工程化", slug: "frontend-engineering", postCount: 2 },
  { id: "tag-6", name: "网络基础", slug: "network-basics", postCount: 3 },
  { id: "tag-7", name: "原生JavaScript", slug: "vanilla-js", postCount: 2 },
]

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "React学习",
    slug: "react-learning",
    description: "React 框架相关文章",
    postCount: 5,
  },
  {
    id: "cat-2",
    name: "前端工程化",
    slug: "frontend-engineering",
    description: "前端工程化实践",
    postCount: 2,
  },
  {
    id: "cat-3",
    name: "网络基础",
    slug: "network-basics",
    description: "计算机网络基础知识",
    postCount: 3,
  },
]

export const mockPosts: BlogPost[] = [
  {
    id: "post-1",
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

### 函数式更新

当新的状态依赖于旧状态时，应该使用函数式更新：

\`\`\`tsx
const [count, setCount] = useState(0);

// ❌ 不推荐：可能因为闭包导致问题
setCount(count + 1);

// ✅ 推荐：使用函数式更新
setCount(prevCount => prevCount + 1);
\`\`\`

## useEffect - 副作用处理

\`useEffect\` 用于处理副作用，比如数据获取、订阅、手动修改 DOM 等。

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

### 清理副作用

某些副作用需要清理，比如取消订阅、清除定时器等：

\`\`\`tsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log('定时器执行');
  }, 1000);

  // 清理函数
  return () => {
    clearInterval(timer);
  };
}, []);
\`\`\`

## 自定义Hooks

自定义 Hooks 让我们可以提取组件逻辑到可复用的函数中。

### 示例：useFetch

\`\`\`tsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// 使用
function UserList() {
  const { data, loading, error } = useFetch('/api/users');
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return <ul>{data?.map(user => <li key={user.id}>{user.name}</li>)}</ul>;
}
\`\`\`

## 常见陷阱和最佳实践

### 1. 依赖数组要完整

\`\`\`tsx
// ❌ 缺少依赖
useEffect(() => {
  fetchData(userId);
}, []); // 应该包含 userId

// ✅ 正确
useEffect(() => {
  fetchData(userId);
}, [userId]);
\`\`\`

### 2. 避免在循环中使用Hooks

Hooks 必须在组件的顶层调用，不能在循环、条件或嵌套函数中调用。

### 3. 使用 useCallback 和 useMemo 优化性能

\`\`\`tsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

const memoizedValue = useMemo(() => {
  return expensiveComputation(a, b);
}, [a, b]);
\`\`\`

## 总结

通过理解 \`useState\` 和 \`useEffect\` 这两个最基础的 Hooks，我们已经掌握了 React 函数组件的核心概念。下一篇文章我们将深入探讨其他常用的 Hooks，如 \`useContext\`、\`useReducer\` 等。

> **提示**：实践是最好的老师，建议多写代码来加深理解。`,
    excerpt: "个人觉得hook的学习是一个很好的React框架学习切入点,通过理解基本使用、常见使用场景来逐渐掌握框架脉络。",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    published: true,
    authorId: "author-1",
    author: {
      id: "author-1",
      name: "博主",
      email: "blogger@example.com",
    },
    categories: [
      { id: "cat-1", name: "React学习", slug: "react-learning" },
    ],
    tags: [
      { id: "tag-1", name: "React", slug: "react" },
      { id: "tag-4", name: "TypeScript", slug: "typescript" },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "post-2",
    title: "三次握手和四次挥手",
    slug: "three-way-handshake-and-four-way-wavehand",
    content: `# 三次握手和四次挥手

三次握手和四次挥手是TCP连接建立和关闭的过程，确保了数据传输的可靠性和完整性。理解这个过程对于理解网络通信原理非常重要。

## TCP连接的特点

TCP（Transmission Control Protocol）是一种面向连接的、可靠的传输层协议。它具有以下特点：

- **面向连接**：通信前需要建立连接
- **可靠传输**：保证数据按序到达
- **流量控制**：防止发送方发送数据过快
- **拥塞控制**：防止网络拥塞

## 三次握手 - 建立连接

三次握手是TCP建立连接的过程，确保客户端和服务器都准备好进行数据传输。

### 过程详解

1. **第一次握手（SYN）**
   - 客户端发送 SYN 包（SYN=1, seq=x）到服务器
   - 客户端进入 SYN_SENT 状态
   - 表示：客户端想要建立连接

2. **第二次握手（SYN-ACK）**
   - 服务器收到 SYN 包，发送 SYN-ACK 包（SYN=1, ACK=1, seq=y, ack=x+1）
   - 服务器进入 SYN_RCVD 状态
   - 表示：服务器同意建立连接，并确认收到客户端的请求

3. **第三次握手（ACK）**
   - 客户端收到 SYN-ACK 包，发送 ACK 包（ACK=1, seq=x+1, ack=y+1）
   - 客户端和服务器都进入 ESTABLISHED 状态
   - 表示：客户端确认收到服务器的响应，连接建立成功

### 为什么是三次？

> 三次握手是为了确保双方都能正常收发数据。如果只有两次握手，服务器无法确认客户端是否收到了自己的响应。

**两次握手的问题**：
- 如果客户端的 SYN 包在网络中滞留，客户端可能会重发
- 服务器无法区分这是新的连接请求还是旧的滞留包
- 可能导致资源浪费和连接混乱

## 四次挥手 - 关闭连接

四次挥手是TCP关闭连接的过程，确保双方都完成数据传输。

### 过程详解

1. **第一次挥手（FIN）**
   - 客户端发送 FIN 包（FIN=1, seq=u）到服务器
   - 客户端进入 FIN_WAIT_1 状态
   - 表示：客户端没有数据要发送了，想要关闭连接

2. **第二次挥手（ACK）**
   - 服务器收到 FIN 包，发送 ACK 包（ACK=1, seq=v, ack=u+1）
   - 服务器进入 CLOSE_WAIT 状态
   - 表示：服务器确认收到关闭请求，但可能还有数据要发送

3. **第三次挥手（FIN）**
   - 服务器发送完剩余数据后，发送 FIN 包（FIN=1, ACK=1, seq=w, ack=u+1）
   - 服务器进入 LAST_ACK 状态
   - 表示：服务器也没有数据要发送了，准备关闭连接

4. **第四次挥手（ACK）**
   - 客户端收到 FIN 包，发送 ACK 包（ACK=1, seq=u+1, ack=w+1）
   - 客户端进入 TIME_WAIT 状态，等待 2MSL 后关闭
   - 服务器收到 ACK 后立即关闭连接

### 为什么是四次？

关闭连接时，服务器收到客户端的 FIN 后，可能还有数据要发送，所以先发送 ACK 确认，等数据发送完毕后再发送 FIN。因此需要四次挥手。

### TIME_WAIT 状态

客户端在发送最后一个 ACK 后会进入 TIME_WAIT 状态，等待 2MSL（Maximum Segment Lifetime）时间后才关闭。

**原因**：
- 确保最后一个 ACK 能够到达服务器
- 如果服务器没收到 ACK，会重发 FIN，客户端可以再次响应
- 防止"已失效的连接请求报文段"出现在本连接中

## 状态转换图

### 三次握手状态

\`\`\`
客户端: CLOSED -> SYN_SENT -> ESTABLISHED
服务器: CLOSED -> LISTEN -> SYN_RCVD -> ESTABLISHED
\`\`\`

### 四次挥手状态

\`\`\`
客户端: ESTABLISHED -> FIN_WAIT_1 -> FIN_WAIT_2 -> TIME_WAIT -> CLOSED
服务器: ESTABLISHED -> CLOSE_WAIT -> LAST_ACK -> CLOSED
\`\`\`

## 实际应用

理解三次握手和四次挥手有助于：

1. **网络调试**：使用 \`netstat\` 或 \`ss\` 命令查看连接状态
2. **性能优化**：理解连接建立和关闭的开销
3. **问题排查**：识别连接异常的原因

### 查看TCP连接状态

\`\`\`bash
# Linux/Mac
netstat -an | grep ESTABLISHED
ss -tan state established

# 查看TIME_WAIT状态的连接
netstat -an | grep TIME_WAIT
\`\`\`

## 总结

- **三次握手**：确保双方都能正常收发数据，建立可靠连接
- **四次挥手**：确保双方都完成数据传输，优雅关闭连接
- **TIME_WAIT**：防止旧连接的数据包影响新连接

理解这些过程对于深入理解网络通信和排查网络问题都非常有帮助。`,
    excerpt: "三次握手和四次挥手是TCP连接建立和关闭的过程,确保了数据传输的可靠性和完整性。",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    published: true,
    authorId: "author-1",
    author: {
      id: "author-1",
      name: "博主",
      email: "blogger@example.com",
    },
    categories: [
      { id: "cat-3", name: "网络基础", slug: "network-basics" },
    ],
    tags: [
      { id: "tag-6", name: "网络基础", slug: "network-basics" },
    ],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "post-3",
    title: "TCP和UDP有何区别",
    slug: "difference-between-tcp-and-udp",
    content: `# TCP和UDP有何区别

TCP（传输控制协议）和UDP（用户数据报协议）是两种常见的传输层协议，它们在网络通信中扮演着重要的角色。理解它们的区别对于选择合适的协议非常重要。

## 基本概念

### TCP (Transmission Control Protocol)

TCP 是一种**面向连接的、可靠的**传输层协议。它提供：

- 可靠的数据传输
- 有序的数据交付
- 流量控制和拥塞控制
- 全双工通信

### UDP (User Datagram Protocol)

UDP 是一种**无连接的、不可靠的**传输层协议。它提供：

- 快速的数据传输
- 低延迟
- 无连接开销
- 简单的协议实现

## 核心区别对比

| 特性 | TCP | UDP |
|------|-----|-----|
| **连接性** | 面向连接 | 无连接 |
| **可靠性** | 可靠传输 | 不可靠传输 |
| **有序性** | 保证数据有序 | 不保证有序 |
| **速度** | 较慢 | 较快 |
| **开销** | 较大 | 较小 |
| **适用场景** | 需要可靠传输 | 需要快速传输 |

## 详细对比

### 1. 连接方式

**TCP - 面向连接**

\`\`\`
客户端 <--三次握手--> 服务器
      <--数据传输-->
      <--四次挥手-->
\`\`\`

TCP 在传输数据前需要先建立连接，传输完成后需要关闭连接。

**UDP - 无连接**

\`\`\`
客户端 --数据包--> 服务器
客户端 --数据包--> 服务器
（无需建立连接）
\`\`\`

UDP 直接发送数据包，不需要建立连接。

### 2. 可靠性

**TCP 保证可靠性**：

- ✅ 数据确认机制（ACK）
- ✅ 超时重传
- ✅ 数据校验和
- ✅ 序列号保证有序

**UDP 不保证可靠性**：

- ❌ 无确认机制
- ❌ 无重传机制
- ✅ 有数据校验和（可选）
- ❌ 无序列号

### 3. 传输速度

**TCP 较慢的原因**：

1. 需要建立和关闭连接
2. 需要确认每个数据包
3. 需要重传丢失的数据
4. 流量控制和拥塞控制

**UDP 较快的原因**：

1. 无需建立连接
2. 无需确认机制
3. 无重传机制
4. 协议头部更小（8字节 vs 20字节）

### 4. 头部大小

**TCP 头部**：至少 20 字节

\`\`\`
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |           |U|A|P|R|S|F|                               |
| Offset| Reserved  |R|C|S|S|Y|I|            Window             |
|       |           |G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
\`\`\`

**UDP 头部**：固定 8 字节

\`\`\`
 0      7 8     15 16    23 24     31
+--------+--------+--------+--------+
|     Source      |   Destination   |
|      Port       |      Port        |
+--------+--------+--------+--------+
|                 |                 |
|     Length      |    Checksum     |
+--------+--------+--------+--------+
\`\`\`

## 应用场景

### TCP 适用场景

1. **Web 浏览**（HTTP/HTTPS）
   - 需要可靠传输网页内容
   - 不能丢失数据

2. **文件传输**（FTP）
   - 文件必须完整传输
   - 需要保证数据完整性

3. **邮件传输**（SMTP）
   - 邮件内容不能丢失
   - 需要可靠传输

4. **数据库连接**
   - 需要保证数据一致性
   - 不能丢失查询结果

### UDP 适用场景

1. **视频直播/流媒体**
   - 对延迟敏感
   - 丢失少量数据包可以接受
   - 例如：YouTube、Twitch

2. **在线游戏**
   - 需要低延迟
   - 实时性比可靠性更重要
   - 例如：FPS 游戏

3. **DNS 查询**
   - 查询简单快速
   - 如果失败可以重试
   - 不需要建立连接

4. **VoIP（语音通话）**
   - 对延迟敏感
   - 丢失少量数据包影响不大

## 代码示例

### TCP Socket (Node.js)

\`\`\`javascript
const net = require('net');

// 服务器
const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    console.log('收到数据:', data.toString());
    socket.write('服务器响应');
  });
});

server.listen(3000);

// 客户端
const client = net.createConnection({ port: 3000 }, () => {
  client.write('客户端消息');
});
\`\`\`

### UDP Socket (Node.js)

\`\`\`javascript
const dgram = require('dgram');

// 服务器
const server = dgram.createSocket('udp4');
server.on('message', (msg, rinfo) => {
  console.log('收到数据:', msg.toString());
  server.send('服务器响应', rinfo.port, rinfo.address);
});
server.bind(3000);

// 客户端
const client = dgram.createSocket('udp4');
client.send('客户端消息', 3000, 'localhost');
\`\`\`

## 如何选择？

选择 TCP 还是 UDP，主要考虑以下几点：

1. **是否需要可靠传输？**
   - 是 → TCP
   - 否 → UDP

2. **对延迟是否敏感？**
   - 是 → UDP
   - 否 → TCP

3. **数据量大小？**
   - 大 → TCP（可以分片传输）
   - 小 → UDP（开销小）

4. **是否需要有序传输？**
   - 是 → TCP
   - 否 → UDP

## 总结

- **TCP**：可靠、有序、面向连接，适合需要保证数据完整性的场景
- **UDP**：快速、低延迟、无连接，适合对实时性要求高的场景

在实际应用中，很多协议都是基于 TCP 或 UDP 构建的，比如 HTTP 基于 TCP，DNS 主要使用 UDP。理解它们的区别有助于我们做出更好的技术选择。`,
    excerpt: "TCP(传输控制协议)和UDP(用户数据报协议)是两种常见的传输层协议,它们在网络通信中扮演着重要的角色。以下是它们之间的主要区别:",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    published: true,
    authorId: "author-1",
    author: {
      id: "author-1",
      name: "博主",
      email: "blogger@example.com",
    },
    categories: [
      { id: "cat-3", name: "网络基础", slug: "network-basics" },
    ],
    tags: [
      { id: "tag-6", name: "网络基础", slug: "network-basics" },
    ],
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
  {
    id: "post-4",
    title: "Next.js 14 App Router 完全指南",
    slug: "nextjs-14-app-router-complete-guide",
    content: `# Next.js 14 App Router 完全指南

Next.js 14 引入了全新的 App Router，带来了更好的开发体验和性能优化。本文将深入探讨 App Router 的核心概念和最佳实践。

## 什么是 App Router？

App Router 是 Next.js 13+ 引入的新路由系统，基于 React Server Components 构建。它使用文件系统路由，但提供了更强大的功能和更好的性能。

### 与 Pages Router 的区别

| 特性 | Pages Router | App Router |
|------|--------------|------------|
| **文件位置** | \`pages/\` | \`app/\` |
| **布局** | \`_app.js\` | \`layout.tsx\` |
| **数据获取** | \`getServerSideProps\` | Server Components |
| **默认** | 客户端组件 | 服务器组件 |

## 核心概念

### 1. 文件系统路由

App Router 使用文件系统来定义路由：

\`\`\`
app/
├── page.tsx          → /
├── about/
│   └── page.tsx      → /about
├── blog/
│   ├── page.tsx      → /blog
│   └── [slug]/
│       └── page.tsx  → /blog/:slug
└── layout.tsx        → 根布局
\`\`\`

### 2. Server Components vs Client Components

**Server Components（默认）**

\`\`\`tsx
// app/components/ServerComponent.tsx
// 默认是 Server Component
export default function ServerComponent() {
  // 可以直接访问数据库、文件系统等
  const data = await fetchData();
  
  return <div>{data}</div>;
}
\`\`\`

**Client Components**

\`\`\`tsx
// app/components/ClientComponent.tsx
'use client'; // 必须添加这个指令

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      点击: {count}
    </button>
  );
}
\`\`\`

### 3. Layouts（布局）

Layout 组件可以共享 UI 和状态：

\`\`\`tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <header>导航栏</header>
        <main>{children}</main>
        <footer>页脚</footer>
      </body>
    </html>
  );
}
\`\`\`

### 4. Loading States（加载状态）

使用 \`loading.tsx\` 显示加载状态：

\`\`\`tsx
// app/blog/loading.tsx
export default function Loading() {
  return <div>加载中...</div>;
}
\`\`\`

### 5. Error Handling（错误处理）

使用 \`error.tsx\` 处理错误：

\`\`\`tsx
// app/blog/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>出错了！</h2>
      <button onClick={reset}>重试</button>
    </div>
  );
}
\`\`\`

## 数据获取

### Server Components 中的数据获取

\`\`\`tsx
// app/blog/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store', // 或 'force-cache'
  });
  return res.json();
}

export default async function BlogPage() {
  const posts = await getPosts();
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  );
}
\`\`\`

### 缓存策略

Next.js 提供了多种缓存策略：

\`\`\`tsx
// 不缓存（每次请求都获取新数据）
fetch(url, { cache: 'no-store' });

// 强制缓存（使用缓存的数据）
fetch(url, { cache: 'force-cache' });

// 重新验证（缓存但定期更新）
fetch(url, { next: { revalidate: 3600 } });
\`\`\`

## 路由组和并行路由

### 路由组 (Route Groups)

使用括号创建路由组，不影响 URL 路径：

\`\`\`
app/
├── (marketing)/
│   ├── about/
│   └── contact/
└── (shop)/
    ├── products/
    └── cart/
\`\`\`

### 并行路由 (Parallel Routes)

使用 \`@folder\` 语法创建并行路由：

\`\`\`
app/
├── @analytics/
│   └── page.tsx
├── @team/
│   └── page.tsx
└── dashboard/
    └── page.tsx
\`\`\`

## 最佳实践

### 1. 合理使用 Server 和 Client Components

- **Server Components**：用于数据获取、静态内容
- **Client Components**：用于交互、状态管理、浏览器 API

### 2. 优化数据获取

\`\`\`tsx
// ✅ 好的做法：在 Server Component 中获取数据
async function BlogPost({ slug }) {
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}

// ❌ 不好的做法：在 Client Component 中获取数据
'use client';
function BlogPost({ slug }) {
  const [post, setPost] = useState(null);
  useEffect(() => {
    fetchPost(slug).then(setPost);
  }, [slug]);
  // ...
}
\`\`\`

### 3. 使用 Streaming

\`\`\`tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div>加载中...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
\`\`\`

### 4. 优化图片

使用 Next.js Image 组件：

\`\`\`tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  priority // 关键图片
/>
\`\`\`

## 迁移指南

从 Pages Router 迁移到 App Router：

1. **创建 \`app/\` 目录**
2. **移动页面文件**：\`pages/index.tsx\` → \`app/page.tsx\`
3. **转换布局**：\`_app.tsx\` → \`app/layout.tsx\`
4. **更新数据获取**：使用 Server Components
5. **添加 'use client'**：需要交互的组件

## 总结

App Router 带来了：

- ✅ 更好的性能（Server Components）
- ✅ 更简单的数据获取
- ✅ 更好的开发体验
- ✅ 内置的加载和错误状态
- ✅ 更好的 SEO 支持

> **提示**：虽然 App Router 是未来的方向，但 Pages Router 仍然被支持。新项目建议使用 App Router。`,
    excerpt: "Next.js 14 引入了全新的 App Router，带来了更好的开发体验和性能优化。本文将深入探讨 App Router 的核心概念和最佳实践。",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    published: true,
    authorId: "author-1",
    author: {
      id: "author-1",
      name: "博主",
      email: "blogger@example.com",
    },
    categories: [
      { id: "cat-2", name: "前端工程化", slug: "frontend-engineering" },
    ],
    tags: [
      { id: "tag-3", name: "Next.js", slug: "nextjs" },
      { id: "tag-4", name: "TypeScript", slug: "typescript" },
    ],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
]

