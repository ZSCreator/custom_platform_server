#!/bin/bash

# Redis Docker Setup Script

set -e

# Configuration
REDIS_CONTAINER="game-redis"
REDIS_PORT="6379"
REDIS_PASSWORD="Redis@Game2024"
REDIS_DATA_DIR="/data/game-server/data/redis"
REDIS_CONF_DIR="/data/game-server/data/redis/conf"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[Redis]${NC} $1"
}

log_error() {
    echo -e "${RED}[Redis ERROR]${NC} $1"
}

# Check if Redis container already exists
if docker ps -a | grep -q "$REDIS_CONTAINER"; then
    log_info "Redis container already exists. Stopping and removing..."
    docker stop "$REDIS_CONTAINER" 2>/dev/null || true
    docker rm "$REDIS_CONTAINER" 2>/dev/null || true
fi

# Create directories
log_info "Creating Redis directories..."
mkdir -p "$REDIS_DATA_DIR"
mkdir -p "$REDIS_CONF_DIR"

# Create Redis configuration file
log_info "Creating Redis configuration..."
cat > "$REDIS_CONF_DIR/redis.conf" <<EOF
# Redis configuration for game server
bind 0.0.0.0
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
always-show-logo yes
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data
replica-serve-stale-data yes
replica-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-disable-tcp-nodelay no
replica-priority 100
requirepass $REDIS_PASSWORD
maxmemory 2gb
maxmemory-policy allkeys-lru
lazyfree-lazy-eviction no
lazyfree-lazy-expire no
lazyfree-lazy-server-del no
replica-lazy-flush no
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 0
notify-keyspace-events ""
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
stream-node-max-bytes 4096
stream-node-max-entries 100
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
dynamic-hz yes
aof-rewrite-incremental-fsync yes
rdb-save-incremental-fsync yes
EOF

# Pull Redis image
log_info "Pulling Redis 5.0 image..."
docker pull redis:5.0-alpine

# Run Redis container
log_info "Starting Redis container..."
docker run -d \
    --name "$REDIS_CONTAINER" \
    --restart unless-stopped \
    -p "$REDIS_PORT:6379" \
    -v "$REDIS_DATA_DIR:/data" \
    -v "$REDIS_CONF_DIR/redis.conf:/usr/local/etc/redis/redis.conf" \
    redis:5.0-alpine \
    redis-server /usr/local/etc/redis/redis.conf

# Wait for Redis to be ready
log_info "Waiting for Redis to be ready..."
for i in {1..30}; do
    if docker exec "$REDIS_CONTAINER" redis-cli -a "$REDIS_PASSWORD" ping | grep -q "PONG"; then
        log_info "Redis is ready!"
        break
    fi
    echo -n "."
    sleep 1
done

# Test Redis connection
log_info "Testing Redis connection..."
docker exec "$REDIS_CONTAINER" redis-cli -a "$REDIS_PASSWORD" <<EOF
INFO server
CONFIG GET maxmemory
CONFIG GET maxmemory-policy
EOF

# Save connection info
cat > /opt/game-server/redis-connection.txt <<EOF
Redis Connection Information:
Host: localhost
Port: $REDIS_PORT
Password: $REDIS_PASSWORD

Docker commands:
- View logs: docker logs $REDIS_CONTAINER
- Access Redis CLI: docker exec -it $REDIS_CONTAINER redis-cli -a $REDIS_PASSWORD
- Monitor: docker exec -it $REDIS_CONTAINER redis-cli -a $REDIS_PASSWORD monitor
- Stop: docker stop $REDIS_CONTAINER
- Start: docker start $REDIS_CONTAINER

Useful Redis commands:
- INFO: Show server information
- DBSIZE: Show number of keys
- FLUSHDB: Clear current database
- FLUSHALL: Clear all databases
- MONITOR: Watch all commands in real-time
EOF

log_info "Redis setup completed successfully!"
log_info "Connection info saved to /opt/game-server/redis-connection.txt"