#!/usr/bin/env bash
#
# Agent 指南数据初始化/重置脚本 —— 独立于日常部署
#
# ⚠️ 这个脚本会修改数据库的 Agent 指南数据，请谨慎使用！
#
# 用法：
#   bash scripts/init-guide-data.sh           # 安全模式：只插入新章节，不覆盖已存在的
#   bash scripts/init-guide-data.sh --force   # ⚠️ 危险：覆盖所有章节正文和系列配置！
#                                            #         会丢失你在 admin 里手动编辑的内容
#
# 什么时候用：
#   - 首次部署，线上还没有 Agent 指南数据 → 用安全模式
#   - 大批量重写指南内容（如整体打磨），想用 docs/agent-guide/*.md 覆盖线上 → 用 --force
#
# 什么时候别用：
#   - 日常代码部署（deploy.local.sh 已经自动跑 migrate，不碰业务数据）
#   - 只改一两篇内容（直接去 admin 后台编辑更安全）
#
# 文档见 docs_memo/本地构建部署到服务器（不带node_modules）.md

set -euo pipefail

# 颜色
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}ℹ${NC}  $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $1"; }
die()   { echo -e "${RED}✗${NC} $1"; exit 1; }

FORCE=""
if [[ "${1:-}" == "--force" ]]; then
  FORCE="--force"
fi

# 加载部署配置（需要服务器信息）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$SCRIPT_DIR/deploy.config.sh"

cd "$PROJECT_DIR"

if [[ ! -f "$CONFIG_FILE" ]]; then
  die "配置文件不存在：$CONFIG_FILE
请先：cp scripts/deploy.config.example.sh scripts/deploy.config.sh 并填值"
fi
# shellcheck disable=SC1090
source "$CONFIG_FILE"

DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"

echo ""
echo "═══════════════════════════════════════════════════════════"
if [[ -n "$FORCE" ]]; then
  echo -e "${RED}⚠️  危险操作：强制覆盖模式${NC}"
  echo "  将用 docs/agent-guide/*.md 覆盖线上所有 Agent 指南内容"
  echo "  你在 admin 里手动编辑的章节正文、系列配置（含封面）都会丢失！"
else
  echo -e "${GREEN}安全模式：仅插入新章节${NC}"
  echo "  已存在的章节会被跳过，不覆盖任何内容"
fi
echo "═══════════════════════════════════════════════════════════"
echo ""

read -p "确认要在服务器 ${DEPLOY_HOST} 上执行吗？(输入 yes 继续): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "已取消"
  exit 0
fi

echo ""
info "通过 SSH 在服务器上执行 seed-guide ${FORCE:-（安全模式）}..."

# 远程执行：加载 PATH（和 deploy.server.sh 一样的 PATH 初始化）+ 跑 seed
ssh -p "$DEPLOY_SSH_PORT" "${DEPLOY_USER}@${DEPLOY_HOST}" bash -s "$FORCE" << 'REMOTE_SCRIPT'
FORCE="$1"

# PATH 初始化（非交互 ssh）
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
{ [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; } || true
{ [ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc"; } || true
for bt_node_bin in /www/server/nodejs/*/bin; do
  [ -d "$bt_node_bin" ] && export PATH="$bt_node_bin:$PATH"
done
export PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

cd /www/wwwroot/next-blog-platform 2>/dev/null || { echo "✗ 项目目录不存在"; exit 1; }

if [[ -n "$FORCE" ]]; then
  echo "→ 执行 pnpm db:seed:guide --force"
  pnpm db:seed:guide --force
else
  echo "→ 执行 pnpm db:seed:guide（安全模式）"
  pnpm db:seed:guide
fi

echo ""
echo "✅ seed 完成"
REMOTE_SCRIPT

echo ""
ok "Agent 指南数据操作完成"
if [[ -z "$FORCE" ]]; then
  info "提示：如果线上已有数据，本次可能全部跳过（正常）。要覆盖用 --force"
fi
