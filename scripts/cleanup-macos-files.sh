#!/bin/bash

# Quick cleanup script for macOS metadata files on server
# 快速清理服务器上的 macOS 元数据文件

SERVER_IP="34.92.120.147"
SERVER_USER="root"
PEM_KEY="$(cd "$(dirname "$0")" && pwd)/.ssh/wc_cloud_google.pem"
REMOTE_DIR="/data/game-server"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[CLEANUP]${NC} $1"
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

log_info "Connecting to server..."

# Find and list problematic files first
log_info "Finding macOS metadata files..."
ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /data/game-server
echo "Found these ._ files:"
find . -name "._*" -type f | head -20
echo ""
echo "Total count:"
find . -name "._*" -type f | wc -l
EOF

echo ""
read -p "Do you want to delete these files? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Deleting macOS metadata files..."
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /data/game-server

# Delete ._ files
sudo find . -name "._*" -type f -delete

# Delete .DS_Store files
sudo find . -name ".DS_Store" -type f -delete

# Delete __MACOSX directories
sudo find . -name "__MACOSX" -type d -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "Cleanup completed!"
echo ""
echo "Verifying - remaining files:"
find . -name "._*" -type f || echo "No ._ files found - all clean!"
EOF
    
    log_info "Cleanup completed! You can now restart the server."
    log_info "Run: ./server-manage.sh restart"
else
    log_info "Cleanup cancelled."
fi


