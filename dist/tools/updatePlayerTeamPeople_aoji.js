'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const PlayerManager = require("../app/dao/domainManager/hall/playerManager");
const RedisManager = require("../app/dao/dbManager/redisManager");
const dbMongo = require('../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    console.log('开始执行');
    const filterFunc = player => player.isRobot === 0;
    const players = await PlayerManager.findPlayerList({ isRobot: 0 }, filterFunc, 'uid inviteCode teamPeople');
    let num = players.length;
    console.log('总人数：', players.length);
    let lockRef;
    for (let m of players) {
        if (m.teamPeople && m.teamPeople > 0) {
            try {
                let superiorPlayerAndlock = await PlayerManager.getPlayer({ uid: m.uid, isRobot: m.isRobot }, true);
                let superiorPlayer = superiorPlayerAndlock.player;
                lockRef = superiorPlayerAndlock.lock;
                superiorPlayer.teamPeople = 0;
                await PlayerManager.updateOnePlayer(superiorPlayer, ['teamPeople'], lockRef);
            }
            catch (error) {
                lockRef && await RedisManager.unlock(lockRef);
                console.log("changeRobotGold ==> :", error);
            }
        }
    }
    for (let m of players) {
        try {
            num = num - 1;
            console.log('人数：', num);
            if (m.inviteCode) {
            }
        }
        catch (error) {
            lockRef && await RedisManager.unlock(lockRef);
            console.log("changeRobotGold ==> :", error);
        }
    }
    console.log('执行完成');
}
async function updatePlayerTeamPeople(superior) {
    let lockRef;
    try {
        console.log('superior', superior);
        let superiorPlayerAndlock = await PlayerManager.getPlayer({ uid: superior }, true);
        let superiorPlayer = superiorPlayerAndlock.player;
        console.log('superiorPlayerUid', superiorPlayer.uid);
        let lock = superiorPlayerAndlock.lock;
        lockRef = lock;
        if (!superiorPlayer.teamPeople) {
            superiorPlayer.teamPeople = 0;
        }
        superiorPlayer.teamPeople += 1;
        console.log('玩家人数', superiorPlayer.uid, superiorPlayer.teamPeople);
        await PlayerManager.updateOnePlayer(superiorPlayer, ['teamPeople'], lock);
    }
    catch (error) {
        lockRef && await RedisManager.unlock(lockRef);
        console.log("changeRobotGold ==> :", error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlUGxheWVyVGVhbVBlb3BsZV9hb2ppLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdG9vbHMvdXBkYXRlUGxheWVyVGVhbVBlb3BsZV9hb2ppLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixtRUFBb0U7QUFFcEUsNkVBQThFO0FBRTlFLGtFQUFtRTtBQUluRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUNuRCxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNoQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsU0FBUztJQUV0QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUM7SUFDbEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0lBQzVHLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLElBQUksT0FBTyxDQUFDO0lBQ1osS0FBSyxJQUFJLENBQUMsSUFBSSxPQUFPLEVBQUU7UUFDckIsSUFB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