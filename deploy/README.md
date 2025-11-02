# Game Server Deployment Guide

This directory contains automated deployment scripts for deploying the game server to AWS Linux EC2.

## Prerequisites

1. AWS EC2 instance running Amazon Linux
2. SSH access to the server (IP: 18.136.104.5)
3. PEM key file at: `/Users/qiankunxiao/Documents/密钥/aws-shaw.pem`
4. Local Node.js and npm installed for building the project

## Deployment Scripts

### 1. deploy.sh
Main deployment script that orchestrates the entire deployment process.

### 2. setup-mysql.sh
Sets up MySQL 5.7 in a Docker container with:
- Default database: `game_db`
- Default user: `game_user` (password: `Game@123456`)
- Root password: `GameServer@2024`
- Port: 3306

### 3. setup-redis.sh
Sets up Redis 5.0 in a Docker container with:
- Password: `Redis@Game2024`
- Port: 6379
- Persistence enabled (AOF + RDB)

### 4. service-manager.sh
Manages the game server service:
- `start` - Start the game server
- `stop` - Stop the game server
- `restart` - Restart the game server
- `status` - Show service status
- `logs` - Follow service logs

### 5. env-config.sh
Creates environment configuration files:
- `.env` file with environment variables
- Database configurations (MySQL, Redis)
- Server configurations

### 6. view-logs.sh
Interactive log viewer for:
- Game server logs
- MySQL container logs
- Redis container logs
- Error log filtering
- Log searching

## Quick Deployment

1. Make the deployment script executable:
```bash
chmod +x deploy/deploy.sh
```

2. Run the deployment:
```bash
cd /Users/qiankunxiao/Documents/backService
./deploy/deploy.sh
```

## Post-Deployment

After deployment, you can:

1. **Check service status:**
```bash
ssh -i /Users/qiankunxiao/Documents/密钥/aws-shaw.pem root@18.136.104.5 'cd /opt/game-server/scripts && ./service-manager.sh status'
```

2. **View logs:**
```bash
ssh -i /Users/qiankunxiao/Documents/密钥/aws-shaw.pem root@18.136.104.5 'cd /opt/game-server/scripts && ./view-logs.sh'
```

3. **Restart service:**
```bash
ssh -i /Users/qiankunxiao/Documents/密钥/aws-shaw.pem root@18.136.104.5 'cd /opt/game-server/scripts && ./service-manager.sh restart'
```

## Security Notes

1. **Change default passwords** in production:
   - MySQL passwords in `setup-mysql.sh`
   - Redis password in `setup-redis.sh`
   - Admin password in `env-config.sh`

2. **Update firewall rules** on AWS:
   - Port 3010: Game server (public)
   - Port 3306: MySQL (private, only localhost)
   - Port 6379: Redis (private, only localhost)

## Troubleshooting

1. **Connection refused:**
   - Check AWS security groups
   - Verify Docker containers are running
   - Check service logs

2. **Service won't start:**
   - Check MySQL and Redis containers: `docker ps`
   - Review logs: `./view-logs.sh`
   - Verify environment configuration

3. **Database connection errors:**
   - Check connection info in `/opt/game-server/mysql-connection.txt`
   - Verify MySQL container is running
   - Test connection: `docker exec -it game-mysql mysql -ugame_user -pGame@123456`

## Manual Commands

**SSH to server:**
```bash
ssh -i /Users/qiankunxiao/Documents/密钥/aws-shaw.pem root@18.136.104.5
```

**Check Docker containers:**
```bash
docker ps -a
```

**Access MySQL:**
```bash
docker exec -it game-mysql mysql -ugame_user -pGame@123456 game_db
```

**Access Redis:**
```bash
docker exec -it game-redis redis-cli -a Redis@Game2024
```