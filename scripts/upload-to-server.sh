#!/bin/bash

# 上传文件到远程服务器脚本
# 使用方法: ./upload-to-server.sh <本地文件路径>

# 配置
SERVER_IP="18.136.104.5"
SERVER_USER="ec2-user"
PEM_KEY="/Users/qiankunxiao/Documents/密钥/aws-shaw.pem"
REMOTE_DIR="/tmp"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查参数
if [ $# -eq 0 ]; then
    echo -e "${RED}错误：请提供要上传的文件路径${NC}"
    echo "使用方法: $0 <本地文件路径>"
    exit 1
fi

LOCAL_FILE="$1"

# 检查本地文件是否存在
if [ ! -f "$LOCAL_FILE" ]; then
    echo -e "${RED}错误：文件不存在: $LOCAL_FILE${NC}"
    exit 1
fi

# 检查 PEM key
if [ ! -f "$PEM_KEY" ]; then
    echo -e "${RED}错误：PEM key 不存在: $PEM_KEY${NC}"
    exit 1
fi

# 设置权限
chmod 400 "$PEM_KEY"

# 获取文件信息
FILENAME=$(basename "$LOCAL_FILE")
FILESIZE=$(ls -lh "$LOCAL_FILE" | awk '{print $5}')

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}文件上传工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}本地文件:${NC} $LOCAL_FILE"
echo -e "${GREEN}文件大小:${NC} $FILESIZE"
echo -e "${GREEN}目标服务器:${NC} $SERVER_USER@$SERVER_IP"
echo -e "${GREEN}目标目录:${NC} $REMOTE_DIR"
echo -e "${BLUE}========================================${NC}"

# 显示进度的 SCP 上传
echo -e "\n${YELLOW}开始上传...${NC}"

# 使用 rsync 代替 scp 以显示进度
if command -v rsync &> /dev/null; then
    # 如果有 rsync，使用 rsync 显示进度
    rsync -avz --progress -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
        "$LOCAL_FILE" \
        "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"
else
    # 否则使用 scp
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no \
        "$LOCAL_FILE" \
        "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"
fi

# 检查上传结果
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ 文件上传成功！${NC}"
    echo -e "${GREEN}远程路径:${NC} $REMOTE_DIR/$FILENAME"
    
    # 验证远程文件
    echo -e "\n${YELLOW}验证远程文件...${NC}"
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" \
        "ls -lh $REMOTE_DIR/$FILENAME"
else
    echo -e "\n${RED}✗ 文件上传失败！${NC}"
    exit 1
fi

echo -e "\n${BLUE}========================================${NC}"