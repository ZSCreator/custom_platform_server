#!/bin/bash

# Backup and Restore Script for Game Server

set -e

# Configuration
SERVER_IP="18.136.104.5"
SERVER_USER="ec2-user"
PEM_KEY="/Users/qiankunxiao/Documents/密钥/aws-shaw.pem"
REMOTE_DIR="/data/game-server"
LOCAL_BACKUP_DIR="./backups"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[BACKUP]${NC} $1"
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

# Create local backup directory
mkdir -p "$LOCAL_BACKUP_DIR"

# SSH execution
remote_exec() {
    ssh -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# SCP copy from remote
remote_download() {
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP:$1" "$2"
}

# SCP copy to remote
remote_upload() {
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no "$1" "$SERVER_USER@$SERVER_IP:$2"
}

# Full backup function
full_backup() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_NAME="full_backup_${TIMESTAMP}"
    
    log_info "Creating full backup: $BACKUP_NAME"
    
    # Create remote backup
    remote_exec "
        sudo mkdir -p /data/game-server/backups
        
        # Create backup directory
        sudo mkdir -p /tmp/$BACKUP_NAME
        
        # Backup application code
        sudo tar -czf /tmp/$BACKUP_NAME/code.tar.gz -C /data/game-server dist app package.json
        
        # Backup configuration
        sudo tar -czf /tmp/$BACKUP_NAME/config.tar.gz -C /data/game-server .env dist/config
        
        # Backup MySQL database
        sudo docker exec game-mysql mysqldump -uroot -pGameServer@2024 --all-databases > /tmp/$BACKUP_NAME/mysql_dump.sql
        sudo gzip /tmp/$BACKUP_NAME/mysql_dump.sql
        
        # Backup Redis data
        sudo docker exec game-redis redis-cli -a Redis@Game2024 BGSAVE
        sleep 2
        sudo docker cp game-redis:/data/dump.rdb /tmp/$BACKUP_NAME/redis_dump.rdb
        
        # Create final archive
        cd /tmp
        sudo tar -czf $BACKUP_NAME.tar.gz $BACKUP_NAME/
        sudo mv $BACKUP_NAME.tar.gz /data/game-server/backups/
        sudo rm -rf /tmp/$BACKUP_NAME
        
        echo 'Backup created: /data/game-server/backups/$BACKUP_NAME.tar.gz'
    "
    
    # Download backup to local
    log_info "Downloading backup to local..."
    remote_download "$REMOTE_DIR/backups/$BACKUP_NAME.tar.gz" "$LOCAL_BACKUP_DIR/"
    
    log_info "Full backup completed: $LOCAL_BACKUP_DIR/$BACKUP_NAME.tar.gz"
}

# Database only backup
database_backup() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_NAME="db_backup_${TIMESTAMP}"
    
    log_info "Creating database backup: $BACKUP_NAME"
    
    remote_exec "
        sudo mkdir -p $REMOTE_DIR/backups
        
        # Backup MySQL
        sudo docker exec game-mysql mysqldump -uroot -pGameServer@2024 game_db > /tmp/mysql_${TIMESTAMP}.sql
        sudo gzip /tmp/mysql_${TIMESTAMP}.sql
        sudo mv /tmp/mysql_${TIMESTAMP}.sql.gz $REMOTE_DIR/backups/
        
        # Backup Redis
        sudo docker exec game-redis redis-cli -a Redis@Game2024 BGSAVE
        sleep 2
        sudo docker cp game-redis:/data/dump.rdb $REMOTE_DIR/backups/redis_${TIMESTAMP}.rdb
    "
    
    # Download to local
    log_info "Downloading database backups..."
    remote_download "$REMOTE_DIR/backups/mysql_${TIMESTAMP}.sql.gz" "$LOCAL_BACKUP_DIR/"
    remote_download "$REMOTE_DIR/backups/redis_${TIMESTAMP}.rdb" "$LOCAL_BACKUP_DIR/"
    
    log_info "Database backup completed"
}

# List backups
list_backups() {
    echo -e "${BLUE}=== Local Backups ===${NC}"
    if [ -d "$LOCAL_BACKUP_DIR" ] && [ "$(ls -A $LOCAL_BACKUP_DIR 2>/dev/null)" ]; then
        ls -lah "$LOCAL_BACKUP_DIR"
    else
        echo "No local backups found"
    fi
    
    echo -e "\n${BLUE}=== Remote Backups ===${NC}"
    remote_exec "ls -lah $REMOTE_DIR/backups 2>/dev/null || echo 'No remote backups found'"
}

# Restore backup
restore_backup() {
    list_backups
    
    echo -n -e "\n${YELLOW}Enter backup filename to restore: ${NC}"
    read backup_file
    
    if [ ! -f "$LOCAL_BACKUP_DIR/$backup_file" ]; then
        log_error "Backup file not found: $LOCAL_BACKUP_DIR/$backup_file"
        return
    fi
    
    log_warning "This will restore from backup: $backup_file"
    log_warning "Current data will be overwritten! Continue? (y/n)"
    read -r response
    
    if [[ "$response" != "y" ]]; then
        log_info "Restore cancelled"
        return
    fi
    
    log_info "Uploading backup file..."
    remote_upload "$LOCAL_BACKUP_DIR/$backup_file" "/tmp/"
    
    log_info "Restoring backup..."
    remote_exec "
        cd /tmp
        tar -xzf $backup_file
        BACKUP_DIR=\$(tar -tzf $backup_file | head -1 | cut -d/ -f1)
        
        # Stop server
        if [ -f $REMOTE_DIR/game-server.pid ]; then
            kill \$(cat $REMOTE_DIR/game-server.pid) 2>/dev/null || true
        fi
        
        # Restore code
        if [ -f \$BACKUP_DIR/code.tar.gz ]; then
            cd $REMOTE_DIR
            tar -xzf /tmp/\$BACKUP_DIR/code.tar.gz
        fi
        
        # Restore config
        if [ -f \$BACKUP_DIR/config.tar.gz ]; then
            cd $REMOTE_DIR
            tar -xzf /tmp/\$BACKUP_DIR/config.tar.gz
        fi
        
        # Restore MySQL
        if [ -f \$BACKUP_DIR/mysql_dump.sql.gz ]; then
            gunzip /tmp/\$BACKUP_DIR/mysql_dump.sql.gz
            docker exec -i game-mysql mysql -uroot -pGameServer@2024 < /tmp/\$BACKUP_DIR/mysql_dump.sql
        fi
        
        # Restore Redis
        if [ -f \$BACKUP_DIR/redis_dump.rdb ]; then
            docker cp /tmp/\$BACKUP_DIR/redis_dump.rdb game-redis:/data/dump.rdb
            docker restart game-redis
        fi
        
        # Cleanup
        rm -rf /tmp/\$BACKUP_DIR /tmp/$backup_file
    "
    
    log_info "Restore completed. Please start the server manually."
}

# Automated backup schedule
setup_auto_backup() {
    log_info "Setting up automated daily backups..."
    
    remote_exec "
        # Create backup script
        cat > $REMOTE_DIR/auto-backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
cd /home/ec2-user/game-server

# Keep only last 7 days of backups
find backups/ -name '*.tar.gz' -mtime +7 -delete 2>/dev/null || true

# Create database backup
docker exec game-mysql mysqldump -uroot -pGameServer@2024 game_db | gzip > backups/mysql_auto_\${TIMESTAMP}.sql.gz
docker exec game-redis redis-cli -a Redis@Game2024 BGSAVE
sleep 2
docker cp game-redis:/data/dump.rdb backups/redis_auto_\${TIMESTAMP}.rdb

echo \"Auto backup completed: \${TIMESTAMP}\"
EOF
        
        chmod +x $REMOTE_DIR/auto-backup.sh
        
        # Setup cron job
        (crontab -l 2>/dev/null; echo '0 2 * * * $REMOTE_DIR/auto-backup.sh >> $REMOTE_DIR/logs/backup.log 2>&1') | crontab -
    "
    
    log_info "Auto backup configured to run daily at 2:00 AM"
}

# Show menu
show_menu() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}    Backup & Restore Tool${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo "1) Full Backup (Code + DB + Config)"
    echo "2) Database Backup Only"
    echo "3) List Backups"
    echo "4) Restore from Backup"
    echo "5) Setup Automated Backups"
    echo "6) Download Remote Backups"
    echo "0) Exit"
    echo -e "${BLUE}========================================${NC}"
}

# Download remote backups
download_remote_backups() {
    log_info "Downloading all remote backups..."
    
    # Get list of remote backups
    REMOTE_BACKUPS=$(remote_exec "ls $REMOTE_DIR/backups 2>/dev/null || echo ''")
    
    if [ -z "$REMOTE_BACKUPS" ]; then
        log_warning "No remote backups found"
        return
    fi
    
    # Download each backup
    for backup in $REMOTE_BACKUPS; do
        if [ ! -f "$LOCAL_BACKUP_DIR/$backup" ]; then
            log_info "Downloading: $backup"
            remote_download "$REMOTE_DIR/backups/$backup" "$LOCAL_BACKUP_DIR/"
        else
            log_info "Already exists locally: $backup"
        fi
    done
    
    log_info "Download completed"
}

# Main
if [ "$1" ]; then
    case "$1" in
        full) full_backup ;;
        db) database_backup ;;
        list) list_backups ;;
        restore) restore_backup ;;
        auto) setup_auto_backup ;;
        download) download_remote_backups ;;
        *) 
            echo "Usage: $0 {full|db|list|restore|auto|download}"
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
            1) full_backup ;;
            2) database_backup ;;
            3) list_backups ;;
            4) restore_backup ;;
            5) setup_auto_backup ;;
            6) download_remote_backups ;;
            0) echo "Exiting..."; exit 0 ;;
            *) log_error "Invalid option" ;;
        esac
        
        echo -e "\n${YELLOW}Press Enter to continue...${NC}"
        read
        clear
    done
fi