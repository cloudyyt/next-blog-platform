#!/bin/bash

# 数据库连接检查脚本

echo "=== 检查 Docker MySQL 容器 ==="
docker ps -a | grep -i mysql || echo "未找到 MySQL 容器"

echo ""
echo "=== 检查本地 MySQL 服务 ==="
if command -v mysql &> /dev/null; then
    echo "MySQL 客户端已安装"
    mysql --version
else
    echo "MySQL 客户端未安装"
fi

echo ""
echo "=== 测试数据库连接 ==="
if [ -f .env ]; then
    source .env
    if [ -n "$DATABASE_URL" ]; then
        echo "DATABASE_URL 已配置"
        # 提取连接信息
        echo "连接字符串: ${DATABASE_URL:0:50}..."
    else
        echo "DATABASE_URL 未配置"
    fi
else
    echo ".env 文件不存在"
fi

echo ""
echo "=== 建议的排查步骤 ==="
echo "1. 检查 Docker 容器是否运行: docker ps | grep mysql"
echo "2. 如果容器未运行，启动容器: docker-compose up -d"
echo "3. 检查容器日志: docker logs blog-platform-mysql"
echo "4. 测试连接: mysql -h localhost -u root -p"
echo "5. 确认 .env 文件中的 DATABASE_URL 配置正确"

