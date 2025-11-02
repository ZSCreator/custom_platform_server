"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const MongoManager = require("../../app/dao/dbManager/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const Utils = require("../../app/utils");
const InfiniteAgentService = require("../../app/services/agent/infiniteAgentService");
const RoyalAgentServices = require("../../app/services/thirdApi/http/service/royalAgentService");
const pinus_logger_1 = require("pinus-logger");
const PlayerInfo = MongoManager.getDao('player_info');
const DailyNetProfit = MongoManager.getDao('dailyNet_profit');
const DayQudaoProfitsInfo = MongoManager.getDao('day_qudao_profits_info');
const Logger = pinus_logger_1.getLogger('schedule', __filename);
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    console.log('开始执行');
    try {
        console.log('开始执行,addQudaoProfits');
        const playerOfqudaoUid = await PlayerInfo.find({ sex: 1 }, 'uid');
        console.log('playerOfqudaoUid', playerOfqudaoUid);
        const dayTime = 1561012405000;
        const startTime = Utils.zerotime(dayTime);
        const endTime = startTime + 24 * 60 * 60 * 1000;
        for (let item of playerOfqudaoUid) {
            const uid = item.uid;
            const record = await DayQudaoProfitsInfo.findOne({ uid, createTime: { $gt: startTime, $lt: endTime } });
            if (!record) {
                const players = await InfiniteAgentService.getSubordinates(uid, 'uid agentLevel', true, false);
                let list = [];
                players.forEach(m => {
                    list.push(m.uid);
                });
                const info = await RoyalAgentServices.getDayAgentDateReport(startTime, endTime, uid, list);
                info.createTime = endTime - 60 * 60 * 1000;
                const dayPlayerGolds = await PlayerInfo.aggregate().match({ uid: { $in: list } })
                    .group({ _id: {}, 'gold': { '$sum': '$gold.2' } });
                let allGolds = 0;
                if (dayPlayerGolds.length != 0) {
                    allGolds = dayPlayerGolds[0].gold;
                }
                Logger.error("每个玩代理的详细数据", info);
                const gameTypeRecrod = await DailyNetProfit.aggregate().match({ uid: { $in: list }, createTime: { '$gt': startTime, '$lt': endTime } })
                    .group({ _id: {}, 'caipiao': { '$sum': '$caipiao' }, 'puker': { '$sum': '$puker' }, 'dianwan': { '$sum': '$dianwan' }, 'liuhecai': { '$sum': '$liuhecai' }, 'zhenren': { '$sum': '$zhenren' } });
                let teamExhibit = 0;
                if (gameTypeRecrod.length != 0) {
                    if (gameTypeRecrod[0].caipiao) {
                        teamExhibit += gameTypeRecrod[0].caipiao;
                    }
                    if (gameTypeRecrod[0].puker) {
                        teamExhibit += gameTypeRecrod[0].puker;
                    }
                    if (gameTypeRecrod[0].dianwan) {
                        teamExhibit += gameTypeRecrod[0].dianwan;
                    }
                    if (gameTypeRecrod[0].zhenren) {
                        teamExhibit += gameTypeRecrod[0].zhenren;
                    }
                    if (gameTypeRecrod[0].liuhecai) {
                        teamExhibit += gameTypeRecrod[0].liuhecai;
                    }
                }
                let gameInfo = {
                    caipiao: 0,
                    puker: 0,
                    dianwan: 0,
                    zhenren: 0,
                    buyu: 0,
                    liuhecai: 0,
                };
                if (gameTypeRecrod.length != 0) {
                    gameInfo.caipiao = gameTypeRecrod[0].caipiao ? gameTypeRecrod[0].caipiao : 0;
                    gameInfo.puker = gameTypeRecrod[0].puker ? gameTypeRecrod[0].puker : 0;
                    gameInfo.dianwan = gameTypeRecrod[0].dianwan ? gameTypeRecrod[0].dianwan : 0;
                    gameInfo.zhenren = gameTypeRecrod[0].zhenren ? gameTypeRecrod[0].zhenren : 0;
                    gameInfo.liuhecai = gameTypeRecrod[0].liuhecai ? gameTypeRecrod[0].liuhecai : 0;
                }
                info.teamProfits = 0;
                info.teamExhibit = teamExhibit;
                info.nowPlayerGold = allGolds;
                info.gameTypeProfits = gameInfo;
                await DayQudaoProfitsInfo.create(info);
            }
        }
        console.log('执行结束');
        return Promise.resolve();
    }
    catch (error) {
        Logger.error("royal_scheduleJob.addQudaoProfits", error);
    }
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NoZWR1bGVfRGF5cXVkYW9Qcm9maXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvdGhpcmRUb29scy9TY2hlZHVsZV9EYXlxdWRhb1Byb2ZpdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxzRUFBdUU7QUFDdkUscUVBQXNFO0FBQ3RFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQ3RELHlDQUEwQztBQUMxQyxzRkFBc0Y7QUFDdEYsaUdBQWlHO0FBQ2pHLCtDQUFrRDtBQUNsRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3RELE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM5RCxNQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMxRSxNQUFNLE1BQU0sR0FBRyx3QkFBUyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNqRCxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsU0FBUztJQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BCLElBQUk7UUFDQSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDcEMsTUFBTSxnQkFBZ0IsR0FBRyxN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