#!/bin/bash

# Server Management Script for Game Server
# This script provides various management commands for the deployed server

set -e

# Configuration
SERVER_IP="13.229.124.38"
SERVER_USER="ec2-user"
PEM_KEY="/Users/qiankunxiao/Documents/密钥/aws-shaw.pem"
REMOTE_DIR="/data/game-server"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check PEM key
if [ ! -f "$PEM_KEY" ]; then
    log_error "PEM key not found at: $PEM_KEY"
    exit 1
fi

chmod 400 "$PEM_KEY"

# SSH execution function
remote_exec() {
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# SCP copy function
remote_copy() {
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no -r "$1" "$SERVER_USER@$SERVER_IP:$2"
}

# Function to show menu
show_menu() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    Game Server Management Tool${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo "1)  Start Server"
    echo "2)  Stop Server"
    echo "3)  Restart Server"
    echo "4)  Show Status"
    echo "5)  View Logs (tail)"
    echo "6)  Follow Logs (real-time)"
    echo "7)  Update Code"
    echo "8)  Backup Database"
    echo "9)  Docker Status"
    echo "10) Server Health Check"
    echo "11) Clear Logs"
    echo "12) SSH to Server"
    echo "0)  Exit"
    echo -e "${BLUE}========================================${NC}"
}

# Start server
start_server() {
    log_info "Starting game server..."
    
    # Generate admin tokens first
    remote_exec "cd $REMOTE_DIR/dist && sudo node config/serverTokenBuilderDev.js"
    
    # Start pinus in daemon mode as root
    remote_exec "sudo mkdir -p $REMOTE_DIR/logs && sudo chmod 755 $REMOTE_DIR/logs"
    remote_exec "cd $REMOTE_DIR/dist && sudo nohup pinus start -e development -D 2>&1 | sudo tee ../logs/game-server.log > /dev/null &"
    
    sleep 5
    log_info "Server started in daemon mode as root"
}

# Stop server
stop_server() {
    log_info "Stopping game server..."
    
    # Stop pinus services as root
    remote_exec "cd $REMOTE_DIR/dist && sudo pinus stop"
    
    # Kill any remaining node processes
    remote_exec "sudo pkill -f 'node.*app.js' || true"
    remote_exec "sudo pkill -f 'pinus' || true"
    
    # Kill processes on specific ports
    remote_exec "sudo fuser -k 3010/tcp 2>/dev/null || true"
    remote_exec "sudo fuser -k 3011/tcp 2>/dev/null || true"
    remote_exec "sudo fuser -k 3014/tcp 2>/dev/null || true"
    remote_exec "sudo fuser -k 3005/tcp 2>/dev/null || true"
    
    log_info "All game server processes and ports stopped"
}

# Restart server
restart_server() {
    log_info "Restarting game server..."
    stop_server
    sleep 2
    start_server
}

# Show status
show_status() {
    log_info "Checking server status..."
    
    echo -e "\n${GREEN}=== Process Status ===${NC}"
    remote_exec "cd $REMOTE_DIR/dist && sudo pinus list"
    
    echo -e "\n${GREEN}=== Docker Containers ===${NC}"
    remote_exec "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'game-mysql|game-redis|NAMES' || echo 'No containers running'"
    
    echo -e "\n${GREEN}=== Port Status ===${NC}"
    remote_exec "sudo netstat -tlnp | grep -E '3010|3306|6379' || echo 'No ports listening'"
    
    echo -e "\n${GREEN}=== System Resources ===${NC}"
    remote_exec "free -h && echo '' && df -h $REMOTE_DIR"
}

# View logs
view_logs() {
    log_info "Showing last 100 lines of logs..."
    remote_exec "tail -n 100 $REMOTE_DIR/logs/game-server.log"
}

# Follow logs
follow_logs() {
    log_info "Following logs (press Ctrl+C to stop)..."
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "tail -f $REMOTE_DIR/logs/game-server.log"
}

# Update code
update_code() {
    log_info "Updating game server code..."
    
    # Build locally
    log_info "Building application locally..."
    npm run build
    
    # Create update package
    log_info "Creating update package..."
    tar -czf update-package.tar.gz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='deploy*' \
        --exclude='*.log' \
        --exclude='._*' \
        --exclude='.DS_Store' \
        --exclude='__MACOSX' \
        dist app
    
    # Backup current version
    log_info "Backing up current version..."
    remote_exec "cd $REMOTE_DIR && sudo tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz dist app"
    
    # Upload and extract
    log_info "Uploading new code..."
    remote_copy "update-package.tar.gz" "/tmp/"
    remote_exec "sudo mv /tmp/update-package.tar.gz $REMOTE_DIR/ && cd $REMOTE_DIR && sudo tar -xzf update-package.tar.gz && sudo rm update-package.tar.gz && sudo chown -R root:root $REMOTE_DIR"
    
    # Clean up macOS metadata files
    log_info "Cleaning up macOS metadata files..."
    remote_exec "cd $REMOTE_DIR && sudo find . -name '._*' -type f -delete && sudo find . -name '.DS_Store' -delete && sudo find . -name '__MACOSX' -type d -exec rm -rf {} + 2>/dev/null || true"
    log_info "Verifying cleanup - remaining ._ files:"
    remote_exec "cd $REMOTE_DIR && find . -name '._*' -type f | head -5 || echo 'No ._ files found'"
    
    # Clean up
    rm -f update-package.tar.gz
    
    log_info "Code updated. Please restart the server for changes to take effect."
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    
    BACKUP_FILE="game_db_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    remote_exec "
        docker exec game-mysql mysqldump -uroot -pGameServer@2024 game_db > /tmp/$BACKUP_FILE
        gzip /tmp/$BACKUP_FILE
        mv /tmp/${BACKUP_FILE}.gz $REMOTE_DIR/backups/
    "
    
    log_info "Database backed up to: $REMOTE_DIR/backups/${BACKUP_FILE}.gz"
}

# Docker status
docker_status() {
    log_info "Docker container status..."
    
    echo -e "\n${GREEN}=== Running Containers ===${NC}"
    remote_exec "docker ps"
    
    echo -e "\n${GREEN}=== Container Resource Usage ===${NC}"
    remote_exec "docker stats --no-stream"
    
    echo -e "\n${GREEN}=== Container Logs (last 20 lines) ===${NC}"
    echo -e "\n${YELLOW}MySQL:${NC}"
    remote_exec "docker logs --tail 20 game-mysql"
    
    echo -e "\n${YELLOW}Redis:${NC}"
    remote_exec "docker logs --tail 20 game-redis"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    echo -e "\n${GREEN}=== Service Health ===${NC}"
    
    # Check MySQL
    echo -n "MySQL: "
    if remote_exec "docker exec game-mysql mysql -ugame_user -pGame@123456 -e 'SELECT 1' &>/dev/null"; then
        echo -e "${GREEN}HEALTHY${NC}"
    else
        echo -e "${RED}UNHEALTHY${NC}"
    fi
    
    # Check Redis
    echo -n "Redis: "
    if remote_exec "docker exec game-redis redis-cli -a Redis@Game2024 ping | grep -q PONG"; then
        echo -e "${GREEN}HEALTHY${NC}"
    else
        echo -e "${RED}UNHEALTHY${NC}"
    fi
    
    # Check game server port
    echo -n "Game Server Port (3010): "
    if remote_exec "nc -zv localhost 3010 &>/dev/null"; then
        echo -e "${GREEN}OPEN${NC}"
    else
        echo -e "${RED}CLOSED${NC}"
    fi
    
    # Check disk space
    echo -e "\n${GREEN}=== Disk Usage ===${NC}"
    remote_exec "df -h | grep -E '^/dev/|Filesystem'"
    
    # Check memory
    echo -e "\n${GREEN}=== Memory Usage ===${NC}"
    remote_exec "free -h"
}

# Clear logs
clear_logs() {
    log_warning "This will clear all game server logs. Continue? (y/n)"
    read -r response
    
    if [[ "$response" == "y" ]]; then
        remote_exec "
            cd $REMOTE_DIR/logs
            for log in *.log; do
                if [ -f \"\$log\" ]; then
                    > \"\$log\"
                    echo \"Cleared: \$log\"
                fi
            done
        "
        log_info "Logs cleared"
    else
        log_info "Operation cancelled"
    fi
}

# SSH to server
ssh_to_server() {
    log_info "Connecting to server..."
    ssh -i "$PEM_KEY" "$SERVER_USER@$SERVER_IP"
}

# Main loop
if [ "$1" ]; then
    # Command line mode
    case "$1" in
        start) start_server ;;
        stop) stop_server ;;
        restart) restart_server ;;
        status) show_status ;;
        logs) view_logs ;;
        follow) follow_logs ;;
        update) update_code ;;
        backup) backup_database ;;
        docker) docker_status ;;
        health) health_check ;;
        ssh) ssh_to_server ;;
        *) 
            echo "Usage: $0 {start|stop|restart|status|logs|follow|update|backup|docker|health|ssh}"
            exit 1
            ;;
    esac
else
    # Interactive mode
    while true; do
        show_menu
        echo -n "Select an option: "
        read -r choice
        
        case $choice in
            1) start_server ;;
            2) stop_server ;;
            3) restart_server ;;
            4) show_status ;;
            5) view_logs ;;
            6) follow_logs ;;
            7) update_code ;;
            8) backup_database ;;
            9) docker_status ;;
            10) health_check ;;
            11) clear_logs ;;
            12) ssh_to_server ;;
            0) echo "Exiting..."; exit 0 ;;
            *) log_error "Invalid option" ;;
        esac
        
        if [[ "$choice" != "6" && "$choice" != "12" ]]; then
            echo -e "\n${YELLOW}Press Enter to continue...${NC}"
            read
        fi
        
        clear
    done
fi