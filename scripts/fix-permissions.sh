#!/bin/bash

# Fix permissions and logging configuration for Game Server

set -e

# Configuration
SERVER_IP="18.136.104.5"
SERVER_USER="ec2-user"
PEM_KEY="/Users/qiankunxiao/Documents/密钥/aws-shaw.pem"
REMOTE_DIR="/data/game-server"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[FIX]${NC} $1"
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

log_info "Fixing permissions and logging configuration..."

# Fix permissions and create log directories
remote_exec "
    # Create logs directories with proper permissions
    sudo mkdir -p /data/logs
    sudo chown -R root:root /data/logs
    sudo chmod -R 755 /data/logs
    
    # Also create logs in project directory
    sudo mkdir -p $REMOTE_DIR/logs
    sudo chmod 755 $REMOTE_DIR/logs
    sudo chown -R root:root $REMOTE_DIR/logs
    
    # Create symbolic link from /data/logs to project logs (optional)
    if [ ! -L /data/logs/game-server ]; then
        sudo ln -sf $REMOTE_DIR/logs /data/logs/game-server
    fi
"

# Update log4js configuration to use relative paths
log_info "Updating logging configuration..."

remote_exec "
    cd $REMOTE_DIR
    
    # Check if log4js config exists and update it
    find . -name '*.json' -o -name '*.js' | xargs grep -l 'log4js\\|/data/logs' | while read file; do
        echo \"Updating log paths in: \$file\"
        # Backup original file
        cp \"\$file\" \"\$file.backup\"
        # Replace absolute paths with relative paths
        sed -i 's|/data/logs|./logs|g' \"\$file\"
    done
    
    # Look for pinus log configuration
    if [ -f dist/config/log4js.json ]; then
        echo 'Updating pinus log configuration'
        cp dist/config/log4js.json dist/config/log4js.json.backup
        cat > dist/config/log4js.json << 'EOF'
{
  \"appenders\": {
    \"console\": {
      \"type\": \"console\"
    },
    \"file\": {
      \"type\": \"dateFile\",
      \"filename\": \"./logs/game-server\",
      \"pattern\": \"_yyyy-MM-dd.log\",
      \"alwaysIncludePattern\": true,
      \"maxLogSize\": 104857600,
      \"backups\": 10
    },
    \"errorFile\": {
      \"type\": \"dateFile\",
      \"filename\": \"./logs/error\",
      \"pattern\": \"_yyyy-MM-dd.log\",
      \"alwaysIncludePattern\": true,
      \"maxLogSize\": 104857600,
      \"backups\": 10,
      \"level\": \"error\"
    }
  },
  \"categories\": {
    \"default\": {
      \"appenders\": [\"console\", \"file\"],
      \"level\": \"info\"
    },
    \"error\": {
      \"appenders\": [\"console\", \"errorFile\"],
      \"level\": \"error\"
    }
  }
}
EOF
    fi
    
    # Check if there's a master log configuration
    if [ -f dist/config/master.json ]; then
        echo 'Checking master.json for log configuration'
        # Remove any absolute log paths
        sed -i 's|/data/logs|./logs|g' dist/config/master.json
    fi
    
    # Check servers configuration
    if [ -f dist/config/servers.json ]; then
        echo 'Checking servers.json for log configuration'
        sed -i 's|/data/logs|./logs|g' dist/config/servers.json
    fi
"

# Create a proper log configuration if it doesn't exist
log_info "Creating proper log configuration..."

remote_exec "
    cd $REMOTE_DIR
    
    # Create log4js configuration if it doesn't exist
    mkdir -p dist/config
    
    if [ ! -f dist/config/log4js.json ]; then
        cat > dist/config/log4js.json << 'EOF'
{
  \"appenders\": {
    \"console\": {
      \"type\": \"console\"
    },
    \"file\": {
      \"type\": \"dateFile\",
      \"filename\": \"./logs/game-server\",
      \"pattern\": \"_yyyy-MM-dd.log\",
      \"alwaysIncludePattern\": true,
      \"maxLogSize\": 104857600,
      \"backups\": 10
    },
    \"errorFile\": {
      \"type\": \"dateFile\",
      \"filename\": \"./logs/error\",
      \"pattern\": \"_yyyy-MM-dd.log\",
      \"alwaysIncludePattern\": true,
      \"maxLogSize\": 104857600,
      \"backups\": 10,
      \"level\": \"error\"
    }
  },
  \"categories\": {
    \"default\": {
      \"appenders\": [\"console\", \"file\"],
      \"level\": \"info\"
    },
    \"error\": {
      \"appenders\": [\"console\", \"errorFile\"],
      \"level\": \"error\"
    }
  }
}
EOF
    fi
"

# Update environment variables to fix circular dependency warning
log_info "Updating environment configuration..."

remote_exec "
    cd $REMOTE_DIR
    
    # Update .env file to suppress warnings
    if [ -f .env ]; then
        # Add Node.js options to suppress warnings
        if ! grep -q 'NODE_OPTIONS' .env; then
            echo 'NODE_OPTIONS=--no-warnings' >> .env
        fi
        
        # Set proper log directory
        if ! grep -q 'LOG_DIR' .env; then
            echo 'LOG_DIR=./logs' >> .env
        fi
    fi
"

# Fix any ownership issues
log_info "Fixing file ownership..."

remote_exec "
    cd $REMOTE_DIR
    
    # Ensure all files are owned by root
    sudo chown -R root:root .
    
    # Set proper permissions
    sudo chmod -R 755 .
    sudo chmod -R 644 *.json 2>/dev/null || true
    sudo chmod 755 *.sh 2>/dev/null || true
"

log_info "Permissions and logging configuration fixed!"
log_info "You can now try starting the server again:"
log_info "  ./server-manage.sh start"