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
    const sceneIndex = {};
    const sceneTotal = {};
    const sceneHangTotal = {};
    const sceneRedisKey = await RedisManager.getKeysSatisfyPattern("hall:scenes:*");
    for (let sceneKey of sceneRedisKey) {
        let nid = sceneKey.replace('hall:scenes:', '');
        const hashKeys = await RedisManager.getHashTableKeys(sceneKey);
        for (let hashKey of hashKeys) {
            const sceneObject = await RedisManager.getFromHashTable(sceneKey, hashKey);
            const users = sceneObject.data.players;
            for (let user of users) {
                if (!Object.keys(hash).includes(user.uid)) {
                    console.log(`Scene 离线挂死 ${sceneKey} ${hashKey} ${user.uid} ${user.isRobot} ${user.sid}`);
                    if (sceneTotal[sceneKey]) {
                        sceneTotal[sceneKey] += 1;
                    }
                    else {
                        sceneTotal[sceneKey] = 1;
                    }
                    sceneIndex[sceneKey] = 1;
                    allUid[user.uid] = 1;
                    sceneUid[user.uid] = 1;
                }
                else if (nid !== hash[user.uid].nid) {
                    console.log(`Scene 在线错房 ${sceneKey} ${hashKey} ${user.uid} ${user.isRobot} ${user.sid}`);
                    if (sceneHangTotal[sceneKey]) {
                        sceneHangTotal[sceneKey] += 1;
                    }
                    else {
                        sceneHangTotal[sceneKey] = 1;
                    }
                    sceneIndex[sceneKey] = 1;
                    allUid[user.uid] = 1;
                    sceneUid[user.uid] = 1;
                }
            }
        }
    }
    console.log(`----------------------------------`);
    const roomIndex = {};
    const roomTotal = {};
    const roomHangTotal = {};
    const roomRedistKeys = await RedisManager.getKeysSatisfyPattern("hall:rooms:*");
    for (let roomKey of roomRedistKeys) {
        let nid = roomKey.replace('hall:rooms:', '');
        const hashKeys = await RedisManager.getHashTableKeys(roomKey);
        for (let hashKey of hashKeys) {
            const roomObject = await RedisManager.getFromHashTable(roomKey, hashKey);
            const users = roomObject.data.users;
            for (let user of users) {
                if (!Object.keys(hash).includes(user.uid)) {
                    console.log(`Room 离线挂死 ${roomKey} ${hashKey} ${user.uid} ${user.isRobot} ${user.sid}`);
                    if (roomTotal[roomKey]) {
                        roomTotal[roomKey] += 1;
                    }
                    else {
                        roomTotal[roomKey] = 1;
                    }
                    roomIndex[roomKey] = 1;
                    allUid[user.uid] = 1;
                    roomUid[user.uid] = 1;
                }
                else if (nid !== hash[user.uid].nid) {
                    console.log(`Room 在线错房 ${roomKey} ${hashKey} ${user.uid} ${user.isRobot} ${user.sid}`);
                    if (roomHangTotal[roomKey]) {
                        roomHangTotal[roomKey] += 1;
                    }
                    else {
                        roomHangTotal[roomKey] = 1;
                    }
                    roomIndex[roomKey] = 1;
                    allUid[user.uid] = 1;
                    roomUid[user.uid] = 1;
                }
            }
        }
    }
    console.log(`----------------------------------`);
    let sceneSum = 0;
    let sceneHangSum = 0;
    for (let k of Object.keys(sceneIndex)) {
        console.log(`${k}\t离线挂死 => ${sceneTotal[k] || 0} 在线错房 => ${sceneHangTotal[k] || 0} `);
        sceneSum += sceneTotal[k] || 0;
        sceneHangSum += sceneTotal[k] || 0;
    }
    console.log(`Scene 挂死玩家 => ${sceneSum}\t挂起玩家 => ${sceneHangSum}\tUnique => ${Object.keys(sceneUid).length} `);
    let roomSum = 0;
    let roomHangSum = 0;
    console.log();
    for (let k of Object.keys(roomIndex)) {
        console.log(`${k}\t离线挂死 => ${roomTotal[k] || 0} 在线错房 => ${roomHangTotal[k] || 0} `);
        roomSum += roomTotal[k] || 0;
        roomHangSum += roomHangTotal[k] || 0;
    }
    console.log(`Room 挂死玩家 => ${roomSum}\t挂起玩家 => ${roomHangSum}\tUnique => ${Object.keys(roomUid).length} `);
    console.log(`\nUnique Total => ${Object.keys(allUid).length}`);
    console.log('__完成__');
    process.exit();
};
doJob();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZEhhbmdSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3JvYm90L2ZpbmRIYW5nUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsc0VBQXVFO0FBQ3ZFLHFFQUFzRTtBQUN0RSxvRkFBdUU7QUFDdkUsTUFBTSxLQUFLLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFFckIsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBR3RDLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQU8sRUFBRSxDQUFBO0lBRTVCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNsQixNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDcEIsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBTW5CLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN0QixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdEIsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzFCLE1BQU0sYUFBYSxHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ2hGLEtBQUssSUFBSSxRQUFRLElBQUksYUFBYSxFQUFFO1FBQ2hDLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sUUFBUSxHQUFHLE1BQU0sWUFBWSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9ELEtBQUssSUFBSSxPQUFPLElBQUksUUFBUSxFQUFFO1lBQzFCLE1BQU0sV0FBVyxHQUFHLE1BQU0sWUFBWSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzRSxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FB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