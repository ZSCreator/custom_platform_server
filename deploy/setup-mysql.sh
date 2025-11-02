#!/bin/bash

# MySQL Docker Setup Script

set -e

# Configuration
MYSQL_CONTAINER="game-mysql"
MYSQL_ROOT_PASSWORD="GameServer@2024"
MYSQL_DATABASE="game_db"
MYSQL_USER="game_user"
MYSQL_PASSWORD="Game@123456"
MYSQL_PORT="3306"
MYSQL_DATA_DIR="/data/game-server/data/mysql"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[MySQL]${NC} $1"
}

log_error() {
    echo -e "${RED}[MySQL ERROR]${NC} $1"
}

# Check if MySQL container already exists
if docker ps -a | grep -q "$MYSQL_CONTAINER"; then
    log_info "MySQL container already exists. Stopping and removing..."
    docker stop "$MYSQL_CONTAINER" 2>/dev/null || true
    docker rm "$MYSQL_CONTAINER" 2>/dev/null || true
fi

# Create data directory
log_info "Creating MySQL data directory..."
mkdir -p "$MYSQL_DATA_DIR"

# Pull MySQL image
log_info "Pulling MySQL 5.7 image..."
docker pull mysql:5.7

# Run MySQL container
log_info "Starting MySQL container..."
docker run -d \
    --name "$MYSQL_CONTAINER" \
    --restart unless-stopped \
    -p "$MYSQL_PORT:3306" \
    -v "$MYSQL_DATA_DIR:/var/lib/mysql" \
    -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
    -e MYSQL_DATABASE="$MYSQL_DATABASE" \
    -e MYSQL_USER="$MYSQL_USER" \
    -e MYSQL_PASSWORD="$MYSQL_PASSWORD" \
    mysql:5.7 \
    --character-set-server=utf8mb4 \
    --collation-server=utf8mb4_unicode_ci \
    --max_connections=1000 \
    --max_allowed_packet=64M

# Wait for MySQL to be ready
log_info "Waiting for MySQL to be ready..."
for i in {1..30}; do
    if docker exec "$MYSQL_CONTAINER" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1" &>/dev/null; then
        log_info "MySQL is ready!"
        break
    fi
    echo -n "."
    sleep 2
done

# Create additional configuration
log_info "Applying additional MySQL configuration..."
docker exec "$MYSQL_CONTAINER" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<EOF
-- Set timezone
SET GLOBAL time_zone = '+8:00';

-- Grant privileges
GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Show configuration
SHOW VARIABLES LIKE 'character%';
SHOW VARIABLES LIKE 'max_connections';
EOF

# Save connection info
cat > /data/game-server/mysql-connection.txt <<EOF
MySQL Connection Information:
Host: localhost
Port: $MYSQL_PORT
Database: $MYSQL_DATABASE
Username: $MYSQL_USER
Password: $MYSQL_PASSWORD
Root Password: $MYSQL_ROOT_PASSWORD

Docker commands:
- View logs: docker logs $MYSQL_CONTAINER
- Access MySQL CLI: docker exec -it $MYSQL_CONTAINER mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE
- Stop: docker stop $MYSQL_CONTAINER
- Start: docker start $MYSQL_CONTAINER
EOF

log_info "MySQL setup completed successfully!"
log_info "Connection info saved to /data/game-server/mysql-connection.txt"