#!/bin/bash

# Game Server Service Management Script

set -e

# Configuration
SERVICE_NAME="game-server"
SERVICE_DIR="/opt/game-server"
PID_FILE="$SERVICE_DIR/game-server.pid"
LOG_DIR="$SERVICE_DIR/logs"
ENV_FILE="$SERVICE_DIR/.env"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[SERVICE]${NC} $1"
}

log_error() {
    echo -e "${RED}[SERVICE ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[SERVICE WARNING]${NC} $1"
}

# Create log directory
mkdir -p "$LOG_DIR"

# Function to check if service is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Function to start the service
start_service() {
    if is_running; then
        log_warning "Service is already running with PID $(cat $PID_FILE)"
        return 0
    fi

    log_info "Starting $SERVICE_NAME..."

    # Load environment variables
    if [ -f "$ENV_FILE" ]; then
        source "$ENV_FILE"
    else
        log_error "Environment file not found: $ENV_FILE"
        exit 1
    fi

    # Check if MySQL and Redis are running
    if ! docker ps | grep -q "game-mysql"; then
        log_error "MySQL container is not running. Please run setup-mysql.sh first."
        exit 1
    fi

    if ! docker ps | grep -q "game-redis"; then
        log_error "Redis container is not running. Please run setup-redis.sh first."
        exit 1
    fi

    # Change to service directory
    cd "$SERVICE_DIR"

    # Start the service with nohup for background execution
    if [ "$NODE_ENV" = "production" ]; then
        nohup npm run start:production > "$LOG_DIR/game-server.log" 2>&1 &
    else
        nohup npm start > "$LOG_DIR/game-server.log" 2>&1 &
    fi

    # Save PID
    echo $! > "$PID_FILE"

    # Wait a moment to check if it started successfully
    sleep 5

    if is_running; then
        log_info "$SERVICE_NAME started successfully with PID $(cat $PID_FILE)"
        log_info "Logs: tail -f $LOG_DIR/game-server.log"
    else
        log_error "Failed to start $SERVICE_NAME"
        exit 1
    fi
}

# Function to stop the service
stop_service() {
    if ! is_running; then
        log_warning "Service is not running"
        return 0
    fi

    PID=$(cat "$PID_FILE")
    log_info "Stopping $SERVICE_NAME (PID: $PID)..."

    # Try graceful shutdown first
    kill -TERM "$PID" 2>/dev/null

    # Wait for process to stop
    for i in {1..30}; do
        if ! ps -p "$PID" > /dev/null 2>&1; then
            log_info "$SERVICE_NAME stopped successfully"
            rm -f "$PID_FILE"
            return 0
        fi
        echo -n "."
        sleep 1
    done

    # Force kill if still running
    log_warning "Service did not stop gracefully, forcing..."
    kill -9 "$PID" 2>/dev/null || true
    rm -f "$PID_FILE"
    log_info "$SERVICE_NAME stopped (forced)"
}

# Function to restart the service
restart_service() {
    log_info "Restarting $SERVICE_NAME..."
    stop_service
    sleep 2
    start_service
}

# Function to show service status
status_service() {
    if is_running; then
        PID=$(cat "$PID_FILE")
        log_info "$SERVICE_NAME is running with PID $PID"
        
        # Show process info
        echo ""
        echo "Process Information:"
        ps -p "$PID" -o pid,ppid,cmd,%cpu,%mem,etime
        
        # Show recent logs
        echo ""
        echo "Recent logs:"
        tail -n 10 "$LOG_DIR/game-server.log"
        
        # Show container status
        echo ""
        echo "Docker containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "game-mysql|game-redis|NAMES"
    else
        log_error "$SERVICE_NAME is not running"
        
        # Show container status anyway
        echo ""
        echo "Docker containers:"
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "game-mysql|game-redis|NAMES"
    fi
}

# Function to follow logs
follow_logs() {
    if [ -f "$LOG_DIR/game-server.log" ]; then
        log_info "Following logs (Ctrl+C to exit)..."
        tail -f "$LOG_DIR/game-server.log"
    else
        log_error "Log file not found: $LOG_DIR/game-server.log"
    fi
}

# Main command handling
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        status_service
        ;;
    logs)
        follow_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the game server"
        echo "  stop     - Stop the game server"
        echo "  restart  - Restart the game server"
        echo "  status   - Show service status"
        echo "  logs     - Follow service logs"
        exit 1
        ;;
esac