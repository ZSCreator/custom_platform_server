'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const MongoManager = require("../app/dao/dbManager/mongoManager");
const GetDataService = require("../app/services/hall/getDataService");
const InfiniteAgentService = require("../app/services/agent/infiniteAgentService");
const PlayerManager = require("../app/dao/domainManager/hall/playerManager");
const RedisManager = require("../app/dao/dbManager/redisManager");
const HallConst = require("../app/consts/hallConst");
const Utils = require("../app/utils");
const dbMongo = require('../config/db/mongo.json');
const PlayerProfits = MongoManager.getDao('player_profits');
const DayPlayerProfitsPayRecord = MongoManager.getDao('day_player_profits_pay_record');
const DailiDayLiushuiRecord = MongoManager.getDao('daili_day_liushui_record');
const DailiLiushuiRecord = MongoManager.getDao('daili_liushui_record');
const GameRecord = MongoManager.getDao('game_record');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    try {
        console.log('开始执行');
        await addDayPlayerProfitsPayRecord_wuxian();
        console.log('开始完成');
    }
    catch (error) {
        console.log('calculateRegionalProfits ==> 每周定時計算大區的考核绩效是好多:', error);
    }
}
async function addDayPlayerProfitsPayRecord_wuxian() {
    let lockRef;
    try {
        const startTime = 1558022400000;
        const endTime = 1558108800000;
        const filterFunc = player => player.isRobot === 0;
        const allPlayers = await PlayerManager.findPlayerList({ isRobot: 0 }, filterFunc, 'uid gold nickname ');
        const systemConfig = await GetDataService.getSystemConfig();
        const backProfitsRatio = systemConfig.wuXianConfig;
        for (let m of allPlayers) {
            let tempInvites = await InfiniteAgentService.findAgentInfo({ uid: m.uid });
            const settleCount = await GameRecord.aggregate().match({ uid: m.uid, createTime: { '$gt': startTime, '$lt': endTime } })
                .group({ _id: {}, 'settle_commission': { '$sum': '$settle_commission' }, 'input': { '$sum': '$input' } });
            console.log('settleCount', settleCount);
            if (tempInvites && tempInvites.superior) {
                const superior = tempInvites.superior;
                let dailiUid = tempInvites.group_id;
                let profits = 0;
                if (settleCount.length != 0) {
                    profits = settleCount[0].settle_commission / systemConfig.goldToMoney;
                }
                if (profits != 0) {
                    const info = {
                        id: Utils.id(),
                        profits: profits,
                        createTime: endTime - 1000 * 60 * 30,
                        nowPlayerGold: Utils.sum(m.gold, true),
                        uid: m.uid,
                        startProfits: profits,
                        dailyChoushui: parseInt(settleCount[0].settle_commission),
                        dailyFlow: parseInt(settleCount[0].input),
                        nickname: m.nickname,
                    };
                    let numLevel = 1;
                    let nextUid = m.uid;
                    let backProfits = backProfitsRatio ? backProfitsRatio.ONE : HallConst.PROFITS_TO_WUXIAN.ONE;
                    let qudaoProfits = profits;
                    await addDayPlayerProfitsPayRecordDB_wuxian(info, qudaoProfits, nextUid, profits, numLevel, superior, startTime, endTime, backProfits, dailiUid, backProfitsRatio);
                }
            }
            else {
                let profits = 0;
                if (settleCount.length != 0 && settleCount[0].settle_commission != 0) {
                    profits = settleCount[0].settle_commission / systemConfig.goldToMoney;
                }
                if (profits != 0) {
                    const info = {
                        id: Utils.id(),
                        profits: 0,
                        createTime: endTime - 1000 * 60 * 30,
                        nowPlayerGold: Utils.sum(m.gold, true),
                        uid: m.uid,
                        startProfits: profits,
                        dailyChoushui: parseInt(settleCount[0].settle_commission),
                        dailyFlow: parseInt(settleCount[0].input),
                        nextUid: m.uid,
                        numLevel: 0,
                        superior: m.uid,
                        nickname: m.nickname,
                    };
                    await DayPlayerProfitsPayRecord.create(info);
                }
            }
        }
    }
    catch (error) {
        lockRef && await RedisManager.unlock(lockRef);
        console.log('addDayPlayerProfitsPayRecord ==> 每日23点55统计当天的利润:', error);
    }
}
async function addDayPlayerProfitsPayRecordDB_wuxian(info, qudaoProfits, nextUid, profits, numLevel, superior, startTime, endTime, backProfits, dailiUid, backProfitsRatio) {
    let lockRef;
    try {
        info.superior = superior;
        info.numLevel = numLevel;
        info.nextUid = nextUid;
        const superiorTemp = await InfiniteAgentService.findAgentInfo({ uid: superior });
        info.profits = profits * backProfits;
        await DayPlayerProfitsPayRecord.create(info);
        const playerProfitsDB = await PlayerProfits.findOne({ uid: superior });
        if (playerProfitsDB) {
            await PlayerProfits.updateOne({ uid: superior }, { "$inc": { "profits": info.profits } });
        }
        else {
            const data = {
                id: Utils.id(),
                profits: info.profits,
                createTime: Date.now(),
                uid: superior,
            };
            await PlayerProfits.create(data);
        }
        qudaoProfits = qudaoProfits - info.profits;
        const dailiDayLiushui = await DailiDayLiushuiRecord.findOne({ dailiUid: superior, createTime: { '$gt': startTime, '$lt': endTime } });
        if (dailiDayLiushui) {
            if (numLevel == 1) {
                await DailiDayLiushuiRecord.updateOne({ dailiUid: superior, createTime: { '$gt': startTime, '$lt': endTime } }, { "$inc": { "zhijieLiushuiProfits": info.profits, "zhijieLiushui": info.dailyChoushui } });
            }
            else {
                await DailiDayLiushuiRecord.updateOne({ dailiUid: superior, createTime: { '$gt': startTime, '$lt': endTime } }, { "$inc": { "jianjieLiushuiProfits": info.profits, "jianjieLiushui": info.dailyChoushui } });
            }
        }
        else {
            let info1 = {};
            if (numLevel == 1) {
                info1 = {
                    id: Utils.id(),
                    zhijieLiushui: info.dailyChoushui,
                    zhijieLiushuiProfits: info.profits,
                    createTime: endTime - 1000 * 60 * 30,
                    dailiUid: superior,
                };
            }
            else {
                info1 = {
                    id: Utils.id(),
                    jianjieLiushui: info.dailyChoushui,
                    jianjieLiushuiProfits: info.profits,
                    createTime: endTime - 1000 * 60 * 30,
                    dailiUid: superior,
                };
            }
            await DailiDayLiushuiRecord.create(info1);
        }
        const dailiLiushui = await DailiLiushuiRecord.findOne({ dailiUid: superior });
        let change = {};
        if (numLevel == 1) {
            change = { "$inc": { "zhijieLiushuiProfits": info.profits, "zhijieLiushui": info.dailyChoushui, "yazhuLiushui": info.dailyFlow } };
        }
        else {
            change = { "$inc": { "jianjieLiushuiProfits": info.profits, "jianjieLiushui": info.dailyChoushui, "yazhuLiushui": info.dailyFlow } };
        }
        if (dailiLiushui) {
            await DailiLiushuiRecord.updateOne({ dailiUid: superior }, change);
        }
        else {
            let info2 = {};
            if (numLevel == 1) {
                info2 = {
                    id: Utils.id(),
                    zhijieLiushui: info.dailyChoushui,
                    zhijieLiushuiProfits: info.profits,
                    createTime: endTime - 1000 * 60 * 30,
                    dailiUid: superior,
                };
            }
            else {
                info2 = {
                    id: Utils.id(),
                    jianjieLiushui: info.dailyChoushui,
                    jianjieLiushuiProfits: info.profits,
                    createTime: endTime - 1000 * 60 * 30,
                    dailiUid: superior,
                };
            }
            await DailiLiushuiRecord.create(info2);
        }
        if (superiorTemp && superiorTemp.superior) {
            superior = superiorTemp.superior;
            nextUid = superiorTemp.uid;
            numLevel += 1;
            backProfits = Math.pow(backProfitsRatio.OTHER, numLevel);
            await addDayPlayerProfitsPayRecordDB_wuxian(info, qudaoProfits, nextUid, profits, numLevel, superior, startTime, endTime, backProfits, dailiUid, backProfitsRatio);
        }
        return Promise.resolve(null);
    }
    catch (error) {
        lockRef && await RedisManager.unlock(lockRef);
        console.log('addDayPlayerProfitsPayRecordDB_wuxian ==> 每日23点55统计当天的利润:', error);
        return Promise.reject(error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkRGF5UHJvZml0c0JhY2tBZ2VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rvb2xzL2FkZERheVByb2ZpdHNCYWNrQWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLG1FQUFvRTtBQUNwRSxrRUFBbUU7QUFDbkUsc0VBQXVFO0FBQ3ZFLG1GQUFvRjtBQUNwRiw2RUFBOEU7QUFDOUUsa0VBQW1FO0FBQ25FLHFEQUFzRDtBQUN0RCxzQ0FBdUM7QUFHdkMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFbkQsTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzVELE1BQU0seUJBQXlCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ3ZGLE1BQU0scUJBQXFCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQzlFLE1BQU0sa0JBQWtCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3ZFLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdEQsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLFNBQVM7SUFDcEIsSUFBSTtRQUNBLE9BQU8sQ0FBQyxHQUFHLENB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