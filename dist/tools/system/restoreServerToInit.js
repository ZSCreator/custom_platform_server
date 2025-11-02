'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const redisManager = require("../../app/common/dao/redis/lib/redisManager");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
async function clean() {
    try {
        await DatabaseService.initConnection({
            "host": dbMongo.production.host,
            "port": dbMongo.production.port,
            "user": dbMongo.production.user,
            "pwd": dbMongo.production.pwd,
            "name": dbMongo.production.name,
        });
        console.log("系统中的所有缓存");
        await DatabaseService.initRedisConnection("000");
        console.log("redis init");
        let keys = await redisManager.getKeysSatisfyPattern('*');
        console.log("redis init", keys);
        const systemConfigIndex = keys.indexOf('hall:system_config');
        if (systemConfigIndex !== -1) {
            keys.splice(systemConfigIndex, 1);
        }
        console.log("客服");
        const callCenterIndex = keys.indexOf('hall:callCenter');
        if (callCenterIndex !== -1) {
            keys.splice(callCenterIndex, 1);
        }
        console.log("客服充值");
        const customerPayInfoIndex = keys.indexOf('hall:customer_pay_info');
        if (customerPayInfoIndex !== -1) {
            keys.splice(customerPayInfoIndex, 1);
        }
        let lotteryKeys = await redisManager.getKeysSatisfyPattern('lottery*');
        for (let lKey of lotteryKeys) {
            const lIndex = keys.indexOf(lKey);
            if (lIndex !== -1) {
                keys.splice(lIndex, 1);
            }
        }
        console.log("删除其他所有的");
        await redisManager.deleteKeyFromRedis(keys);
        console.log("系统中的所有表");
        const allTablesName = await MongoManager.getCollectionNames();
        console.log(`allTablesName:${JSON.stringify(allTablesName)}`);
        const excludeTables = [
            "system_config",
            'system_shop_gold',
            'customer_pay_info',
            'scratch_card_result',
            "system.indexes",
            "reality_video_agent_balance_record",
            "reality_video_user_info",
            "lottery_info",
            "pay_type",
            "ssc_lottery_info",
            "ssc_lottery_history",
            "dish_data",
            "bonus_pools",
            "system_game_type",
            "white_ip_info",
            "empty_collection"
        ];
        await clearDatabase(allTablesName, excludeTables);
        redisManager.disconnect();
        MongoManager.disconnect();
        console.log('!!!!!!!!!!!!!!!! 清除成功 !!!!!!!!!!!');
    }
    catch (err) {
        console.log(err);
    }
}
async function clearDatabase(allTablesName, excludeTables) {
    try {
        for (let tableName of allTablesName) {
            if (excludeTables.includes(tableName)) {
                continue;
            }
            console.log("delete:", tableName);
            MongoManager.user_info;
            let tableDao = MongoManager[tableName];
            if (tableDao) {
                await tableDao.deleteMany({});
            }
        }
    }
    catch (error) {
        return Promise.reject(error);
    }
}
clean();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZVNlcnZlclRvSW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3N5c3RlbS9yZXN0b3JlU2VydmVyVG9Jbml0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFNYixzRUFBdUU7QUFDdkUsNEVBQTZFO0FBQzdFLDhFQUErRTtBQUMvRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUl0RCxLQUFLLFVBQVUsS0FBSztJQUNoQixJQUFJO1FBQ0EsTUFBTSxlQUFlLENBQUMsY0FBYyxDQUFDO1lBQ2pDLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7WUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtZQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7WUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtTQUNsQyxDQUFDLENBQUM7UUFHSCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ3ZCLE1BQU0sZUFBZSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDekIsSUFBSSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFFL0IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDN0QsSUFBSSxpQkFBaUIsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFp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