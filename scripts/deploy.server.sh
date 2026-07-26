#!/usr/bin/env bash
#
# 服务器端部署脚本 —— 由 deploy.local.sh 通过 ssh 触发，也可在服务器上手动跑
#
# 在服务器上的 <DEPLOY_DIR> 执行：解压 + 装依赖 + 建表 + 灌数据 + 重启
#
# 配置通过环境变量传入（由 deploy.local.sh 设置）：
#   DEPLOY_PM2_NAME       pm2 进程名
#   DEPLOY_SEED_GUIDE     是否灌 guide 数据（true/false）
#   DEPLOY_SEED_FORCE     seed 是否用 --force（true/false）
#   DEPLOY_MIGRATE        是否跑 migrate deploy（true/false）
#
# ⚠️ 本脚本设计为在服务器项目根目录（DEPLOY_DIR）下执行
# ⚠️ 依赖服务器 .env 已正确配置（DB 指向线上、OSS 变量等）
#
# 文档见 docs/0726-部署上线与数据同步.md

# ⚠️ 注意：先不要 set -e，PATH 初始化里的 source 可能失败（nvm 没装等），
# 如果带 -e 会秒退且无输出。先把 PATH 搞定再 set -euo pipefail。
# ─── PATH 初始化（关键！非交互 ssh 拿不到完整 PATH）───
# 通过 ssh root@host "bash script" 触发的是非交互式 shell，不加载 .bashrc，
# 导致宝塔/nvm 装的 node/pnpm/pm2 找不到。这里手动补全 PATH。
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
{ [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; } || true
{ [ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc"; } || true
{ [ -f "$HOME/.bash_profile" ] && . "$HOME/.bash_profile"; } || true

# 宝塔把 Node 装在 /www/server/nodejs/<版本>/bin/，版本号会变（v20.20.2 等）
# 动态扫描该目录，把所有版本子目录的 bin 都加进 PATH
for bt_node_bin in /www/server/nodejs/*/bin; do
  [ -d "$bt_node_bin" ] && export PATH="$bt_node_bin:$PATH"
done

# 其他常见路径兜底
export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# 现在可以安全 set -e 了（PATH 已就绪，后续命令失败应该让脚本退出）
set -euo pipefail

# ─── 颜色 + 输出函数（必须在所有调用之前定义）───
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; NC=''
fi
info()  { echo -e "${BLUE}ℹ${NC}  $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $1"; }
die()   { echo -e "${RED}✗${NC} $1"; exit 1; }

# ─── 镜像源配置（关键！阿里云 ECS 访问国外源超时）───
# 1. npm/pnpm 包源 → 淘宝 npmmirror（国内最快）
# 2. Prisma 引擎二进制 → 淘宝 npmmirror binary 镜像
# 没这两步，pnpm install 会 ETIMEDOUT，prisma generate 会卡在 Downloading 0%
info "配置国内镜像源（npmmirror + Prisma engines）..."
export PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
# 写进 ~/.bashrc 永久生效（已存在则不重复写）
grep -q "PRISMA_ENGINES_MIRROR" ~/.bashrc 2>/dev/null || \
  echo 'export PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma' >> ~/.bashrc
# pnpm/npm registry（已切过则跳过）
if command -v pnpm &>/dev/null; then
  CURRENT_REG=$(pnpm config get registry 2>/dev/null || echo "")
  if [[ "$CURRENT_REG" != *"npmmirror"* ]]; then
    pnpm config set registry https://registry.npmmirror.com
    ok "pnpm registry → npmmirror"
  else
    ok "pnpm registry 已是 npmmirror"
  fi
fi
ok "镜像源配置完成"

# ─── 接收环境变量配置 ───
DEPLOY_PM2_NAME="${DEPLOY_PM2_NAME:-blog}"
DEPLOY_SEED_GUIDE="${DEPLOY_SEED_GUIDE:-true}"
DEPLOY_SEED_FORCE="${DEPLOY_SEED_FORCE:-false}"
DEPLOY_MIGRATE="${DEPLOY_MIGRATE:-true}"

# 脚本所在的目录就是项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

info "服务器部署开始（目录: $PROJECT_DIR, pm2: $DEPLOY_PM2_NAME）"
echo ""

# ─── 前置检查 ───
info "前置检查..."

# .env 必须存在
if [[ ! -f .env ]]; then
  die ".env 不存在！请先在服务器上配置 .env（参考 .env.example）
       关键：PRISMA_DATABASE_URL 指向线上 DB、OSS_* 变量、OSS_USE_INTERNAL=true"
fi
ok ".env 存在"

# release.tgz 必须存在（scp 上传的）
if [[ ! -f release.tgz ]]; then
  die "release.tgz 不存在！请先在本地跑 deploy.local.sh 上传"
fi
ok "release.tgz 存在"

# Node 版本检查
NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  warn "Node 版本 $(node -v) < 20，sharp（图片处理）可能出问题。建议升级到 Node 20。"
else
  ok "Node $(node -v)"
fi

# pnpm 检查
if ! command -v pnpm &>/dev/null; then
  die "pnpm 未安装。先装：npm install -g pnpm"
fi
ok "pnpm $(pnpm -v)"
echo ""

# ─── 解压覆盖 ───
info "解压 release.tgz..."
tar -xzf release.tgz
ok "解压完成"
echo ""

# ─── 装生产依赖 ───
info "安装生产依赖（pnpm install --prod）..."
# postinstall 会自动跑 prisma generate
pnpm install --prod --frozen-lockfile || {
  warn "frozen-lockfile 失败，尝试不冻结 lockfile..."
  pnpm install --prod
}
ok "依赖安装完成"
echo ""

# ─── 建表（可选）───
if [[ "$DEPLOY_MIGRATE" == "true" ]]; then
  info "应用数据库迁移（prisma migrate deploy）..."
  # 尝试直接 deploy，遇 drift 报错时引导 baseline
  if ! npx prisma migrate deploy 2>&1; then
    echo ""
    warn "migrate deploy 失败，可能是 DB 处于 drift 状态（早期用 db push 建的，无迁移历史表）。"
    warn "这是已知坑，详见 docs/0726-部署上线与数据同步.md 第四节「坑 2」。"
    echo ""
    info "尝试 baseline 已有迁移（标记为已应用，不真正执行）..."
    npx prisma migrate resolve --applied 20251230174814_init || true
    npx prisma migrate resolve --applied 20260413205000_add_post_view_tracking || true
    info "baseline 完成，重新 deploy..."
    npx prisma migrate deploy
  fi
  ok "迁移应用完成"
  echo ""
else
  info "跳过 migrate（DEPLOY_MIGRATE=false）"
fi

# ─── 灌 Agent 指南数据（可选）───
if [[ "$DEPLOY_SEED_GUIDE" == "true" ]]; then
  if [[ "$DEPLOY_SEED_FORCE" == "true" ]]; then
    warn "用 --force 灌数据，会覆盖已存在的章节内容！"
    info "运行 db:seed:guide --force..."
    pnpm db:seed:guide --force
  else
    info "运行 db:seed:guide（幂等，只插新章，不覆盖）..."
    pnpm db:seed:guide
  fi
  ok "Agent 指南数据灌入完成"
  echo ""
else
  info "跳过 seed-guide（DEPLOY_SEED_GUIDE=false）"
fi

# ─── 重启服务 ───
info "重启 pm2 进程（$DEPLOY_PM2_NAME）..."
pm2 restart "$DEPLOY_PM2_NAME" --update-env
ok "已重启"
echo ""

# ─── 输出最近日志供检查 ───
info "pm2 最近 15 行日志："
echo "──────────────────────────────────────────────"
pm2 logs "$DEPLOY_PM2_NAME" --lines 15 --nostream 2>/dev/null || warn "读取日志失败，请手动 pm2 logs 查看"
echo "──────────────────────────────────────────────"
echo ""

ok "🎉 服务器端部署完成！"
info "验证："
info "  - 首页：      http://<服务器IP>/blog"
info "  - Agent 指南：http://<服务器IP>/agent-guide"
info "  - admin 后台：http://<服务器IP>/admin/guide"
