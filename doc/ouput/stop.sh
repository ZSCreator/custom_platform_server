#!/bin/bash

GAME_BASE='/data/app/game-server/dist/app.js'

# 先停止Connector
echo __关闭连接__
ps -ef | grep "${GAME_BASE}"  | grep 'id=connector-server-1 host' | awk '{print $2}' | xargs kill -9 2>/dev/null
sleep 90

# 再关闭服务
echo __停止服务__
timeout 20 /data/app/node/bin/pinus stop -P 3008 -u admin -p admin

# 最后Kill掉服务
echo __杀死服务__
ps -ef | grep "${GAME_BASE}"  | awk '{print $2}' | xargs kill -9  2>/dev/null

# 结束
echo __停止完成__
