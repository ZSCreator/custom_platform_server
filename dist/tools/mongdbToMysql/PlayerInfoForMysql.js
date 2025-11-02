"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const PlayerInfoManager = require("../../app/common/dao/PlayerInfoManager");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const Player_mysql_dao_1 = require("../../app/common/dao/mysql/Player.mysql.dao");
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
RDSClient_1.RDSClient.demoInit();
const PlayerInfo = MongoManager.player_info;
async function clean() {
    console.warn(`开始执行`);
    const records = await PlayerInfo.find({ isRobot: 0 }, 'uid');
    let num = 0;
    for (let item of records) {
        const { player } = await PlayerInfoManager.getPlayer({ uid: item.uid });
        console.warn(`uid:${item.uid}}`);
        const info = {
            uid: player.uid,
            thirdUid: player.thirdUid,
            nickname: player.nickname,
            headurl: player.headurl,
            gold: player.gold,
            addDayRmb: player.addDayRmb,
            addRmb: player.addRmb,
            addTixian: player.addTixian,
            addDayTixian: player.addDayTixian,
            language: player.language,
            superior: player.superior,
            group_id: player.group_id,
            groupRemark: player.groupRemark,
            loginTime: null,
            lastLogoutTime: null,
            isRobot: player.isRobot,
            enterRoomTime: null,
            leaveRoomTime: null,
            ip: null,
            sid: null,
            loginCount: player.loginCount,
            kickedOutRoom: player.kickedOutRoom,
            abnormalOffline: player.abnormalOffline,
            position: player.position,
            closeTime: null,
            closeReason: null,
            dayMaxWin: player.dayMaxWin,
            dailyFlow: player.dailyFlow,
            flowCount: player.flowCount,
            instantNetProfit: player.instantNetProfit['sum'],
            walletGold: player.walletGold,
            rom_type: player.rom_type,
            vipScore: 0,
            guestid: player.guestid,
            cellPhone: player.cellPhone,
            passWord: player.passWord,
            maxBetGold: player.maxBetGold,
            earlyWarningGold: player.earlyWarningGold,
            earlyWarningFlag: player.earlyWarningFlag,
            entryGold: player.entryGold,
            kickself: player.kickself,
        };
        await Player_mysql_dao_1.default.insertOne(info);
        num++;
        console.warn(`完成:${item.uid},第${num}条`);
    }
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVySW5mb0Zvck15c3FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvbW9uZ2RiVG9NeXNxbC9QbGF5ZXJJbmZvRm9yTXlzcWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxzRUFBdUU7QUFDdkUsNEVBQTZFO0FBQzdFLDhFQUErRTtBQUMvRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCxrRkFBeUU7QUFDekUsd0VBQXFFO0FBQ3JFLGVBQWUsQ0FBQyxjQUFjLENBQUM7SUFDM0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztJQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0NBQ2xDLENBQUMsQ0FBQztBQUVILHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDckIsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztBQUM1QyxLQUFLLFVBQVUsS0FBSztJQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsRUFBQyxLQUFLLENBQUMsQ0FBQztJQUN6RCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDWixLQUFJLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBRTtRQUNyQixNQUFNLEVBQUMsTUFBTSxFQUFDLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsRUFBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxDQUFDLENB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