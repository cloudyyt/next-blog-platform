# Phase 8 · 工程化上线

> 从"能跑的 demo"到"能赚钱的产品"，差的不是模型能力，是工程化。
> 这一章解决：部署、可观测性、评测、合规、成本控制——所有"严肃产品必须做但容易忽略"的事。

---

## 本章你将解决什么

读完这一章，你应该能：

- 把 Agent 应用部署到一台 2 核 2G 云服务器，稳定跑起来
- 给 LLM 调用加上**完整可观测性**（每次调用的 input/output/cost/latency 都可查）
- 用 **Promptfoo** 做 prompt 的回归保护
- 理解国内合规要求（备案、内容安全）并落地实现
- 设计成本控制与降级策略，避免账单失控

> 前置知识：前面所有章节。这章是综合应用。

---

## 为什么这一章是"分水岭"

能搭 demo 的人很多，能上生产的人很少。区别在：

| 维度 | Demo 阶段 | 生产阶段 |
|------|---------|---------|
| 错误处理 | 控制台打印异常 | 用户看到友好提示 + 自动重试 + 降级 |
| 性能 | 单请求 5 秒能接受 | 必须 P95 < 3 秒 |
| 成本 | 自己花钱测试 | 用户用一次扣你一次钱 |
| 可观测性 | 出问题 console.log | 出问题立刻定位 |
| 合规 | 无所谓 | 不备案被关停 |
| 可维护性 | 改一行代码 review 一遍 | 改 prompt 必须跑 eval |

**这一章把这些"枯燥但关键"的工程实践讲清楚**。

---

## Why 1：为什么 LLM 应用需要新工程实践

传统 Web 应用的工程实践（CI/CD、单元测试、A/B test）在 LLM 应用里**部分失效**。原因：

### 输出不确定 → 单元测试失灵

传统代码：
```typescript
expect(add(1, 2)).toBe(3)  // 永远成立
```

LLM 代码：
```typescript
const result = await llm("写一首诗")
expect(result).toBe(...)  // 写什么断言？每次都不同
```

**新的测试范式**：Eval 集 + 评分矩阵。详见 Phase 5 的 Promptfoo 部分。

### 性能不可预测 → 必须做异步与降级

传统 API：
- 用户请求 → 数据库查询（10ms）→ 返回
- 性能稳定，P95 ≈ P50

LLM API：
- 用户请求 → LLM 推理（500ms-30s，取决于输出长度）
- 性能方差巨大，P95 可能是 P50 的 10 倍

**新的性能策略**：
- 流式输出（让用户感觉快）
- 超时降级（30 秒不返回就切备用模型）
- 异步任务（长任务给用户任务 ID，完成后通知）

### 成本与用户行为强耦合 → 必须做配额

传统 SaaS：
- 用户用一次 = 服务器算一次 = 固定成本
- 月费定价清晰

LLM 应用：
- 用户用一次 = N 次 LLM 调用（Agent 循环）
- 单次成本可能 ¥0.01 也可能 ¥1（取决于 Agent 跑了几步）
- 月费定价困难，必须做配额

**新的成本策略**：
- 用户级 token 配额
- 后台预算告警
- 多档模型分级（免费用户 qwen-flash，付费用户 qwen-plus）

---

## Why 2：为什么可观测性是 LLM 应用的核心

### 传统应用的观测三件套

- **日志**（log）
- **指标**（metric）
- **链路追踪**（trace）

### LLM 应用多了什么

- **每次 LLM 调用的完整记录**（input prompt、output、model、token、cost、latency）
- **Agent 中间步骤**（每一步调用了什么工具、得到什么结果）
- **Prompt 版本追踪**（哪天改了哪行 prompt，影响了什么指标）

没有这些，你的 Agent 出 bug 时只能"瞎猜"。

### 推荐工具：Langfuse（开源自部署）

[Langfuse](https://langfuse.com/) 是开源的 LLM 可观测性平台。自部署到你的服务器，数据不出门。

#### 核心 API（Python）

```python
from langfuse import Langfuse
from langfuse.openai import openai  # 关键：用 Langfuse 包装的 openai

# 用法：把 from openai import OpenAI 改成 from langfuse.openai import OpenAI
# 其他代码完全不变，自动记录所有调用
client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

response = client.chat.completions.create(
    model="qwen-plus",
    messages=[{"role": "user", "content": "你好"}],
    metadata={
        "user_id": "user_123",
        "session_id": "session_abc",
        "tags": ["production", "chatbot"],
    },
)
# Langfuse 自动记录：input、output、token、cost、latency
```

#### 你能看到什么

- **每次调用的完整 trace**（input/output/model/token/cost）
- **聚合指标**（每日 token 消耗、平均延迟、错误率）
- **会话视图**（一个用户的完整对话流）
- **Prompt 版本管理**（改了 prompt 后对比效果）

#### 自部署 Langfuse 到阿里云 ECS

```bash
# 在 ECS 上（建议 4 核 8G 以上，Langfuse 比较重）
git clone https://github.com/langfuse/langfuse.git
cd langfuse
docker compose up -d

# 访问 http://your-server:3000
# 默认账号：admin@example.com / admin
```

**资源警告**：Langfuse + PostgreSQL + ClickHouse，至少需要 4 核 8G。2 核 2G 跑不动。如果你的服务器是 2 核 2G，建议**用云托管版本**或**只记录关键 trace 到数据库**。

---

## Why 3：为什么 Promptfoo 是 Prompt 的"CI/CD"

参考 Phase 5 的详细说明。这里强调生产实践：

### 集成到 CI 流程

`.github/workflows/prompt-eval.yml`：

```yaml
name: Prompt Evaluation

on:
  pull_request:
    paths:
      - "prompts/**"
      - "promptfooconfig.yaml"

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: promptfoo/promptfoo-action@v1
        with:
          config: promptfooconfig.yaml
          # 如果 eval 通过率 < 90%，CI 失败
```

**效果**：每次改 prompt 必须通过 eval，否则不能合并。这把"prompt 是工程"落到了实际流程里。

---

## 部署实战：阿里云 ECS（2 核 2G）

针对资源受限的小服务器，下面是经过实战验证的部署方案。

### Step 1：服务器初始化

```bash
# 系统更新
sudo apt update && sudo apt upgrade -y

# 装 Node.js 20.x（LTS）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 装 PM2（进程守护）
sudo npm install -g pm2

# 装 Python（如果用 Python 后端）
sudo apt install -y python3 python3-pip python3-venv

# 装 Nginx（反向代理 + HTTPS）
sudo apt install -y nginx

# 装 Docker（如果需要）
curl -fsSL https://get.docker.com | sudo sh
```

### Step 2：加 Swap（2G 内存必做！）

```bash
# 创建 2G swap 文件
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 验证
free -h
```

**为什么必须加 swap**：Next.js build 时内存占用峰值约 1.5G。2G 物理内存不够，会被 OOM Killer 杀掉。加 2G swap 后能勉强 build 通过。

### Step 3：本地构建 + 上传（推荐，不在服务器 build）

服务器资源紧张时，**不要在服务器上 `npm run build`**，改用"本地构建 + 上传产物"模式：

```bash
# 本地（你的开发机）
npm run build
tar -czf release.tgz .next package.json node_modules

# 上传
scp release.tgz user@your-server:/path/to/app/

# 服务器
cd /path/to/app
tar -xzf release.tgz
pm2 start npm --name "my-agent" -- start
pm2 save  # 持久化进程列表
pm2 startup  # 开机自启
```

### Step 4：Nginx 反向代理 + HTTPS

```nginx
# /etc/nginx/sites-available/my-agent
server {
    listen 80;
    server_name your-domain.com;

    # HTTPS 重定向
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # SSE 流式响应必须的配置
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;  # LLM 调用可能慢
    }
}
```

**关键点**：`proxy_buffering off` 是流式响应必须的，否则用户看不到流式效果。

### Step 5：用阿里云免费 SSL

阿里云提供免费 DV 证书（每年续期）。在 [数字证书管理服务](https://yundun.console.aliyun.com/) 申请 → 上传到 ECS → Nginx 配置引用。

---

## 合规：内容安全与备案

这是国内开发 Agent 应用**绕不开**的两件事。

### 备案

**模型备案**：使用百炼平台已备案的 Qwen 模型（如 qwen-plus），通常**无需自己做大模型备案**，只需做"应用登记"。

**应用备案**：如果你的 Agent 对外提供服务（Web 访问），必须做：
- **ICP 备案**（域名）：阿里云有备案管家服务，约 7-20 工作日
- **算法备案**（具有舆论属性的应用）：通过 [互联网信息服务算法备案系统](https://beian.cac.gov.cn/) 提交

**备案后**：在网站显著位置公示模型名称、备案号、主体信息。

### 内容安全过滤

国内模型 API **默认开启内容安全过滤**。违规请求会返回特定错误码：

```python
try:
    response = client.chat.completions.create(...)
except Exception as e:
    if "DataInspectionFailed" in str(e):
        # 内容触发安全过滤
        return "抱歉，您的输入涉及敏感内容，请修改后重试。"
    raise
```

**生产建议**：
- 在前端 + 后端都加敏感词预过滤（更快的反馈）
- 错误处理要友好（不要返回"内容违规"这种生硬提示）
- 用阿里云 [内容安全（绿网）](https://www.aliyun.com/product/lvwang) 做前置过滤（更精准）

### 用户数据合规

- 明确告知用户"数据将用于 AI 处理"
- 提供"删除我的数据"机制（GDPR / 个人信息保护法要求）
- 敏感数据（手机号、身份证号）做脱敏后再传给 LLM

---

## 成本控制与降级策略

LLM 应用的成本**不可预测**，必须有主动控制机制。

### 策略 1：多档模型分级

```python
def get_model_for_user(user_tier: str) -> str:
    if user_tier == "free":
        return "qwen-flash"        # 极致便宜
    elif user_tier == "pro":
        return "qwen-plus"         # 均衡
    elif user_tier == "enterprise":
        return "qwen3.7-max"       # 旗舰
```

### 策略 2：用户级配额

```python
# 用 Redis 记录每个用户每天的 token 用量
import redis
r = redis.Redis()

def check_quota(user_id: str, tokens: int) -> bool:
    key = f"quota:{user_id}:{date.today()}"
    used = r.incrby(key, tokens)
    if used == tokens:  # 第一次设置，加过期时间
        r.expire(key, 86400)
    return used <= DAILY_LIMIT
```

### 策略 3：超时降级

```python
import asyncio
from openai import OpenAI

async def call_llm_with_fallback(prompt: str) -> str:
    try:
        # 主模型：qwen-plus，超时 15 秒
        return await asyncio.wait_for(
            call_qwen("qwen-plus", prompt),
            timeout=15
        )
    except asyncio.TimeoutError:
        # 降级：qwen-flash（更快但弱）
        return await call_qwen("qwen-flash", prompt)
    except Exception:
        # 兜底：固定回复
        return "服务暂时不可用，请稍后重试。"
```

### 策略 4：缓存常见查询

```python
import hashlib
import redis

r = redis.Redis()

def cached_llm_call(prompt: str, ttl: int = 3600) -> str:
    cache_key = f"llm:{hashlib.md5(prompt.encode()).hexdigest()}"

    cached = r.get(cache_key)
    if cached:
        return cached.decode()

    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,  # 缓存场景必须 temperature=0
    )
    result = response.choices[0].message.content

    r.setex(cache_key, ttl, result)
    return result
```

**注意**：只缓存"输出确定性高"的调用（如分类、抽取）。创意类（写诗、聊天）不要缓存。

---

## 监控与告警

### 必须监控的指标

| 指标 | 阈值 | 告警动作 |
|------|------|---------|
| 错误率 | > 5% | 立刻通知 |
| P95 延迟 | > 10s | 通知 + 检查模型状态 |
| 日 token 消耗 | > 预算 80% | 通知 + 暂停免费用户 |
| 内容安全拦截率 | > 1% | 通知（可能有人刷接口） |
| 单用户日 token | > 异常值（如 10 万） | 限制该用户 |

### 用阿里云云监控

- **ECS 监控**：CPU、内存、磁盘、网络（免费）
- **云监控自定义指标**：上报你的业务指标（如 token 消耗）
- **告警联系人**：手机短信 / 钉钉机器人

---

## 实际工作中最容易踩的 5 个坑

### 坑 1：流式响应在 Nginx 后失效

**症状**：本地开发流式正常，部署到 Nginx 后用户看到"等几秒一次性出来"。

**原因**：Nginx 默认开启 buffering。

**解决**：Nginx 配置加 `proxy_buffering off; proxy_cache off;`（见上面的 Nginx 配置）。

### 坑 2：服务器内存爆炸

**症状**：Node.js 进程内存占用 1.5G+，PM2 反复重启。

**原因**：
- LangChain 的 Memory 存了所有对话
- 长文本生成时模型上下文累积
- 没释放 client 实例

**解决**：
- Memory 设置 `max_token_limit`
- 定期 `global.gc?.()` 触发垃圾回收
- PM2 配置 `max_memory_restart: '1G'`，超限自动重启

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "my-agent",
    script: "npm",
    args: "start",
    max_memory_restart: "1G",  // 关键
    env: {
      NODE_ENV: "production",
    },
  }]
}
```

### 坑 3：API Key 泄露

**症状**：账单突然爆炸。

**原因**：
- `.env` 没加 `.gitignore`
- 前端代码不小心引用了 server-only 的 key
- 仓库被 fork，攻击者扫到

**解决**：
- `.env` 严格加入 `.gitignore`
- 用 `secrets manager`（阿里云 KMS）
- API Key 定期轮换（每 3 个月）

### 坑 4：模型静默漂移导致质量下降

**症状**：3 个月前能跑的 prompt，现在突然效果变差。

**原因**：服务方静默更新模型权重（Qwen / OpenAI 都会做）。

**解决**：
- Promptfoo eval 每周跑一次（不只 PR 跑）
- 关键 prompt 用 `promptfoo eval --prompts <specific-version>` 锁版本
- 监控用户反馈指标（点赞/点踩率）

### 坑 5：合规问题导致服务下线

**症状**：网站突然打不开，被告知要备案。

**原因**：没做 ICP 备案 / 算法备案。

**解决**：
- 上线前先备案（不嫌早）
- 模型选择用百炼已备案的 Qwen
- 接内容安全过滤（绿网）

---

## 一个生产就绪的最小 Checklist

上线前逐条确认：

### 部署
- [ ] ECS 加了 Swap
- [ ] PM2 配置了 `max_memory_restart`
- [ ] Nginx `proxy_buffering off`
- [ ] HTTPS 证书配好
- [ ] 备案完成

### 错误处理
- [ ] 所有 LLM 调用有 try/catch
- [ ] 内容安全错误有友好提示
- [ ] 超时有降级方案

### 成本控制
- [ ] 用户级配额
- [ ] 日预算告警
- [ ] 缓存常见查询

### 可观测性
- [ ] Langfuse（或替代方案）记录关键调用
- [ ] 监控错误率、延迟、token 消耗
- [ ] 错误告警到手机/钉钉

### 评测
- [ ] Promptfoo 配置文件就绪
- [ ] CI 集成（PR 必须通过 eval）
- [ ] 每周自动 eval 巡检

### 合规
- [ ] ICP 备案
- [ ] 内容安全过滤接入
- [ ] 用户数据告知与删除机制

---

## 本章检查清单

- [ ] 我能把 Agent 应用部署到 2 核 2G ECS 上稳定运行
- [ ] 我知道为什么必须加 Swap
- [ ] 我配好了 Langfuse 或替代方案，能查每次 LLM 调用
- [ ] 我用 Promptfoo 集成到 CI 做 prompt 回归保护
- [ ] 我实现了多档模型分级 + 用户配额 + 超时降级
- [ ] 我知道国内合规的底线（备案 + 内容安全）
- [ ] 我有一份生产就绪 checklist

---

## 恭喜，你毕业了

到这里，整份指南的核心内容结束。回顾你掌握的能力：

| 能力 | 章节 |
|------|------|
| 建立正确认知 | Phase 0/1 |
| 工具准备（Python + Qwen） | Phase 2/3 |
| Agent 三大核心能力 | Phase 4/5/6 |
| 系统化（框架 + 上线） | Phase 7/8 |

接下来：

- **附录**：完整术语表、Qwen 模型选型速查、Prompt 模板库
- **持续学习**：技术变化快，保持每月读 2-3 篇深度文章的习惯
- **动手实战**：找一个小项目从 0 做到上线——这是巩固所有知识的最佳方式

祝你转型顺利。
