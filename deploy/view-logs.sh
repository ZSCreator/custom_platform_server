#!/bin/bash

# Log Viewing Script for Game Server

# Configuration
LOG_DIR="/opt/game-server/logs"
MYSQL_CONTAINER="game-mysql"
REDIS_CONTAINER="game-redis"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Function to display menu
show_menu() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    Game Server Log Viewer${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo "1) View Game Server logs"
    echo "2) View MySQL logs"
    echo "3) View Redis logs"
    echo "4) Follow Game Server logs (real-time)"
    echo "5) Follow MySQL logs (real-time)"
    echo "6) Follow Redis logs (real-time)"
    echo "7) Search in Game Server logs"
    echo "8) Show last 100 lines of all logs"
    echo "9) Show error logs only"
    echo "0) Exit"
    echo -e "${BLUE}========================================${NC}"
}

# Function to view game server logs
view_game_logs() {
    if [ -f "$LOG_DIR/game-server.log" ]; then
        echo -e "${GREEN}[Game Server Logs]${NC}"
        less "$LOG_DIR/game-server.log"
    else
        echo -e "${RED}Game server log file not found${NC}"
    fi
}

# Function to view MySQL logs
view_mysql_logs() {
    echo -e "${GREEN}[MySQL Logs]${NC}"
    docker logs "$MYSQL_CONTAINER" 2>&1 | less
}

# Function to view Redis logs
view_redis_logs() {
    echo -e "${GREEN}[Redis Logs]${NC}"
    docker logs "$REDIS_CONTAINER" 2>&1 | less
}

# Function to follow game server logs
follow_game_logs() {
    if [ -f "$LOG_DIR/game-server.log" ]; then
        echo -e "${GREEN}[Following Game Server Logs - Press Ctrl+C to stop]${NC}"
        tail -f "$LOG_DIR/game-server.log"
    else
        echo -e "${RED}Game server log file not found${NC}"
    fi
}

# Function to follow MySQL logs
follow_mysql_logs() {
    echo -e "${GREEN}[Following MySQL Logs - Press Ctrl+C to stop]${NC}"
    docker logs -f "$MYSQL_CONTAINER" 2>&1
}

# Function to follow Redis logs
follow_redis_logs() {
    echo -e "${GREEN}[Following Redis Logs - Press Ctrl+C to stop]${NC}"
    docker logs -f "$REDIS_CONTAINER" 2>&1
}

# Function to search in logs
search_logs() {
    echo -n "Enter search term: "
    read search_term
    
    if [ -z "$search_term" ]; then
        echo -e "${RED}No search term provided${NC}"
        return
    fi
    
    echo -e "${GREEN}[Searching for '$search_term' in Game Server logs]${NC}"
    
    if [ -f "$LOG_DIR/game-server.log" ]; then
        grep -n --color=always "$search_term" "$LOG_DIR/game-server.log" | less -R
    else
        echo -e "${RED}Game server log file not found${NC}"
    fi
}

# Function to show last 100 lines of all logs
show_recent_logs() {
    echo -e "${GREEN}[Last 100 lines of Game Server logs]${NC}"
    if [ -f "$LOG_DIR/game-server.log" ]; then
        tail -n 100 "$LOG_DIR/game-server.log"
    else
        echo -e "${RED}Game server log file not found${NC}"
    fi
    
    echo -e "\n${GREEN}[Last 50 lines of MySQL logs]${NC}"
    docker logs --tail 50 "$MYSQL_CONTAINER" 2>&1
    
    echo -e "\n${GREEN}[Last 50 lines of Redis logs]${NC}"
    docker logs --tail 50 "$REDIS_CONTAINER" 2>&1
}

# Function to show error logs
show_error_logs() {
    echo -e "${GREEN}[Error logs from Game Server]${NC}"
    if [ -f "$LOG_DIR/game-server.log" ]; then
        grep -i "error\|exception\|fatal\|failed" "$LOG_DIR/game-server.log" | tail -n 100
    else
        echo -e "${RED}Game server log file not found${NC}"
    fi
    
    echo -e "\n${GREEN}[Error logs from MySQL]${NC}"
    docker logs "$MYSQL_CONTAINER" 2>&1 | grep -i "error\|warning" | tail -n 50
    
    echo -e "\n${GREEN}[Error logs from Redis]${NC}"
    docker logs "$REDIS_CONTAINER" 2>&1 | grep -i "error\|warning" | tail -n 50
}

# Main loop
while true; do
    show_menu
    echo -n "Select an option: "
    read choice
    
    case $choice in
        1) view_game_logs ;;
        2) view_mysql_logs ;;
        3) view_redis_logs ;;
        4) follow_game_logs ;;
        5) follow_mysql_logs ;;
        6) follow_redis_logs ;;
        7) search_logs ;;
        8) show_recent_logs ;;
        9) show_error_logs ;;
        0) echo "Exiting..."; exit 0 ;;
        *) echo -e "${RED}Invalid option. Please try again.${NC}" ;;
    esac
    
    if [ "$choice" != "4" ] && [ "$choice" != "5" ] && [ "$choice" != "6" ]; then
        echo -e "\n${YELLOW}Press Enter to continue...${NC}"
        read
    fi
    
    clear
done