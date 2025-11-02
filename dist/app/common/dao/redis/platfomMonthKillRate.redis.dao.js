"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformMonthKillRateRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const pinus_logger_1 = require("pinus-logger");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const TenantGameData_mysql_dao_1 = require("../mysql/TenantGameData.mysql.dao");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
class platformMonthKillRateRedisDao {
    async insert(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.set(`${RedisDict_1.DB1.platformKillRate}`, JSON.stringify(parameter.agentList));
            return true;
        }
        catch (e) {
            logger.error(`Redis | 获取一个月代理的杀率 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async findOne(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            const playerAgentWithStr = await conn.get(`${RedisDict_1.DB1.platformKillRate}`);
            let agentList = [];
            if (!!playerAgentWithStr) {
                agentList = JSON.parse(playerAgentWithStr);
                return agentList;
            }
            else {
                const result = await TenantGameData_mysql_dao_1.default.getTenantMonthData();
                if (result && result.length != 0) {
                    const list = result.map((info) => {
                        const { profitTotal, validBetTotal } = info;
                        const winRate = validBetTotal > 0 ? ((-Number(profitTotal)) / validBetTotal).toFixed(4) : 0;
                        delete info.profitTotal;
                        delete info.validBetTotal;
                        return Object.assign({ winRate }, info);
                    });
                    await this.insert({ agentList: list });
                    return list;
                }
                else {
                    return [];
                }
            }
        }
        catch (e) {
            logger.error(`Redis | 获取一个月代理的杀率  | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
    async deleteOne(parameter) {
        try {
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            if (!conn) {
                logger.warn(`没有获得可使用的rds连接`);
                return false;
            }
            await conn.del(RedisDict_1.DB1.platformKillRate);
            return true;
        }
        catch (e) {
            logger.error(`Redis | 获取一个月代理的杀率 | 出错: ${e.stack || e.message || e}`);
            return false;
        }
    }
}
exports.platformMonthKillRateRedisDao = platformMonthKillRateRedisDao;
exports.default = new platformMonthKillRateRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvbU1vbnRoS2lsbFJhdGUucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvcGxhdGZvbU1vbnRoS2lsbFJhdGUucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUE2QztBQUM3QywrQ0FBeUM7QUFDekMsNkRBQWtEO0FBQ2xELG9EQUE0QztBQUM1QyxnRkFBdUU7QUFDdkUsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUVuRCxNQUFhLDZCQUE2QjtJQUd0QyxLQUFLLENBQUUsTUFBTSxDQUFDLFNBQThCO1FBQ3hDLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUM3QixPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUNELE1BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFaEYsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEUsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBSUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFhO1FBQ3ZCLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMs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