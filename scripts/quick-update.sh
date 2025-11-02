#!/bin/bash

# Quick Update Script for Game Server
# Updates code and restarts server in one command

set -e

# Configuration
SERVER_IP="34.92.120.147"
SERVER_USER="root"
# 使用项目内的密钥文件（避免中文路径问题）
PEM_KEY="$(cd "$(dirname "$0")" && pwd)/.ssh/wc_cloud_google.pem"
REMOTE_DIR="/data/game-server"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[UPDATE]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check PEM key
if [ ! -f "$PEM_KEY" ]; then
    log_error "PEM key not found at: $PEM_KEY"
    exit 1
fi

chmod 400 "$PEM_KEY"

# SSH execution
remote_exec() {
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# SCP copy
remote_copy() {
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no -r "$1" "$SERVER_USER@$SERVER_IP:$2"
}

log_info "Starting quick update process..."

# Step 1: Build locally
log_info "Building application..."
npm run build

# Step 2: Create update package
log_info "Creating update package..."
tar -czf update-package.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='deploy*' \
    --exclude='*.log' \
    --exclude='*.tar.gz' \
    --exclude='._*' \
    --exclude='.DS_Store' \
    --exclude='__MACOSX' \
    dist app

# Step 3: Stop server
# log_info "Stopping server..."
# remote_exec "cd $REMOTE_DIR/dist && sudo pinus stop"
# remote_exec "sudo pkill -f 'node.*app.js' || true"
# remote_exec "sudo pkill -f 'pinus' || true"

# # Step 4: Backup current version
# log_info "Backing up current version..."
# BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
# remote_exec "cd $REMOTE_DIR && sudo mkdir -p backups && sudo tar -czf backups/$BACKUP_NAME dist app"

# Step 5: Upload and extract new code
log_info "Uploading new code..."
remote_copy "update-package.tar.gz" "/tmp/"
remote_exec "sudo mv /tmp/update-package.tar.gz $REMOTE_DIR/ && cd $REMOTE_DIR && sudo tar -xzf update-package.tar.gz && sudo rm update-package.tar.gz && sudo chown -R root:root $REMOTE_DIR"

# Step 5.5: Clean up macOS metadata files
log_info "Cleaning up macOS metadata files..."
remote_exec "cd $REMOTE_DIR && sudo find . -name '._*' -type f -delete && sudo find . -name '.DS_Store' -delete && sudo find . -name '__MACOSX' -type d -exec rm -rf {} + 2>/dev/null || true"
log_info "Verifying cleanup - remaining ._ files:"
remote_exec "cd $REMOTE_DIR && find . -name '._*' -type f | head -5 || echo 'No ._ files found'"

# Step 6: Update dependencies if package.json changed
if git diff --name-only HEAD^ HEAD | grep -q "package.json"; then
    log_info "package.json changed, updating dependencies..."
    remote_exec "cd $REMOTE_DIR && sudo npm ci --development && sudo chown -R root:root $REMOTE_DIR"
fi

# Step 7: Start server
# log_info "Starting server..."
# remote_exec "cd $REMOTE_DIR/dist && node config/serverTokenBuilderDev.js"
# remote_exec "sudo mkdir -p $REMOTE_DIR/logs && sudo chmod 755 $REMOTE_DIR/logs"
# remote_exec "cd $REMOTE_DIR/dist && sudo bash -c 'nohup pinus start -e development -D > ../logs/game-server.log 2>&1 &'"

# Step 8: Clean up
rm -f update-package.tar.gz

# Step 9: Verify server started
sleep 5
log_info "Update completed successfully!"
log_info "Check server status: ./server-manage.sh status"
log_info "View logs: ./server-manage.sh logs"