#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const RedisManager = require("../../app/dao/dbManager/redisManager");
const OnlineGameHashDao_1 = require("../../app/common/dao/redis/OnlineGameHashDao");
const doJob = async (nid) => {
    await DatabaseService.getRedisClient();
    let keys = await RedisManager.getKeysSatisfyPattern("robot_player_info:*");
    console.log(`缓存机器人 ${keys.length}`);
    const hash = await OnlineGameHashDao_1.findAll();
    const gameField = {};
    let count = 0;
    for (let uid of Object.keys(hash)) {
        let object = await OnlineGameHashDao_1.findByUid(uid);
        if (object && object.nid === nid && object.isRobot === 2) {
            count++;
            if (gameField[object.sceneId]) {
                if (gameField[object.sceneId][object.roomId]) {
                    gameField[object.sceneId][object.roomId].push(uid);
                }
                else {
                    gameField[object.sceneId][object.roomId] = [uid];
                }
            }
            else {
                gameField[object.sceneId] = {};
                gameField[object.sceneId][object.roomId] = [uid];
            }
        }
    }
    const goldMap = {};
    for (let k of keys) {
        let v = await RedisManager.getObjectFromRedis(k);
        if (!v) {
            console.error(`Redis读取失败 ${k} ${v}`);
            continue;
        }
        goldMap[v.data.uid] = Math.floor(v.data.gold / 100);
    }
    console.log(`游戏:${nid} 人数:${count}`);
    for (let sceneId of Object.keys(gameField)) {
        console.log(`\t场:${sceneId}`);
        const rooms = gameField[sceneId];
        for (let roomId of Object.keys(rooms)) {
            console.log(`\t\t房:${roomId}`);
            const uids = rooms[roomId];
            uids.forEach(uid => {
                console.log(`\t\t\t${uid}  ${goldMap[uid]}`);
            });
        }
    }
    console.log(`任务完成`);
    process.exit();
};
if (!process.argv[2]) {
    console.error('请输入NID');
    process.exit(100);
}
doJob(process.argv[2]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlSb2JvdEdvbGRCeU5pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3JvYm90L3F1ZXJ5Um9ib3RHb2xkQnlOaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsc0VBQXVFO0FBQ3ZFLHFFQUFzRTtBQUN0RSxvRkFBa0Y7QUFFbEYsTUFBTSxLQUFLLEdBQUcsS0FBSyxFQUFFLEdBQVcsRUFBRSxFQUFFO0lBRWhDLE1BQU0sZUFBZSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3ZDLElBQUksSUFBSSxHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBRXBDLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQU8sRUFBRSxDQUFBO0lBQzVCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUNyQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFFZCxLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDL0IsSUFBSSxNQUFNLEdBQUcsTUFBTSw2QkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUFFO1lBQ3RELEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMzQixJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUMxQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7aUJBQ3JEO3FCQUFNO29CQUNILFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3BEO2FBQ0o7aUJBQU07Z0JBQ0gsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUE7Z0JBQzlCLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDcEQ7U0FDSjtLQUNKO0lBR0QsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO1FBQ2hCLElBQUksQ0FBQyxHQUFHLE1BQU0sWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDSixPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckMsU0FBUztTQUNaO1FBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztLQUN2RDtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLE9BQU8sS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNyQyxLQUFLLElBQUksT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFFN0IsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pDLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsTUFBTSxFQUFFLENBQUMsQ0FBQTtZQUM5QixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDZixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakQsQ0FBQyxDQUFDLENBQUM7U0FDTjtLQUNKO0lBYUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBRUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3JCO0FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyJ9