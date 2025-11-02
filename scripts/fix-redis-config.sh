#!/bin/bash

# Fix Redis connection configuration on remote server

set -e

# Configuration
SERVER_IP="18.136.104.5"
SERVER_USER="ec2-user"
PEM_KEY="/Users/qiankunxiao/Documents/密钥/aws-shaw.pem"
REMOTE_DIR="/home/ec2-user/game-server"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[REDIS-FIX]${NC} $1"
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

log_info "Fixing Redis connection configuration..."

# Create proper Redis configuration
remote_exec "
    cd $REMOTE_DIR
    
    # Create database configuration directory
    mkdir -p dist/config/db
    
    # Create Redis configuration with password
    cat > dist/config/db/redis.json << 'EOF'
{
  \"development\": {
    \"host\": \"localhost\",
    \"port\": 6379,
    \"password\": \"Redis@Game2024\",
    \"db\": 0,
    \"enableOfflineQueue\": true,
    \"connectTimeout\": 10000,
    \"retryStrategy\": {
      \"times\": 10,
      \"delay\": 2000
    }
  },
  \"production\": {
    \"host\": \"localhost\",
    \"port\": 6379,
    \"password\": \"Redis@Game2024\",
    \"db\": 0,
    \"enableOfflineQueue\": true,
    \"connectTimeout\": 10000,
    \"retryStrategy\": {
      \"times\": 20,
      \"delay\": 3000
    }
  }
}
EOF

    # Update MySQL configuration as well
    cat > dist/config/db/mysql.json << 'EOF'
{
  \"development\": {
    \"host\": \"localhost\",
    \"port\": 3306,
    \"database\": \"game_db\",
    \"user\": \"game_user\",
    \"password\": \"Game@123456\",
    \"connectionLimit\": 100,
    \"charset\": \"utf8mb4\",
    \"timezone\": \"+08:00\",
    \"multipleStatements\": true,
    \"supportBigNumbers\": true,
    \"bigNumberStrings\": false,
    \"dateStrings\": false,
    \"debug\": false
  },
  \"production\": {
    \"host\": \"localhost\",
    \"port\": 3306,
    \"database\": \"game_db\",
    \"user\": \"game_user\",
    \"password\": \"Game@123456\",
    \"connectionLimit\": 200,
    \"charset\": \"utf8mb4\",
    \"timezone\": \"+08:00\",
    \"multipleStatements\": true,
    \"supportBigNumbers\": true,
    \"bigNumberStrings\": false,
    \"dateStrings\": false,
    \"debug\": false
  }
}
EOF

    # Update environment file
    if [ -f .env ]; then
        # Update existing .env
        sed -i 's/REDIS_PASSWORD=.*/REDIS_PASSWORD=Redis@Game2024/' .env
        sed -i 's/MYSQL_PASSWORD=.*/MYSQL_PASSWORD=Game@123456/' .env
    else
        # Create .env file
        cat > .env << 'EOF'
NODE_ENV=production
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=game_db
MYSQL_USER=game_user
MYSQL_PASSWORD=Game@123456
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=Redis@Game2024
REDIS_DB=0
NODE_OPTIONS=--no-warnings
LOG_DIR=./logs
EOF
    fi
    
    echo 'Redis and MySQL configuration updated!'
"

# Test Redis connection
log_info "Testing Redis connection..."

remote_exec "
    # Test Redis connection with password
    if docker exec game-redis redis-cli -a Redis@Game2024 ping | grep -q PONG; then
        echo 'Redis connection test: SUCCESS'
    else
        echo 'Redis connection test: FAILED'
        echo 'Checking Redis container status...'
        docker ps | grep redis
        echo 'Redis logs:'
        docker logs --tail 10 game-redis
    fi
"

# Test MySQL connection
log_info "Testing MySQL connection..."

remote_exec "
    # Test MySQL connection
    if docker exec game-mysql mysql -ugame_user -pGame@123456 -e 'SELECT 1' &>/dev/null; then
        echo 'MySQL connection test: SUCCESS'
    else
        echo 'MySQL connection test: FAILED'
        echo 'Checking MySQL container status...'
        docker ps | grep mysql
        echo 'MySQL logs:'
        docker logs --tail 10 game-mysql
    fi
"

log_info "Configuration fixed! Please restart the server:"
log_info "  ./server-manage.sh restart"