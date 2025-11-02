
import DatabaseService = require("../../app/services/databaseService");
import PlayerInfoManager = require("../../app/common/dao/PlayerInfoManager");
import MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
import PlayerMysqlDao from '../../app/common/dao/mysql/Player.mysql.dao';
import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});

RDSClient.demoInit();
const PlayerInfo = MongoManager.player_info;
async function clean() {
    console.warn(`开始执行`);
    const records = await PlayerInfo.find({isRobot:0},'uid');
    let num = 0;
    for(let item of records) {
        const {player} = await PlayerInfoManager.getPlayer({uid:item.uid});
        console.warn(`uid:${item.uid}}`)
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

            leaveRoomTime:null,

            ip: null,

            sid: null,

            loginCount: player.loginCount,

            kickedOutRoom: player.kickedOutRoom,

            abnormalOffline:player.abnormalOffline,

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

        await PlayerMysqlDao.insertOne(info);
        num++;
        console.warn(`完成:${item.uid},第${num}条`)
    }
    console.warn(`执行完成`);
    process.exit();
    return;
}
setTimeout(clean, 2000);