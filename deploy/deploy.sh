#!/bin/bash

# AWS Game Server Deployment Script
# This script deploys the game server to AWS Linux EC2 instance

set -e

# Configuration
SERVER_IP="18.136.104.5"
SERVER_USER="ec2-user"
PEM_KEY="/Users/qiankunxiao/Documents/密钥/aws-shaw.pem"
PROJECT_NAME="game-server"
REMOTE_DIR="/data/${PROJECT_NAME}"
MYSQL_CONTAINER="game-mysql"
REDIS_CONTAINER="game-redis"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if PEM key exists
if [ ! -f "$PEM_KEY" ]; then
    log_error "PEM key not found at: $PEM_KEY"
    exit 1
fi

# Set correct permissions for PEM key
chmod 400 "$PEM_KEY"

# Function to execute remote commands
remote_exec() {
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Function to copy files to remote server
remote_copy() {
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no -r "$1" "$SERVER_USER@$SERVER_IP:$2"
}

log_info "Starting deployment to $SERVER_IP..."

# Step 1: Check server connectivity
log_info "Checking server connectivity..."
if ! remote_exec "echo 'Server is reachable'"; then
    log_error "Cannot connect to server"
    exit 1
fi

# Step 2: Install required packages on remote server
log_info "Installing required packages..."
remote_exec "sudo yum update -y && sudo yum install -y docker git nodejs npm"

# Step 3: Start Docker service
log_info "Starting Docker service..."
remote_exec "sudo systemctl start docker && sudo systemctl enable docker"

# Step 4: Add user to docker group
log_info "Adding user to docker group..."
remote_exec "sudo usermod -aG docker ec2-user"

# Step 5: Create project directory
log_info "Creating project directory..."
remote_exec "sudo mkdir -p $REMOTE_DIR/{scripts,logs,data/{mysql,redis}} && sudo chown -R root:root $REMOTE_DIR"

# Step 5: Copy deployment scripts
log_info "Copying deployment scripts..."
for script in setup-mysql.sh setup-redis.sh service-manager.sh env-config.sh view-logs.sh; do
    if [ -f "deploy/$script" ]; then
        remote_copy "deploy/$script" "/tmp/"
        remote_exec "sudo mv /tmp/$script $REMOTE_DIR/scripts/ && sudo chmod +x $REMOTE_DIR/scripts/$script"
    fi
done

# Step 6: Setup MySQL
log_info "Setting up MySQL..."
remote_exec "cd $REMOTE_DIR/scripts && sudo ./setup-mysql.sh"

# Step 7: Setup Redis
log_info "Setting up Redis..."
remote_exec "cd $REMOTE_DIR/scripts && sudo ./setup-redis.sh"

# Step 8: Build and copy application
log_info "Building application..."
npm run build

# Create deployment package
log_info "Creating deployment package..."
tar -czf deploy-package.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='deploy' \
    --exclude='*.log' \
    --exclude='._*' \
    --exclude='.DS_Store' \
    --exclude='__MACOSX' \
    dist app package.json package-lock.json tsconfig.json

# Copy to server
log_info "Copying application to server..."
remote_copy "deploy-package.tar.gz" "/tmp/"

# Extract and setup on server
log_info "Setting up application on server..."
remote_exec "sudo mv /tmp/deploy-package.tar.gz $REMOTE_DIR/ && cd $REMOTE_DIR && sudo tar -xzf deploy-package.tar.gz && sudo rm deploy-package.tar.gz && sudo chown -R root:root $REMOTE_DIR"

# Clean up macOS metadata files
log_info "Cleaning up macOS metadata files..."
remote_exec "cd $REMOTE_DIR && sudo find . -name '._*' -type f -delete && sudo find . -name '.DS_Store' -delete && sudo find . -name '__MACOSX' -type d -exec rm -rf {} + 2>/dev/null || true"
log_info "Verifying cleanup - remaining ._ files:"
remote_exec "cd $REMOTE_DIR && find . -name '._*' -type f | head -5 || echo 'No ._ files found'"

# Install dependencies
log_info "Installing dependencies on server..."
remote_exec "cd $REMOTE_DIR && sudo npm install --production && sudo chown -R root:root $REMOTE_DIR"

# Step 9: Configure environment
log_info "Configuring environment..."
remote_exec "cd $REMOTE_DIR/scripts && ./env-config.sh"

# Step 10: Start the service
log_info "Starting game server service..."
remote_exec "cd $REMOTE_DIR/scripts && ./service-manager.sh start"

# Clean up local package
rm -f deploy-package.tar.gz

log_info "Deployment completed successfully!"
log_info "You can view logs using: ssh -i $PEM_KEY $SERVER_USER@$SERVER_IP 'cd $REMOTE_DIR/scripts && ./view-logs.sh'"
log_info "Service management: ssh -i $PEM_KEY $SERVER_USER@$SERVER_IP 'cd $REMOTE_DIR/scripts && ./service-manager.sh [start|stop|restart|status]'"