"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiteIpRecordRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const WhiteIpRecord_entity_1 = require("./entity/WhiteIpRecord.entity");
const WhiteIpRecord_mysql_dao_1 = require("../mysql/WhiteIpRecord.mysql.dao");
const redisConnection_1 = require("./lib/redisConnection");
class WhiteIpRecordRedisDao {
    async findList(parameter) {
        throw new Error("Method not implemented.");
    }
    async findOne(parameter) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const WhiteIpRecordStr = await conn.get(`${RedisDict_1.DB2.white_ip}:${parameter.ip}`);
            if (!WhiteIpRecordStr) {
                const whiteIp = await WhiteIpRecord_mysql_dao_1.default.findOne({ ip: parameter.ip });
                if (whiteIp) {
                    await this.insertOne(whiteIp);
                    return whiteIp;
                }
            }
            return !!WhiteIpRecordStr ? JSON.parse(WhiteIpRecordStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB2 | 查询白名单出错: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const seconds = 24 * 60 * 60;
            const AuthCodeStr = await conn.get(`${RedisDict_1.DB2.white_ip}:${parameter.ip}`);
            await conn.setex(`${RedisDict_1.DB2.white_ip}:${parameter.ip}`, seconds, JSON.stringify(new WhiteIpRecord_entity_1.WhiteIpRecordInRedis(Object.assign(JSON.parse(AuthCodeStr), partialEntity))));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 修改白名单出错: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            const seconds = 24 * 60 * 60;
            await conn.setex(`${RedisDict_1.DB2.white_ip}:${parameter.ip}`, seconds, JSON.stringify(new WhiteIpRecord_entity_1.WhiteIpRecordInRedis(parameter)));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 插入白名单出错: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await (0, redisConnection_1.default)(DBCfg_enum_1.RedisDB.RuntimeData);
        try {
            await conn.del(`${RedisDict_1.DB2.white_ip}:${parameter.ip}`);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB2 | 删除白名单出错: ${e.stack}`);
            return null;
        }
    }
}
exports.WhiteIpRecordRedisDao = WhiteIpRecordRedisDao;
exports.default = new WhiteIpRecordRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2hpdGVJcFJlY29yZC5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9XaGl0ZUlwUmVjb3JkLnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBK0M7QUFDL0Msb0RBQThDO0FBQzlDLHdFQUFxRTtBQUNyRSw4RUFBcUU7QUFDckUsMkRBQWlEO0FBSWpELE1BQWEscUJBQXFCO0lBRTlCLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBb0g7UUFDL0gsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQTZFO1FBQ3ZGLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSx5QkFBWSxFQUFDLG9CQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckQsSUFBSTtZQUNBLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLFFBQVEsSUFBSSxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzRSxJQUFHLENBQUMsZ0JBQWdCLEVBQUM7Z0JBQ2pCLE1BQU0sT0FBTyxHQUFHLE1BQU0saUNBQXFCLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RSxJQUFHLE9BQU8sRUFBQztvQkFDUCxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzlCLE9BQU8sT0FBTyxDQUFDO2lCQUNsQjthQUNKO1lBQ0QsT0FBTyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ25FO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNuRCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBb0gsRUFBRSxhQUF3SDtRQUMxUCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEseUJBQVksRUFBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JELElBQUk7WUFDQSxNQUFNLE9BQU8sR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUM3QixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFHLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQUcsQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkNBQW9CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlKLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFvSDtRQUNoSSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEseUJBQVksRUFBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JELElBQUk7WUFDQSxNQUFNLE9BQU8sR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUM3QixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFHLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJDQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsSCxPQUFPLENBQUMsQ0FBQztTQUNaO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNuRCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBbUg7UUFDNUgsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHlCQUFZLEVBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxJQUFJO1lBQ0EsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsZUFBRyxDQUFDLFFBQVEsSUFBSSxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNsRCxPQUFPLENBQUMsQ0FBQztTQUNaO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNuRCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztDQUVKO0FBM0RELHNEQTJEQztBQUVELGtCQUFlLElBQUkscUJBQXFCLEVBQUUsQ0FBQyJ9