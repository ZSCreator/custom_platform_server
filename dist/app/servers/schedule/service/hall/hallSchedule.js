"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHallScheduleJob = void 0;
const Utils = require("../../../../utils");
const Schedule = require("node-schedule");
const HallImplementation = require("../hall/implementation/hallImplementation");
const pinus_logger_1 = require("pinus-logger");
const OnlinePlayer_redis_dao_1 = require("../../../../common/dao/redis/OnlinePlayer.redis.dao");
const DayCreatePlayer_redis_dao_1 = require("../../../../common/dao/redis/DayCreatePlayer.redis.dao");
const DayLoginPlayer_redis_dao_1 = require("../../../../common/dao/redis/DayLoginPlayer.redis.dao");
const AlarmEventThing_redis_dao_1 = require("../../../../common/dao/redis/AlarmEventThing.redis.dao");
const AlarmEventThing_mysql_dao_1 = require("../../../../common/dao/mysql/AlarmEventThing.mysql.dao");
const ThirdGoldRecord_redis_dao_1 = require("../../../../common/dao/redis/ThirdGoldRecord.redis.dao");
const ThirdGoldRecord_mysql_dao_1 = require("../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao");
const pinus_1 = require("pinus");
const PlatformNameAgentList_redis_dao_1 = require("../../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const vipSystemService_1 = require("../../../../services/activity/vipSystemService");
const redisManager = require("../../../../common/dao/redis/lib/redisManager");
const DatabaseConst = require("../../../../consts/databaseConst");
const Logger = (0, pinus_logger_1.getLogger)("server_out", __filename);
async function setHallScheduleJob() {
    console.warn(`开始执行大厅方面的定时任务`);
    await resetPlayer();
    await OnlinePlayer_redis_dao_1.default.delete({});
    await (0, vipSystemService_1.initVipConfig)();
    await checkPlatformAgentUid();
    await removePlayerLoginAndCreate();
    await insertDayApiData();
    await checkAlarmThingAndThirdGold();
    await createGameRecordTable();
    await clearOnlinePlayer();
    await clearBigWinNotice();
}
exports.setHallScheduleJob = setHallScheduleJob;
async function checkPlatformAgentUid() {
    try {
        await PlatformNameAgentList_redis_dao_1.default.deleteAll({});
        await Promise.all([
            PlatformNameAgentList_redis_dao_1.default.findList(true),
            PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(true)
        ]);
        return;
    }
    catch (error) {
        Logger.error(`启动服务器的时候重新配置平台 =====${error.stack}`);
        return;
    }
}
async function createGameRecordTable() {
    await HallImplementation.StartServerCheckGameRecordTable();
    Schedule.scheduleJob("00 00 04 28 * *", async function () {
        try {
            await HallImplementation.createGameRecordTable();
            return;
        }
        catch (error) {
            Logger.error(`insertDayApiData 每日晚上11点59分进行API得数据报表统计 ==> ${error.stack}`);
            return;
        }
    });
}
function setDelMailsJob() {
    Schedule.scheduleJob("10 01 * * *", async function () {
        try {
            const time = Date.now() - 7 * 24 * 60 * 60 * 1000;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + 7 * 24 * 60 * 60 * 1000;
            await HallImplementation.setDelMailsJob(startTime, endTime);
            return;
        }
        catch (error) {
            Logger.error(`changeAgentBackRecord ==> 每日00点01:${error.stack}`);
            return;
        }
    });
}
async function removePlayerLoginAndCreate() {
    Schedule.scheduleJob("00 00 * * *", async function () {
        try {
            console.warn("每日凌晨清楚玩家的登陆和新增");
            await Promise.all([
                DayLoginPlayer_redis_dao_1.default.delete({}),
                DayCreatePlayer_redis_dao_1.default.delete({}),
            ]);
            return;
        }
        catch (error) {
            Logger.error(`removePlayerLoginAndCreate ==> 每日00点01:${error.stack}`);
            return;
        }
    });
}
async function resetPlayer() {
    Schedule.scheduleJob("00 00 * * *", async function () {
        try {
            await OnlinePlayer_redis_dao_1.default.init({});
            return;
        }
        catch (error) {
            Logger.error(`resetPlayer 每日凌晨清楚玩家的登陆和新增 ==> 每日00点01:${error.stack}`);
            return;
        }
    });
}
async function changePlayerPosition() {
    try {
        await HallImplementation.changePlayerPosition();
        return;
    }
    catch (error) {
        Logger.error(`resetPlayer 每日凌晨清楚玩家的登陆和新增 ==> 每日00点01:${error.stack}`);
        return;
    }
}
async function insertDayApiData() {
    Schedule.scheduleJob("00 59 23 * * *", async function () {
        try {
            await HallImplementation.insertDayApiData();
            return;
        }
        catch (error) {
            Logger.error(`insertDayApiData 每日晚上11点59分进行API得数据报表统计 ==> ${error.stack}`);
            return;
        }
    });
}
async function checkAlarmThingAndThirdGold() {
    console.warn("每5分钟校验上下分预警和预警");
    const [alarmLength, thirdGoldLength] = await Promise.all([
        AlarmEventThing_mysql_dao_1.default.findListToLimitStatus(0),
        ThirdGoldRecord_mysql_dao_1.default.findListForStatus({}),
    ]);
    await Promise.all([
        AlarmEventThing_redis_dao_1.default.init({ length: alarmLength }),
        ThirdGoldRecord_redis_dao_1.default.init({ length: thirdGoldLength })
    ]);
    Schedule.scheduleJob(" */5 * * * *", async function () {
        try {
            const [alarmLength, thirdGoldLength] = await Promise.all([
                AlarmEventThing_mysql_dao_1.default.findListToLimitStatus(0),
                ThirdGoldRecord_mysql_dao_1.default.findListForStatus({}),
            ]);
            await Promise.all([
                AlarmEventThing_redis_dao_1.default.init({ length: alarmLength }),
                ThirdGoldRecord_redis_dao_1.default.init({ length: thirdGoldLength })
            ]);
            return;
        }
        catch (error) {
            Logger.error(`checkAlarmThingAndThirdGold 每5分钟校验上下分预警和预警 ==> ${error.stack}`);
            return;
        }
    });
}
async function clearOnlinePlayer() {
    console.warn(`每半个小时进行一次在线玩家剔除--开始`);
    Schedule.scheduleJob(" */30 * * * *", async function () {
        try {
            const onlinePlayers = await OnlinePlayer_redis_dao_1.default.findList();
            if (onlinePlayers.length == 0) {
                return;
            }
            for (let pl of onlinePlayers) {
                if (pl.frontendServerId) {
                    const isOnline = await pinus_1.pinus.app.rpc.connector.enterRemote.checkPlayerSession.toServer(pl.frontendServerId, pl.uid);
                    if (!isOnline) {
                        await OnlinePlayer_redis_dao_1.default.deleteOne({ uid: pl.uid });
                        Logger.warn(`在线玩家剔除成功：uid:${pl.uid}, time:${new Date()},nid: ${pl.nid} ,sceneId:${pl.sceneId}`);
                    }
                }
            }
            return;
        }
        catch (e) {
            Logger.error(`定时任务 | 每半个小时进行一次在线玩家剔除: ${e.stack}`);
        }
    });
}
async function clearBigWinNotice() {
    await redisManager.deleteKeyFromRedis(DatabaseConst.BIG_WIN_NOTICE_ARR_SET);
    return;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFsbFNjaGVkdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvc2NoZWR1bGUvc2VydmljZS9oYWxsL2hhbGxTY2hlZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUliLDJDQUE0QztBQUM1QywwQ0FBMkM7QUFDM0MsZ0ZBQWlGO0FBQ2pGLCtDQUF5QztBQUN6QyxnR0FBa0Y7QUFDbEYsc0dBQTZGO0FBQzdGLG9HQUEyRjtBQUMzRixzR0FBNkY7QUFDN0Ysc0dBQTZGO0FBQzdGLHNHQUE2RjtBQUM3RixzR0FBNkY7QUFPN0YsaUNBQThCO0FBRTlCLGtIQUF5RztBQU16RyxxRkFBK0U7QUFDL0UsOEVBQThFO0FBQzlFLGtFQUFrRTtBQUNsRSxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRTVDLEtBQUssVUFBVSxrQkFBa0I7SUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQVU5QixNQUFNLFdBQVcsRUFBRSxDQUFDO0lBSXBCLE1BQU0sZ0NBQWUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFRakMsTUFBTSxJQUFBLGdDQUFhLEdBQUUsQ0FBQztJQUlwQixNQUFNLHFCQUFxQixFQUFFLENBQUM7SUF3QmhDLE1BQU0sMEJBQTBCLEVBQUUsQ0FBQztJQUtuQyxNQUFNLGdCQUFnQixFQUFFLENBQUM7SUFRekIsTUFBTSwyQkFBMkIsRUFBRSxDQUFBO0lBTWpDLE1BQU0scUJBQXFCLEVBQUUsQ0FBQztJQUs5QixNQUFNLGlCQUFpQixFQUFFLENBQUM7SUFLMUIsTUFBTSxpQkFBaUIsRUFBRSxDQUFDO0FBRTlCLENBQUM7QUFsRkQsZ0RBa0ZDO0FBT0QsS0FBSyxVQUFVLHFCQUFxQjtJQUNoQyxJQUFJO1FBRUEsTUFBTSx5Q0FBNkIsQ0FBQyxTQUFTLENBQUMs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