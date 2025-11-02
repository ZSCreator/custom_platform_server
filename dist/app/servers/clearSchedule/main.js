"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OnlinePlayer_redis_dao_1 = require("../../common/dao/redis/OnlinePlayer.redis.dao");
const Schedule = require("node-schedule");
const Player_redis_dao_1 = require("../../common/dao/redis/Player.redis.dao");
const ThirdGoldRecord_mysql_dao_1 = require("../../common/dao/mysql/ThirdGoldRecord.mysql.dao");
const WalletRecord_mysql_dao_1 = require("../../common/dao/mysql/WalletRecord.mysql.dao");
const ManagerLogs_mysql_dao_1 = require("../../common/dao/mysql/ManagerLogs.mysql.dao");
const AlarmEventThing_mysql_dao_1 = require("../../common/dao/mysql/AlarmEventThing.mysql.dao");
const RDSClient_1 = require("../../common/dao/mysql/lib/RDSClient");
const databaseService_1 = require("../../services/databaseService");
const moment = require("moment");
const PlayerGameHistory_entity_1 = require("../../common/dao/mysql/entity/PlayerGameHistory.entity");
const SumTenantOperationalData_entity_1 = require("../../common/dao/mysql/entity/SumTenantOperationalData.entity");
const SumTenantOperationalData_mysql_dao_1 = require("../../common/dao/mysql/SumTenantOperationalData.mysql.dao");
const HotGameData_mysql_dao_1 = require("../../common/dao/mysql/HotGameData.mysql.dao");
const TenantGameData_mysql_dao_1 = require("../../common/dao/mysql/TenantGameData.mysql.dao");
const connectionManager_1 = require("../../common/dao/mysql/lib/connectionManager");
const PlatformNameAgentList_redis_dao_1 = require("../../common/dao/redis/PlatformNameAgentList.redis.dao");
const platfomMonthKillRate_redis_dao_1 = require("../../common/dao/redis/platfomMonthKillRate.redis.dao");
const Scene_manager_1 = require("../../common/dao/daoManager/Scene.manager");
const BaseRedisManager_1 = require("../../common/dao/redis/lib/BaseRedisManager");
const DBCfg_enum_1 = require("../../common/dao/redis/config/DBCfg.enum");
async function resetPlayer() {
    try {
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始重置玩家自玩流水相关属性成功`);
        const sql = `UPDATE Sp_Player p
              SET
                p.addDayRmb =
                  (
                  CASE WHEN p.gold > 0
                  THEN
                    p.gold
                  ELSE
                    0
                  END),
                p.dailyFlow = 0,
                p.loginCount = 0,
                p.addDayTixian = 0
            WHERE p.addDayRmb > 0`;
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 重置mysql 流水`);
        await connectionManager_1.default.getConnection().query(sql);
        await Player_redis_dao_1.default.deleteAll({});
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 重置玩家自玩流水相关属性成功 ==> 结束`);
        return true;
    }
    catch (error) {
        console.error(`resetPlayer ==> 重置自玩流水相关信息出错：::${error.stack} `);
        return false;
    }
}
async function deletPlayerGameHistory() {
    try {
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始删除玩家 PlayerGameHistory记录`);
        const startTime = moment().subtract(3, "days").format("YYYY-MM-DD");
        await connectionManager_1.default.getConnection()
            .createQueryBuilder()
            .delete()
            .from(PlayerGameHistory_entity_1.PlayerGameHistory)
            .where(`Sp_PlayerGameHistory.createDateTime < "${startTime}"`)
            .execute();
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 删除玩家 PlayerGameHistory记录 ==> 结束`);
        return true;
    }
    catch (error) {
        console.error(`resetPlayer ==> PlayerGameHistory记录：::${error.stack} `);
        return false;
    }
}
async function start() {
    await RDSClient_1.RDSClient.demoInit();
    await (0, databaseService_1.initRedisConnection)(null);
    Schedule.scheduleJob("00 00 * * *", async function () {
        try {
            await OnlinePlayer_redis_dao_1.default.init({});
            await resetPlayer();
            return;
        }
        catch (error) {
            console.error(`resetPlayer 每日凌晨清楚玩家的登陆和新增 ==> 每日00点01:${error.stack}`);
            return;
        }
    });
    Schedule.scheduleJob("00 02 * * *", async function () {
        try {
            console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始删除上下分记录=====开始`);
            const startTime = moment().subtract(1, "weeks").format("YYYY-MM-DD");
            const startTime_month = moment().subtract(1, "month").format("YYYY-MM-DD");
            await ThirdGoldRecord_mysql_dao_1.default.deletData(startTime);
            await WalletRecord_mysql_dao_1.default.deletData(startTime);
            await ManagerLogs_mysql_dao_1.default.deletData(startTime_month);
            console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始删除上下分记录=====完成`);
            return;
        }
        catch (error) {
            console.error(`resetPlayer 每日凌晨清楚玩家的登陆和新增 ==> 每日00点01:${error.stack}`);
            return;
        }
    });
    Schedule.scheduleJob("10 02 * * *", async function () {
        try {
            console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 定时删除游戏预警记录，删除一周前的=====开始`);
            const startTime = moment().subtract(1, "weeks").format("YYYY-MM-DD");
            await AlarmEventThing_mysql_dao_1.default.deletData(startTime);
            console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 定时删除游戏预警记录，删除一周前的=====完成`);
            return;
        }
        catch (error) {
            console.error(`resetPlayer 定时删除游戏预警记录，删除一周前的 ==> 每日00点01:${error.stack}`);
            return;
        }
    });
    Schedule.scheduleJob("00 03 * * *", async function () {
        try {
            console.warn(`${moment().format("YYYY-MM-DD HH:mm:ss")} 删除玩家 PlayerGameHistory记录=====开始`);
            await deletPlayerGameHistory();
            console.warn(`${moment().format("YYYY-MM-DD HH:mm:ss")} 删除玩家 PlayerGameHistory记录=====完成`);
            return;
        }
        catch (error) {
            console.error(`resetPlayer 删除玩家 PlayerGameHistory记录 ==> 每日00点01:${error.stack}`);
            return;
        }
    });
    Schedule.scheduleJob("00 01 * * * ", async function () {
        console.warn("开始汇总数据........", moment().format("YYYY-MM-DD HH:mm:ss"));
        try {
            const lastRecord = await connectionManager_1.default.getConnection()
                .getRepository(SumTenantOperationalData_entity_1.SumTenantOperationalData)
                .createQueryBuilder("gr")
                .orderBy("gr.sumDate", "DESC")
                .getOne();
            if (!lastRecord) {
                console.warn(`没有最近汇总记录，初始化出错`);
                return;
            }
            let lastDateTime = moment(lastRecord.sumDate).format("YYYY-MM-DD HH:mm:ss");
            const diffDays = moment().diff(lastDateTime, "day");
            console.warn(`最近的汇总记录日期`, lastDateTime, diffDays);
            for (let i = 1; i < diffDays; i++) {
                const checkTargetDate1 = moment(lastDateTime).add(i, "day").format("YYYY-MM-DD");
                const checkTargetDate2 = moment(lastDateTime).add(i + 1, "day").format("YYYY-MM-DD");
                const startDateTime = `${checkTargetDate1} 00:00:00`;
                const endDateTime = `${checkTargetDate2} 00:00:00`;
                console.warn(`开始统计`, startDateTime, endDateTime);
                let tableTime = moment(startDateTime).format("YYYYMM");
                const platformList = await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(false);
                for (let key of platformList) {
                    let platformUid = key.platformUid;
                    const tableName = `Sp_GameRecord_${platformUid}_${tableTime}`;
                    const result = await SumTenantOperationalData_mysql_dao_1.default.copyTenantOperationalData(tableName, startDateTime, endDateTime);
                    await SumTenantOperationalData_mysql_dao_1.default.insertMany(result);
                }
            }
            console.warn("开始统计数据结束", moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        }
        catch (e) {
            console.error(`定时任务 | 备份、汇总每日游戏记录出错: ${e.stack}`);
        }
    });
    Schedule.scheduleJob("30 01 * * * ", async function () {
        console.warn("统计每个代理一个月的杀率........", moment().format("YYYY-MM-DD HH:mm:ss"));
        try {
            const result = await TenantGameData_mysql_dao_1.default.getTenantMonthData();
            if (result && result.length != 0) {
                const list = result.map((info) => {
                    const { profitTotal, validBetTotal } = info;
                    const winRate = validBetTotal > 0 ? ((-Number(profitTotal)) / validBetTotal).toFixed(4) : 0;
                    delete info.profitTotal;
                    delete info.validBetTotal;
                    return Object.assign({ winRate }, info);
                });
                await platfomMonthKillRate_redis_dao_1.default.insert({ agentList: list });
            }
            console.warn("统计每个代理一个月的杀率", moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        }
        catch (e) {
            console.error(`定时任务 | 统计每个代理一个月的杀率出错: ${e.stack}`);
        }
    });
    Schedule.scheduleJob("0 0 4 * * 7", async function () {
        console.warn("每周星期天凌晨1点清理45天没登陆同时金币........开始", moment().format("YYYY-MM-DD HH:mm:ss"));
        try {
            const time = moment().subtract(60, "days").format("YYYY-MM-DD 00:00:00");
            console.warn(`删除多少天以前得玩家数据:${time}`);
            const sql = `DELETE from Sp_Player
						where
						Sp_Player.pk_uid not in(select Sp_Player_Agent.fk_uid from Sp_Player_Agent WHERE Sp_Player_Agent.role_type in (2,3))
						AND Sp_Player.thirdUid is NULL`;
            await connectionManager_1.default.getConnection(false).query(sql);
            console.warn(`第一步先删除H5进游戏得玩家账号----完成`);
            const sqlToPlayerAgent = `
                        DELETE from Sp_Player_Agent
						WHERE   Sp_Player_Agent.fk_uid  in ( select Sp_Player.pk_uid FROM Sp_Player WHERE Sp_Player.gold < 100 AND Sp_Player.updateTime < "${time}")
						AND Sp_Player_Agent.role_type  = 1`;
            await connectionManager_1.default.getConnection(false).query(sqlToPlayerAgent);
            console.warn(`第二步删除代理关系长期没上线得玩家关系数据----完成`);
            const sqlToPlayer = `
                        DELETE from Sp_Player
						where
						Sp_Player.pk_uid not in(select Sp_Player_Agent.fk_uid from Sp_Player_Agent WHERE Sp_Player_Agent.role_type in (2,3))
						AND Sp_Player.gold < 100
						AND Sp_Player.updateTime < "${time}"`;
            await connectionManager_1.default.getConnection(false).query(sqlToPlayer);
            console.warn(`第三步删除长久没上线得玩家信息同时金币< 1----完成`);
            console.warn("每周星期天凌晨4点清理45天没登陆同时金币.......完成", moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        }
        catch (e) {
            console.error(`定时任务 | 每周星期天凌晨1点清理45天没登陆同时金币: ${e.stack}`);
        }
    });
    Schedule.scheduleJob("30 59 23 * * *", async function () {
        try {
            console.warn(`每日统计热门游戏数据--开始`);
            const day = moment().format("YYYY-MM-DD");
            const time = moment().format("YYYY-MM-DD 23:59:30");
            const list = await Scene_manager_1.default.getAllSceneData();
            let resultArr = [];
            const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.Persistence_DB);
            for (const sceneInfo of list) {
                let num = await conn.scard(`GameLoginStatistics:${day}:${sceneInfo.nid}:${sceneInfo.sceneId}`);
                resultArr.push({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId, playerNum: num, createTime: time });
            }
            await HotGameData_mysql_dao_1.default.insertMany(resultArr);
            console.warn(`每日统计热门游戏数据--结束`);
            const keys = await conn.keys(`GameLoginStatistics:*`);
            if (keys.length != 0) {
                await conn.del(...keys);
            }
            return;
        }
        catch (e) {
            console.error(`定时任务 | 每日统计热门游戏数据: ${e.stack}`);
        }
    });
}
start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2NsZWFyU2NoZWR1bGUvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBGQUE0RTtBQUM1RSwwQ0FBMkM7QUFDM0MsOEVBQXFFO0FBQ3JFLGdHQUF1RjtBQUN2RiwwRkFBaUY7QUFDakYsd0ZBQStFO0FBQy9FLGdHQUF1RjtBQUN2RixvRUFBK0Q7QUFDL0Qsb0VBQW1FO0FBQ25FLGlDQUFpQztBQUNqQyxxR0FBeUY7QUFDekYsbUhBQXVHO0FBQ3ZHLGtIQUF5RztBQUN6Ryx3RkFBK0U7QUFDL0UsOEZBQXFGO0FBQ3JGLG9GQUE2RTtBQUM3RSw0R0FBbUc7QUFDbkcsMEdBQWlHO0FBQ2pHLDZFQUF3RTtBQUN4RSxrRkFBdUU7QUFDdkUseUVBQWlFO0FBS2pFLEtBQUssVUFBVSxXQUFXO0lBQ3RCLElBQUk7UUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFJM0UsTUFBTSxHQUFHLEdBQUU7Ozs7Ozs7Ozs7Ozs7a0NBYWUsQ0FBQztRQUUzQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ3JFLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRW5ELE1BQU0sMEJBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ2pGLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FB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