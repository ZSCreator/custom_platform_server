'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const redisManager = require("../../app/common/dao/redis/lib/redisManager");
const MongoManager = require("../../app/common/dao/mongoDB/lib/mongoManager");
const dbMongo = require('../../config/db/mongo.json');
const playerTableName = 'player_info';
const playerDao = MongoManager.player_info;
const justRealPlayer = true;
const onceFindNumber = 100;
async function clean() {
    try {
        await DatabaseService.initConnection({
            "host": dbMongo.production.host,
            "port": dbMongo.production.port,
            "user": dbMongo.production.user,
            "pwd": dbMongo.production.pwd,
            "name": dbMongo.production.name,
        });
        console.log("-------user_info------ start");
        console.log("-------user_info------ end");
        console.log("-------user_info------ start");
        console.log("-------user_info------ end");
        console.log("-------user_info------ end");
        console.log('#############删除mongo数据###############');
        await clearDatabase(['pay_info', 'pay_order', 'user_info', 'player_info', 'infinite_agent_info', 'game_record',
            'third_gold_record', 'game_Records_live', 'player_login_record', 'mails', 'game_record_backup']);
        console.log('#############删除mongo数据###############');
    }
    catch (err) {
        console.log(err);
    }
    return true;
}
async function clearPatternKey(pattern) {
    let keys = await redisManager.getKeysSatisfyPattern(pattern);
    console.log("开始删除user_info缓存条数 : " + keys.length);
    console.log(keys);
    await redisManager.deleteKeyFromRedis(keys);
    console.log("完成删除user_info缓存:");
    let finishUser = await redisManager.getKeysSatisfyPattern(pattern);
    console.log("查询user_info:\n" + finishUser);
}
async function clearDatabase(allTablesName) {
    try {
        let tableDao;
        for (let tableName of allTablesName) {
            console.log(`----------${tableName}----------- start`);
            tableDao = MongoManager[tableName];
            if (tableDao) {
                await tableDao.remove();
            }
            console.log(`----------${tableName}----------- end`);
        }
    }
    catch (error) {
        return Promise.reject(error);
    }
}
clean();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xlYXJQbGF5ZXJBbmRSb2JvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3N5c3RlbS9DbGVhclBsYXllckFuZFJvYm90LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFNYixzRUFBdUU7QUFDdkUsNEVBQTZFO0FBQzdFLDhFQUErRTtBQUUvRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUV0RCxNQUFNLGVBQWUsR0FBRyxhQUFhLENBQUM7QUFDdEMsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQztBQUMzQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDNUIsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBRTNCLEtBQUssVUFBVSxLQUFLO0lBQ2hCLElBQUk7UUFDQSxNQUFNLGVBQWUsQ0FBQyxjQUFjLENBQUM7WUFDakMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtZQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7WUFDL0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRztZQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1NBQ2xDLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUU1QyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBRTVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUUxQyxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sYUFBYSxDQUFDLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUMsYUFBYSxFQUFDLHFCQUFxQixFQUFDLGFBQWE7WUFDdkcsbUJBQW1CLEVBQUMsbUJBQW1CLEVBQUMscUJBQXFCLEVBQUMsT0FBTyxFQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztRQUNqRyxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7S0FDeEQ7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDbkI7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQsS0FBSyxVQUFVLGVBQWUsQ0FBQyxPQUFPO0lBQ2xDLElBQUksSUFBSSxHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEIsTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ2hDLElBQUksVUFBVSxHQUFHLE1BQU0sWUFBWSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25FLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUtELEtBQUssVUFBVSxhQUFhLENBQUMsYUFBdUI7SUFDaEQsSUFBSTtRQUNBLElBQUksUUFBUSxDQUFDO1FBQ2IsS0FBSyxJQUFJLFNBQVMsSUFBSSxhQUFhLEVBQUU7WUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLFNBQVMsbUJBQW1CLENBQUMsQ0FBQztZQUN2RCxRQUFRLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25DLElBQUksUUFBUSxFQUFFO2dCQUNWLE1BQU0sUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQzNCO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLFNBQVMsaUJBQWlCLENBQUMsQ0FBQztTQUN4RDtLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDL0I7QUFDTCxDQUFDO0FBRUQsS0FBSyxFQUFFLENBQUMifQ==