#!/bin/bash

# Environment Configuration Script

set -e

# Configuration
ENV_FILE="/opt/game-server/.env"
CONFIG_DIR="/opt/game-server/dist/config"
DB_CONFIG_DIR="$CONFIG_DIR/db"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[CONFIG]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[CONFIG WARNING]${NC} $1"
}

# Create config directories
log_info "Creating configuration directories..."
mkdir -p "$DB_CONFIG_DIR"

# Create environment file
log_info "Creating environment configuration..."
cat > "$ENV_FILE" <<'EOF'
# Game Server Environment Configuration
NODE_ENV=production

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=3000

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=game_db
MYSQL_USER=game_user
MYSQL_PASSWORD=Game@123456
MYSQL_CONNECTION_LIMIT=100

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=Redis@Game2024
REDIS_DB=0

# MongoDB Configuration (if needed later)
# MONGO_URI=mongodb://localhost:27017/game_db

# Server Settings
LOG_LEVEL=info
MAX_PLAYERS=10000
ENABLE_ROBOTS=true

# Security
JWT_SECRET=GameServer@JWT#2024
SESSION_SECRET=GameServer@Session#2024

# Game Settings
DEFAULT_CURRENCY=CNY
DEFAULT_LANGUAGE=zh-CN

# External API Keys (if needed)
# PAYMENT_API_KEY=
# SMS_API_KEY=
EOF

# Create MySQL configuration
log_info "Creating MySQL configuration..."
cat > "$DB_CONFIG_DIR/mysql.json" <<'EOF'
{
  "development": {
    "host": "localhost",
    "port": 3306,
    "database": "game_db",
    "user": "game_user",
    "password": "Game@123456",
    "connectionLimit": 100,
    "charset": "utf8mb4",
    "timezone": "+08:00",
    "multipleStatements": true,
    "supportBigNumbers": true,
    "bigNumberStrings": false,
    "dateStrings": false,
    "debug": false
  },
  "production": {
    "host": "localhost",
    "port": 3306,
    "database": "game_db",
    "user": "game_user",
    "password": "Game@123456",
    "connectionLimit": 200,
    "charset": "utf8mb4",
    "timezone": "+08:00",
    "multipleStatements": true,
    "supportBigNumbers": true,
    "bigNumberStrings": false,
    "dateStrings": false,
    "debug": false
  }
}
EOF

# Create Redis configuration
log_info "Creating Redis configuration..."
cat > "$DB_CONFIG_DIR/redis.json" <<'EOF'
{
  "development": {
    "host": "localhost",
    "port": 6379,
    "password": "Redis@Game2024",
    "db": 0,
    "enableOfflineQueue": true,
    "connectTimeout": 10000,
    "retryStrategy": {
      "times": 10,
      "delay": 2000
    }
  },
  "production": {
    "host": "localhost",
    "port": 6379,
    "password": "Redis@Game2024",
    "db": 0,
    "enableOfflineQueue": true,
    "connectTimeout": 10000,
    "retryStrategy": {
      "times": 20,
      "delay": 3000
    }
  }
}
EOF

# Create server configuration
log_info "Creating server configuration..."
cat > "$CONFIG_DIR/servers.json" <<'EOF'
{
  "development": {
    "connector": [{
      "id": "connector-server-1",
      "host": "127.0.0.1",
      "port": 3010,
      "clientHost": "18.136.104.5",
      "clientPort": 3010,
      "frontend": true
    }],
    "gate": [{
      "id": "gate-server-1",
      "host": "127.0.0.1",
      "port": 3011
    }],
    "hall": [{
      "id": "hall-server-1",
      "host": "127.0.0.1",
      "port": 3012
    }]
  },
  "production": {
    "connector": [{
      "id": "connector-server-1",
      "host": "127.0.0.1",
      "port": 3010,
      "clientHost": "18.136.104.5",
      "clientPort": 3010,
      "frontend": true
    }],
    "gate": [{
      "id": "gate-server-1",
      "host": "127.0.0.1",
      "port": 3011
    }],
    "hall": [{
      "id": "hall-server-1",
      "host": "127.0.0.1",
      "port": 3012
    }]
  }
}
EOF

# Create master configuration
log_info "Creating master configuration..."
cat > "$CONFIG_DIR/master.json" <<'EOF'
{
  "development": {
    "id": "master-server-1",
    "host": "127.0.0.1",
    "port": 3005,
    "args": " "
  },
  "production": {
    "id": "master-server-1",
    "host": "127.0.0.1",
    "port": 3005,
    "args": " "
  }
}
EOF

# Create admin users configuration
log_info "Creating admin users configuration..."
cat > "$CONFIG_DIR/adminUser.json" <<'EOF'
[
  {
    "id": "admin",
    "username": "admin",
    "password": "admin123456",
    "level": 1
  }
]
EOF

# Set permissions
chmod 600 "$ENV_FILE"
chmod -R 755 "$CONFIG_DIR"

# Verify configuration files
log_info "Verifying configuration files..."
for file in "$ENV_FILE" "$DB_CONFIG_DIR/mysql.json" "$DB_CONFIG_DIR/redis.json" "$CONFIG_DIR/servers.json" "$CONFIG_DIR/master.json"; do
    if [ -f "$file" ]; then
        log_info "✓ $(basename $file) created successfully"
    else
        log_warning "✗ $(basename $file) not found"
    fi
done

log_info "Environment configuration completed!"
log_info "Environment file: $ENV_FILE"
log_info "Configuration directory: $CONFIG_DIR"

# Display important notes
echo ""
echo "================================"
echo "IMPORTANT NOTES:"
echo "1. MySQL connection: localhost:3306 (user: game_user, pass: Game@123456)"
echo "2. Redis connection: localhost:6379 (pass: Redis@Game2024)"
echo "3. Game server will listen on: 18.136.104.5:3010"
echo "4. Admin portal: username: admin, password: admin123456"
echo "5. Please update passwords in production!"
echo "================================"