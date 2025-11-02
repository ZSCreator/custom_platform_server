#!/bin/bash

# Server Monitoring Script for Game Server

set -e

# Configuration
SERVER_IP="18.136.104.5"
SERVER_USER="ec2-user"
PEM_KEY="/Users/qiankunxiao/Documents/密钥/aws-shaw.pem"
REMOTE_DIR="/data/game-server"

# Monitoring thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[MONITOR]${NC} $1"
}

log_error() {
    echo -e "${RED}[ALERT]${NC} $1"
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

# SSH execution
remote_exec() {
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Real-time monitoring
realtime_monitor() {
    log_info "Starting real-time monitoring (Ctrl+C to stop)..."
    
    while true; do
        clear
        echo -e "${BLUE}===== Game Server Monitor - $(date) =====${NC}\n"
        
        # Server info
        echo -e "${GREEN}=== Server Information ===${NC}"
        remote_exec "uname -n && uptime"
        
        # CPU usage
        echo -e "\n${GREEN}=== CPU Usage ===${NC}"
        remote_exec "top -bn1 | head -5"
        
        # Memory usage
        echo -e "\n${GREEN}=== Memory Usage ===${NC}"
        remote_exec "free -h"
        
        # Disk usage
        echo -e "\n${GREEN}=== Disk Usage ===${NC}"
        remote_exec "df -h | grep -E '^/dev/|Filesystem'"
        
        # Process status
        echo -e "\n${GREEN}=== Game Server Process ===${NC}"
        remote_exec "
            if [ -f $REMOTE_DIR/game-server.pid ]; then
                PID=\$(cat $REMOTE_DIR/game-server.pid)
                if ps -p \$PID > /dev/null; then
                    ps -p \$PID -o pid,ppid,%cpu,%mem,etime,cmd
                else
                    echo 'Game Server: NOT RUNNING'
                fi
            else
                echo 'Game Server: NOT RUNNING (no PID file)'
            fi
        "
        
        # Docker containers
        echo -e "\n${GREEN}=== Docker Containers ===${NC}"
        remote_exec "docker stats --no-stream --format 'table {{.Container}}\t{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}' | grep -E 'game-mysql|game-redis|CONTAINER'"
        
        # Network connections
        echo -e "\n${GREEN}=== Network Connections ===${NC}"
        remote_exec "netstat -tn | grep -E ':3010|:3306|:6379' | awk '{print \$5}' | cut -d: -f1 | sort | uniq -c | sort -nr | head -10"
        
        sleep 5
    done
}

# Health check with alerts
health_check() {
    log_info "Performing health check..."
    
    ALERTS=0
    
    # Check CPU usage
    CPU_USAGE=$(remote_exec "top -bn1 | grep 'Cpu(s)' | awk '{print \$2}' | cut -d'%' -f1 | cut -d'.' -f1")
    if [ "$CPU_USAGE" -gt "$CPU_THRESHOLD" ]; then
        log_error "High CPU usage: ${CPU_USAGE}% (threshold: ${CPU_THRESHOLD}%)"
        ALERTS=$((ALERTS + 1))
    else
        log_info "CPU usage: ${CPU_USAGE}% - OK"
    fi
    
    # Check memory usage
    MEMORY_USAGE=$(remote_exec "free | grep Mem | awk '{print int(\$3/\$2 * 100)}'")
    if [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ]; then
        log_error "High memory usage: ${MEMORY_USAGE}% (threshold: ${MEMORY_THRESHOLD}%)"
        ALERTS=$((ALERTS + 1))
    else
        log_info "Memory usage: ${MEMORY_USAGE}% - OK"
    fi
    
    # Check disk usage
    DISK_USAGE=$(remote_exec "df -h / | awk 'NR==2 {print \$5}' | sed 's/%//'")
    if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
        log_error "High disk usage: ${DISK_USAGE}% (threshold: ${DISK_THRESHOLD}%)"
        ALERTS=$((ALERTS + 1))
    else
        log_info "Disk usage: ${DISK_USAGE}% - OK"
    fi
    
    # Check game server process
    if ! remote_exec "[ -f $REMOTE_DIR/game-server.pid ] && ps -p \$(cat $REMOTE_DIR/game-server.pid) > /dev/null 2>&1"; then
        log_error "Game server is NOT running!"
        ALERTS=$((ALERTS + 1))
    else
        log_info "Game server is running - OK"
    fi
    
    # Check MySQL
    if ! remote_exec "docker exec game-mysql mysql -ugame_user -pGame@123456 -e 'SELECT 1' &>/dev/null"; then
        log_error "MySQL is NOT responding!"
        ALERTS=$((ALERTS + 1))
    else
        log_info "MySQL is healthy - OK"
    fi
    
    # Check Redis
    if ! remote_exec "docker exec game-redis redis-cli -a Redis@Game2024 ping | grep -q PONG"; then
        log_error "Redis is NOT responding!"
        ALERTS=$((ALERTS + 1))
    else
        log_info "Redis is healthy - OK"
    fi
    
    # Summary
    echo ""
    if [ $ALERTS -eq 0 ]; then
        echo -e "${GREEN}Health check passed - All systems operational${NC}"
    else
        echo -e "${RED}Health check failed - $ALERTS alert(s) found${NC}"
    fi
    
    return $ALERTS
}

# Performance report
performance_report() {
    log_info "Generating performance report..."
    
    REPORT_FILE="performance_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Game Server Performance Report"
        echo "Generated: $(date)"
        echo "Server: $SERVER_IP"
        echo "=================================="
        echo ""
        
        echo "=== System Information ==="
        remote_exec "uname -a"
        echo ""
        
        echo "=== Uptime ==="
        remote_exec "uptime"
        echo ""
        
        echo "=== CPU Information ==="
        remote_exec "lscpu | grep -E 'Model name|CPU\(s\)|Thread|Core'"
        echo ""
        
        echo "=== Memory Information ==="
        remote_exec "free -h"
        echo ""
        
        echo "=== Disk Usage ==="
        remote_exec "df -h"
        echo ""
        
        echo "=== Top Processes by CPU ==="
        remote_exec "ps aux --sort=-%cpu | head -10"
        echo ""
        
        echo "=== Top Processes by Memory ==="
        remote_exec "ps aux --sort=-%mem | head -10"
        echo ""
        
        echo "=== Docker Container Stats ==="
        remote_exec "docker stats --no-stream"
        echo ""
        
        echo "=== Network Statistics ==="
        remote_exec "netstat -s | grep -E 'active connections|failed connection|segments sent|segments received'"
        echo ""
        
        echo "=== Recent Errors in Game Server Log ==="
        remote_exec "grep -i error $REMOTE_DIR/logs/game-server.log | tail -20 || echo 'No recent errors found'"
        echo ""
        
    } > "$REPORT_FILE"
    
    log_info "Performance report saved to: $REPORT_FILE"
}

# Log analysis
analyze_logs() {
    log_info "Analyzing game server logs..."
    
    echo -e "\n${GREEN}=== Error Summary ===${NC}"
    remote_exec "
        if [ -f $REMOTE_DIR/logs/game-server.log ]; then
            echo 'Total errors: '\$(grep -i error $REMOTE_DIR/logs/game-server.log | wc -l)
            echo ''
            echo 'Error types:'
            grep -i error $REMOTE_DIR/logs/game-server.log | awk '{for(i=1;i<=NF;i++) if(\$i ~ /error/i) print \$i}' | sort | uniq -c | sort -nr | head -10
        else
            echo 'Log file not found'
        fi
    "
    
    echo -e "\n${GREEN}=== Request Statistics ===${NC}"
    remote_exec "
        if [ -f $REMOTE_DIR/logs/game-server.log ]; then
            echo 'Total requests: '\$(grep -E 'GET|POST|PUT|DELETE' $REMOTE_DIR/logs/game-server.log | wc -l)
            echo ''
            echo 'Requests by type:'
            grep -E 'GET|POST|PUT|DELETE' $REMOTE_DIR/logs/game-server.log | awk '{print \$6}' | sort | uniq -c | sort -nr | head -10
        fi
    "
    
    echo -e "\n${GREEN}=== Performance Warnings ===${NC}"
    remote_exec "
        if [ -f $REMOTE_DIR/logs/game-server.log ]; then
            grep -E 'slow|timeout|performance' $REMOTE_DIR/logs/game-server.log | tail -10 || echo 'No performance warnings found'
        fi
    "
}

# Setup monitoring alerts
setup_alerts() {
    log_info "Setting up monitoring alerts..."
    
    remote_exec "
        # Create monitoring script
        cat > $REMOTE_DIR/monitor-alert.sh << 'EOF'
#!/bin/bash

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90

# Check functions
check_cpu() {
    top -bn1 | grep 'Cpu(s)' | awk '{print \$2}' | cut -d'%' -f1 | cut -d'.' -f1
}

check_memory() {
    free | grep Mem | awk '{print int(\$3/\$2 * 100)}'
}

check_disk() {
    df -h / | awk 'NR==2 {print \$5}' | sed 's/%//'
}

# Log alert
log_alert() {
    echo \"\$(date): ALERT - \$1\" >> /home/ec2-user/game-server/logs/alerts.log
}

# Run checks
CPU=\$(check_cpu)
MEMORY=\$(check_memory)
DISK=\$(check_disk)

# Generate alerts
[ \$CPU -gt \$CPU_THRESHOLD ] && log_alert \"High CPU usage: \${CPU}%\"
[ \$MEMORY -gt \$MEMORY_THRESHOLD ] && log_alert \"High memory usage: \${MEMORY}%\"
[ \$DISK -gt \$DISK_THRESHOLD ] && log_alert \"High disk usage: \${DISK}%\"

# Check if game server is running
if [ -f /home/ec2-user/game-server/game-server.pid ]; then
    PID=\$(cat /home/ec2-user/game-server/game-server.pid)
    if ! ps -p \$PID > /dev/null; then
        log_alert \"Game server is not running!\"
        # Auto-restart (optional)
        # cd /home/ec2-user/game-server && nohup npm run start:production > logs/game-server.log 2>&1 & echo \$! > game-server.pid
    fi
fi
EOF
        
        chmod +x $REMOTE_DIR/monitor-alert.sh
        
        # Setup cron job to run every 5 minutes
        (crontab -l 2>/dev/null; echo '*/5 * * * * $REMOTE_DIR/monitor-alert.sh') | crontab -
    "
    
    log_info "Monitoring alerts configured to run every 5 minutes"
    log_info "Alerts will be logged to: $REMOTE_DIR/logs/alerts.log"
}

# Show menu
show_menu() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    Server Monitoring Tool${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo "1) Real-time Monitor"
    echo "2) Health Check"
    echo "3) Performance Report"
    echo "4) Analyze Logs"
    echo "5) Setup Alert Monitoring"
    echo "6) View Recent Alerts"
    echo "0) Exit"
    echo -e "${BLUE}========================================${NC}"
}

# View recent alerts
view_alerts() {
    log_info "Recent monitoring alerts:"
    remote_exec "
        if [ -f $REMOTE_DIR/logs/alerts.log ]; then
            tail -50 $REMOTE_DIR/logs/alerts.log
        else
            echo 'No alerts log found'
        fi
    "
}

# Main
if [ "$1" ]; then
    case "$1" in
        monitor) realtime_monitor ;;
        health) health_check ;;
        report) performance_report ;;
        logs) analyze_logs ;;
        alerts) setup_alerts ;;
        view-alerts) view_alerts ;;
        *) 
            echo "Usage: $0 {monitor|health|report|logs|alerts|view-alerts}"
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
            1) realtime_monitor ;;
            2) health_check ;;
            3) performance_report ;;
            4) analyze_logs ;;
            5) setup_alerts ;;
            6) view_alerts ;;
            0) echo "Exiting..."; exit 0 ;;
            *) log_error "Invalid option" ;;
        esac
        
        if [ "$choice" != "1" ]; then
            echo -e "\n${YELLOW}Press Enter to continue...${NC}"
            read
        fi
        
        clear
    done
fi