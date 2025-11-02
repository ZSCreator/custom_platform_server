#!/bin/bash

# AWS EC2 Game Server Deployment Script
# Simplified version for AWS EC2 with ec2-user

set -e

# Configuration
SERVER_IP="18.136.104.5"
SERVER_USER="ec2-user"
PEM_KEY="/Users/qiankunxiao/Documents/密钥/aws-shaw.pem"
PROJECT_NAME="game-server"
REMOTE_DIR="/home/ec2-user/${PROJECT_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

log_info "Starting deployment to AWS EC2 instance at $SERVER_IP..."

# Step 1: Check server connectivity
log_info "Checking server connectivity..."
if ! remote_exec "echo 'Server is reachable'"; then
    log_error "Cannot connect to server"
    exit 1
fi

# Step 2: Setup server environment
log_info "Setting up server environment..."
remote_exec "
    # Update system
    sudo yum update -y
    
    # Install required packages
    sudo yum install -y docker git
    
    # Install Node.js 12.x
    curl -sL https://rpm.nodesource.com/setup_12.x | sudo bash -
    sudo yum install -y nodejs
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add ec2-user to docker group
    sudo usermod -aG docker ec2-user
    
    # Create project directory
    mkdir -p $REMOTE_DIR/{scripts,logs,data}
    
    # Create Docker data directories with proper permissions
    sudo mkdir -p /opt/docker-data/{mysql,redis}
    sudo chown -R ec2-user:ec2-user /opt/docker-data
"

# Step 3: Create and copy setup scripts
log_info "Creating setup scripts..."

# Create MySQL setup script
cat > /tmp/setup-mysql.sh << 'EOF'
#!/bin/bash
set -e

MYSQL_CONTAINER="game-mysql"
MYSQL_ROOT_PASSWORD="GameServer@2024"
MYSQL_DATABASE="game_db"
MYSQL_USER="game_user"
MYSQL_PASSWORD="Game@123456"
MYSQL_PORT="3306"
MYSQL_DATA_DIR="/opt/docker-data/mysql"

echo "Setting up MySQL..."

# Remove existing container if any
docker stop $MYSQL_CONTAINER 2>/dev/null || true
docker rm $MYSQL_CONTAINER 2>/dev/null || true

# Run MySQL
docker run -d \
    --name $MYSQL_CONTAINER \
    --restart unless-stopped \
    -p $MYSQL_PORT:3306 \
    -v $MYSQL_DATA_DIR:/var/lib/mysql \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
    -e MYSQL_DATABASE=$MYSQL_DATABASE \
    -e MYSQL_USER=$MYSQL_USER \
    -e MYSQL_PASSWORD=$MYSQL_PASSWORD \
    mysql:5.7

echo "MySQL setup completed!"
EOF

# Create Redis setup script
cat > /tmp/setup-redis.sh << 'EOF'
#!/bin/bash
set -e

REDIS_CONTAINER="game-redis"
REDIS_PORT="6379"
REDIS_PASSWORD="Redis@Game2024"
REDIS_DATA_DIR="/opt/docker-data/redis"

echo "Setting up Redis..."

# Remove existing container if any
docker stop $REDIS_CONTAINER 2>/dev/null || true
docker rm $REDIS_CONTAINER 2>/dev/null || true

# Run Redis
docker run -d \
    --name $REDIS_CONTAINER \
    --restart unless-stopped \
    -p $REDIS_PORT:6379 \
    -v $REDIS_DATA_DIR:/data \
    redis:5.0-alpine \
    --requirepass $REDIS_PASSWORD

echo "Redis setup completed!"
EOF

# Create start script
cat > /tmp/start-server.sh << 'EOF'
#!/bin/bash
cd /home/ec2-user/game-server
export NODE_ENV=production

# Create logs directory
mkdir -p logs

# Start the server
nohup npm run start:production > logs/game-server.log 2>&1 &
echo $! > game-server.pid

echo "Game server started with PID $(cat game-server.pid)"
echo "View logs: tail -f logs/game-server.log"
EOF

# Copy scripts to server
log_info "Copying scripts to server..."
for script in setup-mysql.sh setup-redis.sh start-server.sh; do
    remote_copy "/tmp/$script" "$REMOTE_DIR/scripts/"
    remote_exec "chmod +x $REMOTE_DIR/scripts/$script"
    rm -f "/tmp/$script"
done

# Step 4: Setup Docker containers
log_info "Setting up Docker containers (this requires a new shell session for docker group)..."
remote_exec "sg docker -c 'cd $REMOTE_DIR/scripts && ./setup-mysql.sh'"
remote_exec "sg docker -c 'cd $REMOTE_DIR/scripts && ./setup-redis.sh'"

# Step 5: Build application locally
log_info "Building application..."
npm run build

# Step 6: Create deployment package
log_info "Creating deployment package..."
tar -czf deploy-package.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='deploy*' \
    --exclude='*.log' \
    dist app config package.json package-lock.json tsconfig.json

# Step 7: Deploy to server
log_info "Deploying to server..."
remote_copy "deploy-package.tar.gz" "$REMOTE_DIR/"
remote_exec "cd $REMOTE_DIR && tar -xzf deploy-package.tar.gz && rm deploy-package.tar.gz"

# Step 8: Install dependencies
log_info "Installing dependencies on server..."
remote_exec "cd $REMOTE_DIR && npm ci --production"

# Step 9: Create configuration
log_info "Creating configuration..."
remote_exec "
cd $REMOTE_DIR

# Create environment file
cat > .env << 'EOL'
NODE_ENV=production
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=game_db
MYSQL_USER=game_user
MYSQL_PASSWORD=Game@123456
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=Redis@Game2024
EOL

# Ensure dist/config exists
mkdir -p dist/config/db

# Create database config
cat > dist/config/db/mysql.json << 'EOL'
{
  \"production\": {
    \"host\": \"localhost\",
    \"port\": 3306,
    \"database\": \"game_db\",
    \"user\": \"game_user\",
    \"password\": \"Game@123456\",
    \"connectionLimit\": 100
  }
}
EOL

cat > dist/config/db/redis.json << 'EOL'
{
  \"production\": {
    \"host\": \"localhost\",
    \"port\": 6379,
    \"password\": \"Redis@Game2024\",
    \"db\": 0
  }
}
EOL
"

# Step 10: Start the service
log_info "Starting game server..."
remote_exec "cd $REMOTE_DIR/scripts && ./start-server.sh"

# Clean up
rm -f deploy-package.tar.gz

log_info "Deployment completed successfully!"
echo ""
echo "========================================="
echo "Deployment Summary:"
echo "- Server: $SERVER_IP"
echo "- MySQL: localhost:3306 (user: game_user, pass: Game@123456)"
echo "- Redis: localhost:6379 (pass: Redis@Game2024)"
echo "- Game Server: http://$SERVER_IP:3010"
echo ""
echo "Useful commands:"
echo "- SSH: ssh -i $PEM_KEY $SERVER_USER@$SERVER_IP"
echo "- Logs: ssh -i $PEM_KEY $SERVER_USER@$SERVER_IP 'tail -f $REMOTE_DIR/logs/game-server.log'"
echo "- MySQL: ssh -i $PEM_KEY $SERVER_USER@$SERVER_IP 'docker exec -it game-mysql mysql -ugame_user -pGame@123456 game_db'"
echo "- Redis: ssh -i $PEM_KEY $SERVER_USER@$SERVER_IP 'docker exec -it game-redis redis-cli -a Redis@Game2024'"
echo "========================================="