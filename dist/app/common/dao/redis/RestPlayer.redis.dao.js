"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestPlayerRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const moment = require("moment");
class RestPlayerRedisDao {
    async inertOne(uid) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            await conn.hset(RedisDict_1.DB2.RestPlayerTaskQueue, uid, moment().valueOf());
            await this.increaseCount();
            return true;
        }
        catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 插入在线玩家 uid ${uid} 出错: ${e.stack}`);
            return false;
        }
    }
    async delByUid(uid) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            await conn.hdel(RedisDict_1.DB2.RestPlayerTaskQueue, uid);
            await this.decreaseCount();
            return true;
        }
        catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 删除在线玩家 uid ${uid} 出错: ${e.stack}`);
            return false;
        }
    }
    async exitsByUid(uid) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            const res = await conn.hexists(RedisDict_1.DB2.RestPlayerTaskQueue, uid);
            return !!res;
        }
        catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 判断指定字段 ${uid} 是否存在出错: ${e.stack}`);
            return false;
        }
    }
    async increaseCount() {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            const res = await this.exitsByUid("count");
            if (res) {
                await conn.hincrby(RedisDict_1.DB2.RestPlayerTaskQueue, "count", 1);
                return true;
            }
            await conn.hset(RedisDict_1.DB2.RestPlayerTaskQueue, "count", 1);
            return true;
        }
        catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 新增统计数字出错: ${e.stack}`);
            return false;
        }
    }
    async decreaseCount() {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
            const res = await this.exitsByUid("count");
            if (res) {
                await conn.hincrby(RedisDict_1.DB2.RestPlayerTaskQueue, "count", -1);
                return true;
            }
            await conn.hset(RedisDict_1.DB2.RestPlayerTaskQueue, "count", 0);
            return true;
        }
        catch (e) {
            console.error(`RestPlayer | dao | 待处理任务 减少统计数字出错: ${e.stack}`);
            return false;
        }
    }
}
exports.RestPlayerRedisDao = RestPlayerRedisDao;
exports.default = new RestPlayerRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdFBsYXllci5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9SZXN0UGxheWVyLnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBK0M7QUFDL0Msb0RBQThDO0FBQzlDLDZEQUFrRDtBQUNsRCxpQ0FBaUM7QUFNakMsTUFBYSxrQkFBa0I7SUFFcEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFXO1FBQzdCLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFHbkUsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQUcsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUVsRSxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUUzQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDM0UsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFXO1FBQzdCLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFHbkUsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQUcsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUc5QyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUUzQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFD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