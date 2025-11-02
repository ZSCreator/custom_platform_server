"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRecordRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const player_entity_1 = require("./entity/player.entity");
class GameRecordRedisDao {
    async findList(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const result = await conn.lrange(`${RedisDict_1.DB2.GameRecord}`, 0, 150);
            let arr = [];
            result.forEach(m => {
                arr.push(JSON.parse(m));
            });
            return arr;
        }
        catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const message = await conn.spop(`${RedisDict_1.DB2.GameRecord}`);
            return !!message ? JSON.parse(message) : null;
        }
        catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const seconds = 15 * 60;
            const AuthCodeStr = await conn.get(`${RedisDict_1.DB2.GameRecord}`);
            await conn.setex(`${RedisDict_1.DB2.GameRecord}`, seconds, JSON.stringify(new player_entity_1.PlayerInRedis(Object.assign(JSON.parse(AuthCodeStr), partialEntity))));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            let valueOrArray = [];
            valueOrArray.push(parameter);
            await conn.sadd(`${RedisDict_1.DB2.GameRecord}`, ...valueOrArray);
            return;
        }
        catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const data = await conn.spop(`${RedisDict_1.DB2.GameRecord}`);
            return data;
        }
        catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }
    async lPush(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            parameter.createTimeDate = new Date();
            await conn.lpush(`${RedisDict_1.DB2.GameRecord}`, JSON.stringify(parameter));
            const length = await conn.llen(`${RedisDict_1.DB2.GameRecord}`);
            if (length > 150) {
                await conn.rpop(`${RedisDict_1.DB2.GameRecord}`);
            }
            await conn.expire(`${RedisDict_1.DB2.GameRecord}`, 60 * 60 * 24);
            return true;
        }
        catch (e) {
            console.error(`Redis | DB2 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }
    async insertGameRecordForUid(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.GameRecordData);
        try {
            const seconds = 60 * 60 * 24 * 14;
            let resultLst = [];
            let info = {
                roomId: parameter.roomId,
                validBet: parameter.validBet,
                profit: parameter.profit,
                createTimeDate: parameter.createTimeDate,
                gameOrder: parameter.gameOrder,
            };
            const playerGameWithStr = await conn.get(`${RedisDict_1.DB4.GameRecordData}:${parameter.nid}:${parameter.uid}`);
            if (!!playerGameWithStr) {
                let list = JSON.parse(playerGameWithStr);
                list.unshift(info);
                if (list.length > 10) {
                    list.pop();
                }
                resultLst = list;
            }
            else {
                resultLst.unshift(info);
            }
            await conn.setex(`${RedisDict_1.DB4.GameRecordData}:${parameter.nid}:${parameter.uid}`, seconds, JSON.stringify(resultLst));
            return true;
        }
        catch (e) {
            console.error(`Redis | DB4 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }
    async findGameRecordForUid(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.GameRecordData);
        try {
            const playerGameWithStr = await conn.get(`${RedisDict_1.DB4.GameRecordData}:${parameter.nid}:${parameter.uid}`);
            return !!playerGameWithStr ? JSON.parse(playerGameWithStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB4 | 游戏记录==实况: ${e.stack}`);
            return null;
        }
    }
}
exports.GameRecordRedisDao = GameRecordRedisDao;
exports.default = new GameRecordRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJlY29yZC5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9HYW1lUmVjb3JkLnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBb0Q7QUFDcEQsb0RBQThDO0FBRTlDLDZEQUFrRDtBQUVsRCwwREFBdUQ7QUFHdkQsTUFBYSxrQkFBa0I7SUFFM0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUE2TDtRQUN4TSxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSTtZQUNBLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDOUQsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ2IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDZixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sR0FBRyxDQUFDO1NBQ2Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUE2TDtRQUN2TSxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkUsSUFBSTtZQUNBLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLElB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