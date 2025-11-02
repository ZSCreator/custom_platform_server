"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OnlinePlayer_redis_dao_1 = require("../../common/dao/redis/OnlinePlayer.redis.dao");
const Schedule = require("node-schedule");
const Player_redis_dao_1 = require("../../common/dao/redis/Player.redis.dao");
const WalletRecord_mysql_dao_1 = require("../../common/dao/mysql/WalletRecord.mysql.dao");
const AlarmEventThing_mysql_dao_1 = require("../../common/dao/mysql/AlarmEventThing.mysql.dao");
const RDSClient_1 = require("../../common/dao/mysql/lib/RDSClient");
const databaseService_1 = require("../../services/databaseService");
const moment = require("moment");
const PlayerGameHistory_entity_1 = require("../../common/dao/mysql/entity/PlayerGameHistory.entity");
const SumTenantOperationalData_entity_1 = require("../../common/dao/mysql/entity/SumTenantOperationalData.entity");
const SumTenantOperationalData_mysql_dao_1 = require("../../common/dao/mysql/SumTenantOperationalData.mysql.dao");
const PlayerRebateRecord_mysql_dao_1 = require("../../common/dao/mysql/PlayerRebateRecord.mysql.dao");
const PayInfo_mysql_dao_1 = require("../../common/dao/mysql/PayInfo.mysql.dao");
const PlayerCashRecord_mysql_dao_1 = require("../../common/dao/mysql/PlayerCashRecord.mysql.dao");
const SignRecord_mysql_dao_1 = require("../../common/dao/mysql/SignRecord.mysql.dao");
const PlayerRebate_mysql_dao_1 = require("../../common/dao/mysql/PlayerRebate.mysql.dao");
const Player_manager_1 = require("../../common/dao/daoManager/Player.manager");
const DayPlayerRebateRecord_mysql_dao_1 = require("../../common/dao/mysql/DayPlayerRebateRecord.mysql.dao");
const OperationalRetention_mysql_dao_1 = require("../../common/dao/mysql/OperationalRetention.mysql.dao");
const PromotionReportApp_mysql_dao_1 = require("../../common/dao/mysql/PromotionReportApp.mysql.dao");
const PlayerReceiveRebateRecord_mysql_dao_1 = require("../../common/dao/mysql/PlayerReceiveRebateRecord.mysql.dao");
const HotGameData_mysql_dao_1 = require("../../common/dao/mysql/HotGameData.mysql.dao");
const TenantGameData_mysql_dao_1 = require("../../common/dao/mysql/TenantGameData.mysql.dao");
const connectionManager_1 = require("../../common/dao/mysql/lib/connectionManager");
const PlatformNameAgentList_redis_dao_1 = require("../../common/dao/redis/PlatformNameAgentList.redis.dao");
const platfomMonthKillRate_redis_dao_1 = require("../../common/dao/redis/platfomMonthKillRate.redis.dao");
const Scene_manager_1 = require("../../common/dao/daoManager/Scene.manager");
const BaseRedisManager_1 = require("../../common/dao/redis/lib/BaseRedisManager");
const DBCfg_enum_1 = require("../../common/dao/redis/config/DBCfg.enum");
const PlayerAgent_mysql_dao_1 = require("../../common/dao/mysql/PlayerAgent.mysql.dao");
const index_1 = require("../../utils/index");
async function resetPlayer() {
    try {
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始重置玩家自玩流水相关属性`);
        await everDayOperationalRetention();
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 统计玩家当日数据表完成(今日充值，今日提现)`);
        const sql = `UPDATE Sp_Player p
              SET
                p.addDayRmb = 0,
                p.addDayTixian = 0,
                p.dailyFlow = 0,
                p.loginCount = 0,
                p.alms = 0`;
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
async function everDayOperationalRetention() {
    console.warn("开始每日每日留存报表的数据统计........", moment().format("YYYY-MM-DD HH:mm:ss"));
    try {
        let now = Date.now() - 1000 * 60 * 60 * 3;
        let time = moment(now).format("YYYY-MM-DD 23:00:00");
        let startTime = moment(now).format("YYYY-MM-DD 00:00:00");
        let endTime = moment(now).add(1, 'day').format("YYYY-MM-DD 00:00:00");
        const platformNameList = await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(false);
        const platformList = await PlatformNameAgentList_redis_dao_1.default.findList(false);
        for (let platformName of platformNameList) {
            const name = platformName.platformName;
            const platformUid = platformName.platformUid;
            const key = platformList.find(x => x.platformName == name);
            if (!key) {
                break;
            }
            const groupRemarkList = key.list;
            const bet_players = await Player_manager_1.default.todayBetPlayer(platformUid, startTime, endTime);
            const add_players = await Player_manager_1.default.todayAddPlayer_uid(platformUid, startTime, endTime);
            const rmb_players = await PayInfo_mysql_dao_1.default.todayAddTotal_fee_uid(groupRemarkList, startTime, endTime);
            const result = [];
            for (let m of groupRemarkList) {
                let allAddRmb = 0;
                const players_bet = bet_players.filter(x => x.agentName == m);
                const bet_uids = players_bet.map(x => x.uid);
                const players_add = add_players.filter(x => x.agentName == m);
                const add_uids = players_add.map(x => x.uid);
                const players_rmb = rmb_players.filter(x => x.agentName == m);
                let rmb_uids = [];
                for (let m of players_rmb) {
                    rmb_uids.push(m.uid);
                    allAddRmb += Number(m.todayAddRmb);
                }
                let info = {
                    agentName: m,
                    betPlayer: bet_uids,
                    addPlayer: add_uids,
                    AddRmbPlayer: rmb_uids,
                    allAddRmb: allAddRmb,
                    secondNum: 0,
                    threeNum: 0,
                    sevenNum: 0,
                    fifteenNum: 0,
                    createDate: time,
                };
                result.push(info);
            }
            OperationalRetention_mysql_dao_1.default.insertMany(result);
        }
        console.warn("结束每日留存报表的数据统计........", moment().format("YYYY-MM-DD HH:mm:ss"));
        return true;
    }
    catch (e) {
        console.error(`定时任务 | 开始每日每日留存报表的数据统计出错: ${e.stack}`);
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
            await WalletRecord_mysql_dao_1.default.deletData(startTime);
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
                    if (result && result.length > 0) {
                        await SumTenantOperationalData_mysql_dao_1.default.insertMany(result);
                    }
                }
            }
            console.warn("开始统计数据结束", moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        }
        catch (e) {
            console.error(`定时任务 | 开始汇总数据出错: ${e.stack}`);
        }
    });
    Schedule.scheduleJob("40 01 * * * ", async function () {
        console.warn("开始每日渠道推广统计........", moment().format("YYYY-MM-DD HH:mm:ss"));
        try {
            let now = Date.now() - 1000 * 60 * 60 * 3;
            let time = moment(now).format("YYYY-MM-DD 23:00:00");
            let startTime = moment(now).format("YYYY-MM-DD 00:00:00");
            let endTime = moment(now).add(1, 'day').format("YYYY-MM-DD 00:00:00");
            const result_player = await Player_manager_1.default.todayAddPlayer(startTime, endTime);
            const result_pay = await PayInfo_mysql_dao_1.default.todayAddTotal_fee(startTime, endTime);
            const result_tixian = await PlayerCashRecord_mysql_dao_1.default.todayAddTixian(startTime, endTime);
            const result_flow = await SumTenantOperationalData_mysql_dao_1.default.todayAddFlow(startTime, endTime);
            const platformList = await PlatformNameAgentList_redis_dao_1.default.findList(false);
            for (let platform of platformList) {
                const list = platform.list;
                const platformName = platform.platformName;
                let insertMany = [];
                for (let m of list) {
                    let info = {
                        agentUid: null,
                        agentName: m,
                        platformName: platformName,
                        todayPlayer: 0,
                        todayAddRmb: 0,
                        todayTixian: 0,
                        todayFlow: 0,
                        todayCommission: 0,
                        createDate: time,
                    };
                    if (result_player) {
                        let item_player = result_player.find(x => x.agentName == m);
                        if (item_player) {
                            info.todayPlayer = item_player.todayPlayer.length;
                        }
                    }
                    if (result_pay) {
                        let item_pay = result_pay.find(x => x.agentName == m);
                        if (item_pay) {
                            info.todayAddRmb = Number(item_pay.todayAddRmb);
                        }
                    }
                    if (result_tixian) {
                        let item_tixian = result_tixian.find(x => x.agentName == m);
                        if (item_tixian) {
                            info.todayTixian = Number(item_tixian.todayTixian);
                        }
                    }
                    if (result_flow) {
                        let item_flow = result_flow.find(x => x.groupRemark == m);
                        if (item_flow) {
                            info.todayFlow = Number(item_flow.validBetTotal);
                            info.agentUid = item_flow.uid;
                            info.todayCommission = Number(item_flow.bet_commissionTotal) + Number(item_flow.win_commissionTotal) + Number(item_flow.settle_commissionTotal);
                        }
                    }
                    if (!info.agentUid) {
                        const playerAgent = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: m });
                        if (playerAgent) {
                            info.agentUid = playerAgent.uid;
                        }
                    }
                    insertMany.push(info);
                }
                PromotionReportApp_mysql_dao_1.default.insertMany(insertMany);
            }
            return true;
        }
        catch (e) {
            console.error(`定时任务 | 开始每日渠道推广统计记录出错: ${e.stack}`);
        }
    });
    Schedule.scheduleJob("00 02 * * * ", async function () {
        console.warn("开始每日对15内的留存报表进行修改........", moment().format("YYYY-MM-DD HH:mm:ss"));
        try {
            let now = Date.now();
            let endTime = moment(now).format("YYYY-MM-DD 00:00:00");
            let startTime = moment(now).subtract(16, 'day').format("YYYY-MM-DD 00:00:00");
            const platformList = await PlatformNameAgentList_redis_dao_1.default.findList(false);
            for (let platform of platformList) {
                const agentNameList = platform.list;
                for (let agentName of agentNameList) {
                    const list = await OperationalRetention_mysql_dao_1.default.getOperationalRetentionList_AgentName(agentName, startTime, endTime);
                    if (list.length > 0) {
                        await this.updateOperationalRetention(list, endTime);
                    }
                }
            }
            console.warn("结束每日对15内的留存报表进行修改........", moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        }
        catch (e) {
            console.error(`定时任务 | 开始每日对15内的留存报表进行修改出错: ${e.stack}`);
        }
    });
    async function updateOperationalRetention(list, endTime) {
        let startTime_3 = moment(endTime).subtract(1, 'day').format("YYYY-MM-DD 00:00:00");
        let endTime_3 = moment(endTime).subtract(0, 'day').format("YYYY-MM-DD 00:00:00");
        let today = list.find(x => x.createDate > new Date(startTime_3) && x.createDate < new Date(endTime_3));
        if (today) {
            let ss = [1, 3, 7, 15];
            let betPlayer = JSON.parse(today.betPlayer);
            for (let m of ss) {
                let startTime_2 = moment(startTime_3).subtract(m, 'day').format("YYYY-MM-DD 00:00:00");
                let endTime_2 = moment(startTime_3).subtract(m - 1, 'day').format("YYYY-MM-DD 00:00:00");
                const item = list.find(x => x.createDate > new Date(startTime_2) && x.createDate < new Date(endTime_2));
                if (item) {
                    let item_addPlayer = JSON.parse(item.addPlayer);
                    let arr_ = (0, index_1.array_same_list)(betPlayer, item_addPlayer);
                    if (arr_ && arr_.length > 0) {
                        let num = Math.floor((arr_.length / item_addPlayer.length) * 100);
                        if (m == 1) {
                            await OperationalRetention_mysql_dao_1.default.updateOne({ id: item.id }, { secondNum: num });
                        }
                        else if (m == 3) {
                            await OperationalRetention_mysql_dao_1.default.updateOne({ id: item.id }, { threeNum: num });
                        }
                        else if (m == 7) {
                            await OperationalRetention_mysql_dao_1.default.updateOne({ id: item.id }, { sevenNum: num });
                        }
                        else if (m == 15) {
                            await OperationalRetention_mysql_dao_1.default.updateOne({ id: item.id }, { fifteenNum: num });
                        }
                    }
                }
            }
        }
    }
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
    Schedule.scheduleJob("00 00 01 * * *", async function () {
        try {
            console.warn(`每日统计前一天得玩家的直属返佣--开始`);
            const startTime = moment().subtract(1, 'days').format("YYYY-MM-DD 00:00:00");
            const endTime = moment().subtract(1, 'days').format("YYYY-MM-DD 23:59:59:999");
            let time = moment().subtract(1, 'days').format("YYYY-MM-DD 23:00:00");
            const list = await PlayerRebateRecord_mysql_dao_1.default.getStatisticsUid(startTime, endTime);
            if (list && list.length > 0) {
                for (const item of list) {
                    let res = await PlayerRebateRecord_mysql_dao_1.default.getDayPlayerRebateForUid(item.uid, startTime, endTime);
                    let resultList = [];
                    for (let m of res) {
                        m['createDate'] = time;
                        resultList.push(m);
                    }
                    await DayPlayerRebateRecord_mysql_dao_1.default.insertMany(res);
                }
            }
            console.warn(`每日统计前一天得玩家的直属返佣--结束`);
            return;
        }
        catch (e) {
            console.error(`定时任务 | 每日统计前一天得玩家的直属返佣: ${e.stack}`);
        }
    });
    Schedule.scheduleJob("00 01 00 * * *", async function () {
        try {
            console.warn(`每日每日玩家自动领取--开始`);
            let time = moment().subtract(1, 'days').format("YYYY-MM-DD 23:59:00");
            const list = await PlayerRebate_mysql_dao_1.default.getPlayerRebate();
            if (list && list.length > 0) {
                for (const item of list) {
                    let gold = item.todayRebate + item.iplRebate;
                    await Player_manager_1.default.updatePlayerGold(item.uid, gold);
                    await PlayerRebate_mysql_dao_1.default.updateDelRebate(item.uid, item.todayRebate);
                    PlayerReceiveRebateRecord_mysql_dao_1.default.insertOne({ uid: item.uid, rebate: gold, createDate: new Date(time) });
                }
            }
            console.warn(`每日每日玩家自动领取--结束`);
            return;
        }
        catch (e) {
            console.error(`定时任务 | 每日玩家自动领取: ${e.stack}`);
        }
    });
    Schedule.scheduleJob("00 00 03 * * *", async function () {
        try {
            console.warn(`每日每日玩家自动领取--开始`);
            let time = moment().subtract(30, 'days').format("YYYY-MM-DD 00:00:00");
            let signTime = moment().subtract(15, 'days').format("YYYY-MM-DD 00:00:00");
            await PlayerReceiveRebateRecord_mysql_dao_1.default.deletePlayerReceiveRebateRecord(time);
            await DayPlayerRebateRecord_mysql_dao_1.default.deleteDayPlayerRebateRecord(time);
            await PlayerRebateRecord_mysql_dao_1.default.deletePlayerRebateRecord(time);
            await SignRecord_mysql_dao_1.default.deleteSignRecord(signTime);
            console.warn(`每日每日玩家自动领取--结束`);
            return;
        }
        catch (e) {
            console.error(`定时任务 | 每日玩家自动领取: ${e.stack}`);
        }
    });
}
start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbl9hcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jbGVhclNjaGVkdWxlL21haW5fYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMEZBQTRFO0FBQzVFLDBDQUEyQztBQUMzQyw4RUFBcUU7QUFDckUsMEZBQWlGO0FBQ2pGLGdHQUF1RjtBQUN2RixvRUFBK0Q7QUFDL0Qsb0VBQW1FO0FBQ25FLGlDQUFpQztBQUNqQyxxR0FBeUY7QUFDekYsbUhBQXVHO0FBQ3ZHLGtIQUF5RztBQUN6RyxzR0FBNkY7QUFDN0YsZ0ZBQXVFO0FBQ3ZFLGtHQUF5RjtBQUN6RixzRkFBNkU7QUFDN0UsMEZBQWlGO0FBQ2pGLCtFQUEwRTtBQUMxRSw0R0FBbUc7QUFDbkcsMEdBQWlHO0FBQ2pHLHNHQUE2RjtBQUM3RixvSEFBMkc7QUFDM0csd0ZBQStFO0FBQy9FLDhGQUFxRjtBQUNyRixvRkFBNkU7QUFDN0UsNEdBQW1HO0FBQ25HLDBHQUFpRztBQUNqRyw2RUFBd0U7QUFDeEUsa0ZBQXVFO0FBQ3ZFLHlFQUFpRTtBQUNqRSx3RkFBK0U7QUFDL0UsNkNBQWtEO0FBS2xELEtBQUssVUFBVSxXQUFXO0lBQ3RCLElBQUk7UUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFRekUsTUFBTSwyQkFBMkIsRUFBRSxDQUFDO1FBRXBDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMseUJBQXlCLENBQUMsQ0FBQTtRQUdqRixNQUFNLEdBQUcsR0FBRTs7Ozs7OzJCQU1RLENBQUM7UUFFcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUNyRSxNQUFN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