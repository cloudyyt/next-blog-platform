#!/usr/bin/env bash
# 部署配置示例 —— 复制为 deploy.config.sh 后填入真实值
#
# 用法：cp scripts/deploy.config.example.sh scripts/deploy.config.sh
#       然后编辑 scripts/deploy.config.sh
#
# ⚠️ deploy.config.sh 已在 .gitignore 中（含服务器真实信息，勿提交）
#
# 这里只放「连接信息」，不放任何数据库操作开关。
# 日常部署（deploy.local.sh）只更新代码 + 跑幂等的 migrate，绝不碰业务数据。
# 需要初始化/重置 Agent 指南数据时，用独立脚本 scripts/init-guide-data.sh。

# 服务器 SSH 用户
DEPLOY_USER="root"

# 服务器公网 IP
DEPLOY_HOST="8.134.238.183"

# 服务器项目目录（绝对路径）
DEPLOY_DIR="/www/wwwroot/next-blog-platform"

# pm2 进程名
DEPLOY_PM2_NAME="blog"

# SSH 端口（一般 22，改过的话填实际端口）
DEPLOY_SSH_PORT="22"
