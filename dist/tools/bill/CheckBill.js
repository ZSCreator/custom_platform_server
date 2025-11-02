#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerManager = require("../../app/common/dao/PlayerInfoManager");
const DatabaseService = require("../../app/services/databaseService");
const Utils = require("../../app/utils");
const JsonConfig = require("../../app/pojo/JsonConfig");
const dbMongo = require('../../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name
});
exports.all = async () => {
    const filterFunc = player => player.isRobot === 0;
    const realPlayerList = await PlayerManager.findPlayerList({ isRobot: 0 }, filterFunc, 'uid gold addRmb addTixian instantNetProfit netProfitCount');
    console.log(`统计用户 [${realPlayerList.length}]`);
    let i = 1;
    const total = [];
    for (let index in realPlayerList) {
        let player = realPlayerList[index];
        if (Utils.sum(player.gold) + player.addTixian === player.netProfitCount.sum + player.addRmb) {
        }
        else {
        }
    }
    let moreSum = 0;
    let lessSum = 0;
    total.forEach(i => { if (i !== undefined && i > 0)
        moreSum += i; });
    total.forEach(i => { if (i !== undefined && i < 0)
        lessSum += i; });
    console.log(`__对账结束__ 金币多了${moreSum}  金币少了${lessSum}`);
    process.exit();
};
const gameName = (nid) => {
    const game = JsonConfig.get_games_all().find(m => m.nid == nid);
    if (game)
        return game.zname + ' ';
    else
        return '';
};
exports.all();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tCaWxsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvYmlsbC9DaGVja0JpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQzs7QUFLYix3RUFBeUU7QUFDekUsc0VBQXVFO0FBRXZFLHlDQUEwQztBQUUxQyx3REFBeUQ7QUFDekQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFFdEQsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBS1UsUUFBQSxHQUFHLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFFMUIsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQztJQUNsRCxNQUFNLGNBQWMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLDJEQUEyRCxDQUFDLENBQUE7SUFJbEosT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0lBRTlDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNqQixLQUFLLElBQUksS0FBSyxJQUFJLGNBQWMsRUFBRTtRQUM5QixJQUFJLE1BQU0sR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbEMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUU7U0FFNUY7YUFBTTtTQUVOO0tBQ0o7SUFDRCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDaEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxTQUFTLElBQUksQ0FBQyxHQUFHLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLFNBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUFFLE9BQU8sSUFBSSxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixPQUFPLFNBQVMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN2RCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQyxDQUFBO0FBTUQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUNyQixNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQTtJQUMvRCxJQUFJLElBQUk7UUFBRSxPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFBOztRQUM1QixPQUFPLEVBQUUsQ0FBQTtBQUNsQixDQUFDLENBQUE7QUFFRCxXQUFHLEVBQUUsQ0FBQSJ9