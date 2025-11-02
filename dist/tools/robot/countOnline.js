#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerManager = require("../../app/dao/domainManager/hall/playerManager");
const DatabaseService = require("../../app/services/databaseService");
const GameController = require("../../app/services/hall/gameController");
const path = require("path");
const fs = require("fs");
const JsonMgr = require("../../config/data/JsonMgr");
const OnlineGameHashDao_1 = require("../../app/common/dao/redis/OnlineGameHashDao");
const games = require('../../config/data/games.json');
const robotConfig = require('../../config/data/robot/robotConfig.json');
const dbMongo = require('../../config/db/mongo.json');
const sceneMap = {};
const robotMap = {};
const total = {};
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name
});
async function run() {
    await JsonMgr.init();
    await DatabaseService.getRedisClient();
    console.log('__CONN init complete__');
    const sceneDir = '../../config/data/scenes/';
    const files = fs.readdirSync(path.join(__dirname, sceneDir), 'utf-8');
    files.forEach(file => {
        const sceneArray = JSON.parse(fs.readFileSync(sceneDir + file, 'utf8'));
        sceneMap[sceneArray[0]['nid']] = sceneArray;
    });
    robotConfig.forEach(e => {
        if (e.open && GameController.isGameOpen(e.nid))
            robotMap[e.nid] = e;
    });
    console.log('__CONF init Complete__');
    for (let nid of Object.keys(robotMap)) {
        const robotConfigObject = robotMap[nid];
        const sceneConfigArray = sceneMap[nid];
        let roomCount = 0;
        if (!sceneConfigArray) {
            roomCount = 1;
        }
        else {
            if (robotConfigObject.fenscene.length >= sceneConfigArray.length) {
                sceneConfigArray.forEach(scene => {
                    roomCount += scene['room_count'];
                });
            }
            else {
                for (let idx of robotConfigObject.fenscene) {
                    roomCount += sceneConfigArray[idx]['room_count'];
                }
            }
        }
        const planRobot = roomCount * robotConfigObject['number'];
        total[nid] = { rooms: roomCount, robotPerRoom: robotConfigObject['number'], planRobot: planRobot, real: 0, robot: 0, realUids: [] };
    }
    console.log('__ROOM count complete__');
    const hash = await OnlineGameHashDao_1.findAll();
    for (let uid of Object.keys(hash)) {
        const data = hash[uid];
        const countRobot = (data.isRobot === 0) ? 0 : 1;
        const countReal = (data.isRobot === 0) ? 1 : 0;
        let nid = data.nid;
        if (countReal) {
            const { player, lock } = await PlayerManager.getPlayer({ uid }, false, false);
            if (player.position === 0) {
                nid = '-1';
            }
        }
        if (total[nid]) {
            total[nid].real += countReal;
            total[nid].robot += countRobot;
        }
        else {
            total[nid] = { rooms: 0, robotPerRoom: 0, planRobot: 0, real: countReal, robot: countRobot, realUids: [] };
        }
        let userPlace = uid;
        if (data.sceneId && data.sceneId !== -1) {
            userPlace += `_s${data.sceneId}`;
        }
        if (data.roomId && data.roomId !== -1) {
            userPlace += `_r${data.roomId}`;
        }
        if (countReal)
            total[nid].realUids.push(userPlace);
    }
    console.log('__HASH count Complete__');
    print();
}
function print() {
    console.log('\n');
    console.log(`nid\t room *\t num =\t plan\t robot\t player\t ${padding('name', 10)} uids`);
    let sumPlanRobot = 0;
    let sumRobot = 0;
    let sumReal = 0;
    for (let nid of Object.keys(total)) {
        console.log(`${nid}\t ${total[nid].rooms}\t ${total[nid].robotPerRoom}\t ${total[nid].planRobot}\t ${total[nid].robot}\t ${total[nid].real}\t ${gameNameFixLength(nid, 14)} ${total[nid].realUids}`);
        sumPlanRobot += total[nid].planRobot;
        sumReal += total[nid].real;
        sumRobot += total[nid].robot;
    }
    console.log(`\n总计\t \t \t ${sumPlanRobot}\t ${sumRobot}\t ${sumReal}`);
    process.exit();
}
const gameNameFixLength = (nid, length) => {
    const name = gameName(nid);
    if (name.length < length) {
        return padding(name, (length - name.length));
    }
    else {
        return name;
    }
};
const padding = (str, length) => {
    while (length > 0) {
        str += ' ';
        length--;
    }
    return str;
};
const gameName = (nid) => {
    if (nid === '-1')
        return 'hall';
    const game = games.find(m => m.nid == nid);
    if (game)
        return game.serverName + ' ';
    else
        return '';
};
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY291bnRPbmxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9yb2JvdC9jb3VudE9ubGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQSxnRkFBaUY7QUFDakYsc0VBQXVFO0FBQ3ZFLHlFQUEwRTtBQUMxRSw2QkFBOEI7QUFDOUIseUJBQTBCO0FBQzFCLHFEQUFzRDtBQUN0RCxvRkFBdUU7QUFDdkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDdEQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7QUFDeEUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDdEQsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNwQixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7QUFFakIsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLEdBQUc7SUFFZCxNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVyQixNQUFNLGVBQWUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFHdEMsTUFBTSxRQUFRLEdBQUcsMkJBQTJCLENBQUM7SUFDN0MsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFD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