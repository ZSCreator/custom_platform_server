#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const RedisManager = require("../../app/dao/dbManager/redisManager");
const OnlineGameHashDao_1 = require("../../app/common/dao/redis/OnlineGameHashDao");
const doJob = async () => {
    await DatabaseService.getRedisClient();
    console.log('__CONN init complete__');
    const hash = await OnlineGameHashDao_1.findAll();
    const allUid = {};
    const sceneUid = {};
    const roomUid = {};
    const sceneTotal = {};
    const sceneRedisKey = await RedisManager.getKeysSatisfyPattern("hall:scenes:*");
    for (let sceneKey of sceneRedisKey) {
        const hashKeys = await RedisManager.getHashTableKeys(sceneKey);
        for (let hashKey of hashKeys) {
            const sceneObject = await RedisManager.getFromHashTable(sceneKey, hashKey);
            const users = sceneObject.data.players;
            for (let user of users) {
                if (!Object.keys(hash).includes(user.uid)) {
                    console.log(`Scene 发现僵尸玩家 ${sceneKey} ${hashKey} ${user.uid} ${user.isRobot} ${user.sid}`);
                    if (sceneTotal[sceneKey]) {
                        sceneTotal[sceneKey] += 1;
                    }
                    else {
                        sceneTotal[sceneKey] = 1;
                    }
                    allUid[user.uid] = 1;
                    sceneUid[user.uid] = 1;
                }
            }
        }
    }
    console.log(`----------------------------------`);
    const roomTotal = {};
    const roomRedistKeys = await RedisManager.getKeysSatisfyPattern("hall:rooms:*");
    for (let roomKey of roomRedistKeys) {
        const hashKeys = await RedisManager.getHashTableKeys(roomKey);
        for (let hashKey of hashKeys) {
            const roomObject = await RedisManager.getFromHashTable(roomKey, hashKey);
            const users = roomObject.data.users;
            for (let user of users) {
                if (!Object.keys(hash).includes(user.uid)) {
                    console.log(`Room 发现僵尸玩家 ${roomKey} ${hashKey} ${user.uid} ${user.isRobot} ${user.sid}`);
                    if (roomTotal[roomKey]) {
                        roomTotal[roomKey] += 1;
                    }
                    else {
                        roomTotal[roomKey] = 1;
                    }
                    allUid[user.uid] = 1;
                    roomUid[user.uid] = 1;
                }
            }
        }
    }
    console.log(`----------------------------------`);
    let sceneSum = 0;
    for (let k of Object.keys(sceneTotal)) {
        console.log(`${k}\t发现僵尸玩家 => ${sceneTotal[k]}`);
        sceneSum += sceneTotal[k];
    }
    console.log(`Scene Total => ${sceneSum}\tUnique => ${Object.keys(sceneUid).length} `);
    let roomSum = 0;
    console.log();
    for (let k of Object.keys(roomTotal)) {
        console.log(`${k}\t发现僵尸玩家 => ${roomTotal[k]}`);
        roomSum += roomTotal[k];
    }
    console.log(`Room Total => ${roomSum}\tUnique => ${Object.keys(roomUid).length} `);
    console.log(`\nUnique Total => ${Object.keys(allUid).length}`);
    console.log('__完成__');
    process.exit();
};
doJob();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZERlYWRSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3JvYm90L2ZpbmREZWFkUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsc0VBQXVFO0FBQ3ZFLHFFQUFzRTtBQUN0RSxvRkFBdUU7QUFDdkUsTUFBTSxLQUFLLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFFckIsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBR3RDLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQU8sRUFBRSxDQUFDO0lBRTdCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNsQixNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDcEIsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBS25CLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN0QixNQUFNLGFBQWEsR0FBRyxNQUFNLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoRixLQUFLLElBQUksUUFBUSxJQUFJLGFBQWEsRUFBRTtRQUNoQyxNQUFNLFFBQVEsR0FBRyxNQUFNLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvRCxLQUFLLElBQUksT0FBTyxJQUFJLFFBQVEsRUFBRTtZQUMxQixNQUFNLFdBQVcsR0FBRyxNQUFNLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0UsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFFdkMsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JB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