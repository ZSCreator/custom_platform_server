'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const redisManager = require("../../app/common/dao/redis/lib/redisManager");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const RoleEnum_1 = require("../../app/common/constant/player/RoleEnum");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function clearAndReserve() {
    try {
        const playerInfoDao = MongoManager.player_info;
        await playerInfoDao.updateMany({ isRobot: { $ne: RoleEnum_1.RoleEnum.ROBOT } }, {
            addRmb: 0,
            addTixian: 0,
            gold: 0,
            loginCount: 0,
            abnormalOffline: false,
            kickedOutRoom: false,
            addExchange: 0,
            dayMaxWin: 0,
            lastGameContents: { lastGame: '', scene_id: -1, history: {} },
            dailyFlow: 0,
            flowCount: 0,
            instantNetProfit: { sum: 0 },
            dailyNetProfit: { sum: 0 },
            netProfitCount: { sum: 0 },
            consumedSelfFlow: 0,
            consumedPromoteFlow: 0,
            dailyCommission: { winCount: 0, betCount: 0, settleCount: 0 },
            commissionCount: { winCount: 0, betCount: 0, settleCount: 0 },
            loginRewardInfo: [],
            walletGold: 0,
            walletPassword: '',
            lastOpenRedPacketRmb: 0,
            lastOpenRedPacketTime: 0,
            lastOpenRedPacketGold: 0,
        }, { multi: true });
        let keys = await redisManager.getKeysSatisfyPattern('*');
        const systemConfigIndex = keys.indexOf('hall:system_config');
        if (systemConfigIndex !== -1) {
            keys.splice(systemConfigIndex, 1);
        }
        const callCenterIndex = keys.indexOf('hall:callCenter');
        if (callCenterIndex !== -1) {
            keys.splice(callCenterIndex, 1);
        }
        const customerPayInfoIndex = keys.indexOf('hall:customer_pay_info');
        if (customerPayInfoIndex !== -1) {
            keys.splice(customerPayInfoIndex, 1);
        }
        await redisManager.deleteKeyFromRedis(keys);
        const allTablesName = await MongoManager.getCollectionNames();
        let excludeTables = ["user_info", "player_info", "system_config", 'system_shop_gold', 'customer_pay_info',
            'scratch_card_result', 'agent_info', "system.indexes"];
        await clearDatabase(allTablesName, excludeTables);
        console.log('!!!!!!!!!!!!!!!! 清除成功 !!!!!!!!!!!');
    }
    catch (error) {
        console.log('**************** 出错了:', error);
    }
}
async function clearDatabase(allTablesName, excludeTables) {
    try {
        let tableDao;
        for (let tableName of allTablesName) {
            if (excludeTables.includes(tableName)) {
                continue;
            }
            console.log("delete:", tableName);
            tableDao = MongoManager[tableName];
            if (tableDao) {
                await tableDao.remove();
            }
        }
    }
    catch (error) {
        return Promise.reject(error);
    }
}
setTimeout(clearAndReserve, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJTeXN0ZW1BbmRSZXNlcnZlQWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3N5c3RlbS9jbGVhclN5c3RlbUFuZFJlc2VydmVBY2NvdW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYixzRUFBdUU7QUFDdkUsNEVBQTZFO0FBQzdFLDhFQUErRTtBQUMvRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUl0RCx3RUFBcUU7QUFFckUsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLGVBQWU7SUFDMUIsSUFBSTtRQUNBLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUM7UUFFL0MsTUFBTSxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsR0FBRyxFQUFFLG1CQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRTtZQUNqRSxNQUFNLEVBQUUsQ0FBQztZQUNULFNBQVMsRUFBRSxDQUFDO1lBQ1osSUFBSSxFQUFFLENBQUM7WUFDUCxVQUFVLEVBQUUsQ0FBQztZQUNiLGVBQWUsRUFBRSxLQUFLO1lBQ3RCLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsU0FBUyxFQUFFLENBQUM7WUFDWixnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFF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