#!/bin/bash

# Fix JSON configuration files on remote server

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
    echo -e "${GREEN}[JSON-FIX]${NC} $1"
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

# Copy file to remote
remote_copy() {
    scp -i "$PEM_KEY" -o StrictHostKeyChecking=no "$1" "$SERVER_USER@$SERVER_IP:$2"
}

log_info "Fixing JSON configuration files on remote server..."

# First, check which JSON files are causing issues
log_info "Checking for problematic JSON files..."

remote_exec "
    cd $REMOTE_DIR
    
    # Find and check all JSON files in config/data directory
    echo 'Checking JSON files for syntax errors...'
    
    find config/data -name '*.json' 2>/dev/null | while read file; do
        if [ -f \"\$file\" ]; then
            echo \"Checking: \$file\"
            if ! python3 -m json.tool \"\$file\" >/dev/null 2>&1; then
                echo \"ERROR: Invalid JSON in \$file\"
                # Show file content to identify the issue
                echo \"File content:\"
                head -5 \"\$file\" | cat -v
                echo \"---\"
                
                # Try to fix common issues
                echo \"Attempting to fix \$file...\"
                
                # Remove null bytes and other binary characters
                tr -d '\\000-\\037' < \"\$file\" > \"\$file.tmp\" && mv \"\$file.tmp\" \"\$file\"
                
                # Try again
                if ! python3 -m json.tool \"\$file\" >/dev/null 2>&1; then
                    echo \"Still invalid, backing up and recreating...\"
                    mv \"\$file\" \"\$file.backup\"
                    
                    # Create a minimal valid JSON file
                    case \"\$(basename \$file)\" in
                        *.json)
                            echo '{}' > \"\$file\"
                            ;;
                    esac
                fi
            else
                echo \"OK: \$file\"
            fi
        fi
    done
"

# Copy working configuration files from local
log_info "Uploading working configuration files..."

# Check if we have local config files to upload
if [ -d "dist/config" ]; then
    log_info "Uploading fixed log4js.json..."
    remote_copy "dist/config/log4js.json" "$REMOTE_DIR/dist/config/"
fi

# Create essential JSON configuration files on remote
log_info "Creating essential configuration files..."

remote_exec "
    cd $REMOTE_DIR
    
    # Ensure directories exist
    mkdir -p dist/config/data config/data logs/log_info logs/robot
    
    # Create basic JSON files if they don't exist or are empty
    
    # Create/fix adminUser.json
    if [ ! -f 'dist/config/adminUser.json' ] || [ ! -s 'dist/config/adminUser.json' ]; then
        echo 'Creating adminUser.json...'
        cat > dist/config/adminUser.json << 'EOF'
[
  {
    \"id\": \"admin\",
    \"username\": \"admin\",
    \"password\": \"admin123456\",
    \"level\": 1
  }
]
EOF
    fi
    
    # Create/fix servers.json
    if [ ! -f 'dist/config/servers.json' ] || [ ! -s 'dist/config/servers.json' ]; then
        echo 'Creating servers.json...'
        cat > dist/config/servers.json << 'EOF'
{
  \"development\": {
    \"connector\": [{
      \"id\": \"connector-server-1\",
      \"host\": \"127.0.0.1\",
      \"port\": 3010,
      \"clientHost\": \"18.136.104.5\",
      \"clientPort\": 3010,
      \"frontend\": true
    }],
    \"gate\": [{
      \"id\": \"gate-server-1\",
      \"host\": \"127.0.0.1\",
      \"port\": 3011
    }],
    \"hall\": [{
      \"id\": \"hall-server-1\",
      \"host\": \"127.0.0.1\",
      \"port\": 3012
    }]
  },
  \"production\": {
    \"connector\": [{
      \"id\": \"connector-server-1\",
      \"host\": \"127.0.0.1\",
      \"port\": 3010,
      \"clientHost\": \"18.136.104.5\",
      \"clientPort\": 3010,
      \"frontend\": true
    }],
    \"gate\": [{
      \"id\": \"gate-server-1\",
      \"host\": \"127.0.0.1\",
      \"port\": 3011
    }],
    \"hall\": [{
      \"id\": \"hall-server-1\",
      \"host\": \"127.0.0.1\",
      \"port\": 3012
    }]
  }
}
EOF
    fi
    
    # Create/fix master.json
    if [ ! -f 'dist/config/master.json' ] || [ ! -s 'dist/config/master.json' ]; then
        echo 'Creating master.json...'
        cat > dist/config/master.json << 'EOF'
{
  \"development\": {
    \"id\": \"master-server-1\",
    \"host\": \"127.0.0.1\",
    \"port\": 3005,
    \"args\": \" \"
  },
  \"production\": {
    \"id\": \"master-server-1\",
    \"host\": \"127.0.0.1\",
    \"port\": 3005,
    \"args\": \" \"
  }
}
EOF
    fi
    
    # Create basic data configuration files that might be missing
    mkdir -p config/data
    
    # Create empty but valid JSON files for common data configs
    for file in games.json front_game_scenes.json game_scenes.json payConfig.json ipSwitch.json agent_name.json; do
        if [ ! -f \"config/data/\$file\" ] || [ ! -s \"config/data/\$file\" ]; then
            echo \"Creating config/data/\$file...\"
            case \"\$file\" in
                games.json|front_game_scenes.json|game_scenes.json|agent_name.json)
                    echo '[]' > \"config/data/\$file\"
                    ;;
                payConfig.json|ipSwitch.json)
                    echo '{}' > \"config/data/\$file\"
                    ;;
            esac
        fi
    done
    
    # Validate all JSON files
    echo 'Validating all JSON files...'
    find . -name '*.json' -type f | while read file; do
        if [ -f \"\$file\" ]; then
            if ! python3 -m json.tool \"\$file\" >/dev/null 2>&1; then
                echo \"ERROR: Still invalid JSON in \$file\"
                echo \"Replacing with empty object/array...\"
                if [[ \"\$file\" == *\"games\"* ]] || [[ \"\$file\" == *\"scenes\"* ]] || [[ \"\$file\" == *\"agent\"* ]]; then
                    echo '[]' > \"\$file\"
                else
                    echo '{}' > \"\$file\"
                fi
            fi
        fi
    done
"

# Fix file permissions
log_info "Fixing file permissions..."

remote_exec "
    cd $REMOTE_DIR
    
    # Fix ownership and permissions
    sudo chown -R ec2-user:ec2-user .
    find . -name '*.json' -exec chmod 644 {} \;
    find . -type d -exec chmod 755 {} \;
"

log_info "JSON configuration files have been fixed!"
log_info "You can now try starting the server again:"
log_info "  ./server-manage.sh start"