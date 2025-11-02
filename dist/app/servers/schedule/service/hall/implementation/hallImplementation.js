"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartServerCheckGameRecordTable = exports.createGameRecordTable = exports.insertDayApiData = exports.changePlayerPosition = exports.setDelMailsJob = void 0;
const Player_manager_1 = require("../../../../../common/dao/daoManager/Player.manager");
const DayApiData_mysql_dao_1 = require("../../../../../common/dao/mysql/DayApiData.mysql.dao");
const PlayerAgent_mysql_dao_1 = require("../../../../../common/dao/mysql/PlayerAgent.mysql.dao");
const GameRecordDateTable_mysql_dao_1 = require("../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const pinus_logger_1 = require("pinus-logger");
const DayCreatePlayer_redis_dao_1 = require("../../../../../common/dao/redis/DayCreatePlayer.redis.dao");
const DayLoginPlayer_redis_dao_1 = require("../../../../../common/dao/redis/DayLoginPlayer.redis.dao");
const OnlinePlayer_redis_dao_1 = require("../../../../../common/dao/redis/OnlinePlayer.redis.dao");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const moment = require("moment");
const connectionManager_1 = require("../../../../../common/dao/mysql/lib/connectionManager");
const setDelMailsJob = async (startTime, endTime) => {
    try {
        return;
    }
    catch (error) {
        Logger.error(`setDelMailsJob ==> 删除邮件失败::${error.stack} `);
        return;
    }
};
exports.setDelMailsJob = setDelMailsJob;
async function changePlayerPosition() {
    try {
        console.warn("开始执行改变玩家position ,游戏位置");
        const sql = `UPDATE Sp_Player p SET p.position = 0 WHERE p.position > 0`;
        await connectionManager_1.default.getConnection().query(sql);
        Logger.warn("changePlayerPosition ==> 开始执行改变玩家position ,游戏位置");
        console.warn("开始执行改变玩家position ,游戏位置=========结束");
        return true;
    }
    catch (error) {
        Logger.error(`changePlayerPosition ==> 开始执行改变玩家position ,游戏位置：::${error.stack} `);
        return false;
    }
}
exports.changePlayerPosition = changePlayerPosition;
const insertDayApiData = async () => {
    try {
        console.warn("11点59分进行API得数据报表统计  ==== 开始");
        const createDate = new Date();
        const [create, login, maxOnline, result] = await Promise.all([
            DayCreatePlayer_redis_dao_1.default.getPlayerLength({}),
            DayLoginPlayer_redis_dao_1.default.getPlayerLength({}),
            OnlinePlayer_redis_dao_1.default.getOnlineMax({}),
            Player_manager_1.default.findPlayerDayLoginData()
        ]);
        const info = {
            loginLength: login,
            createLength: create,
            maxOnline: maxOnline,
            entryGold: Number(result.addDayRmb),
            leaveGold: Number(result.addDayTixian),
            selfGold: Number(result.gold),
            backRate: 0,
            entryAndLeave: Number(result.addDayRmb) - Number(result.addDayTixian),
            createDate: createDate,
        };
        await DayApiData_mysql_dao_1.default.insertOne(info);
        console.warn("11点59分进行API得数据报表统计  ==== 结束");
        return true;
    }
    catch (error) {
        Logger.error(`insertDayApiData ==> 每日晚上11点59分进行API得数据报表统计::${error.stack} `);
        return false;
    }
};
exports.insertDayApiData = insertDayApiData;
const createGameRecordTable = async () => {
    try {
        console.warn("开始创建游戏记录分表 === 开始");
        const timeTableName = moment().add(1, 'month').format("YYYYMM");
        const platformList = await PlayerAgent_mysql_dao_1.default.findList({ roleType: 2 });
        for (let platform of platformList) {
            const uid = platform.uid;
            if (uid) {
                let tableName = `${uid}_${timeTableName}`;
                await GameRecordDateTable_mysql_dao_1.default.createTable(tableName);
            }
        }
        await GameRecordDateTable_mysql_dao_1.default.createTable(timeTableName);
        console.warn("开始创建游戏记录分表  ==== 结束");
        return true;
    }
    catch (error) {
        Logger.error(`insertDayApiData ==> 定时每个月28号创建对应得游戏记录表::${error.stack} `);
        return false;
    }
};
exports.createGameRecordTable = createGameRecordTable;
const StartServerCheckGameRecordTable = async () => {
    try {
        console.warn("启动服务器的时候先校验当前月的数据库存在的平台是否存在这些表 === 开始");
        const timeTableName = moment().format("YYYYMM");
        const platformList = await PlayerAgent_mysql_dao_1.default.findList({ roleType: 2 });
        for (let platform of platformList) {
            const uid = platform.uid;
            if (uid) {
                let tableName = `${uid}_${timeTableName}`;
                const isExists = await GameRecordDateTable_mysql_dao_1.default.tableBeExists(tableName);
                if (!isExists) {
                    await GameRecordDateTable_mysql_dao_1.default.createTable(tableName);
                }
            }
        }
        const isExists = await GameRecordDateTable_mysql_dao_1.default.tableBeExists(timeTableName);
        if (!isExists) {
            await GameRecordDateTable_mysql_dao_1.default.createTable(timeTableName);
        }
        console.warn("启动服务器的时候先校验当前月的数据库存在的平台是否存在这些表  ==== 结束");
        return true;
    }
    catch (error) {
        Logger.error(`StartServerCheckGameRecordTable ==> 启动服务器的时候先校验当前月的数据库存在的平台是否存在这些表::${error.stack} `);
        return false;
    }
};
exports.StartServerCheckGameRecordTable = StartServerCheckGameRecordTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFsbEltcGxlbWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvc2NoZWR1bGUvc2VydmljZS9oYWxsL2ltcGxlbWVudGF0aW9uL2hhbGxJbXBsZW1lbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSx3RkFBbUY7QUFFbkYsK0ZBQWlGO0FBQ2pGLGlHQUFtRjtBQUNuRixpSEFBbUc7QUFDbkcsK0NBQXlDO0FBQ3pDLHlHQUFnRztBQUNoRyx1R0FBOEY7QUFDOUYsbUdBQTBGO0FBRzFGLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkQsaUNBQWlDO0FBQ2pDLDZGQUFzRjtBQU8vRSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxFQUFFO0lBQ3ZELElBQUk7UUFNQSxPQUFPO0tBQ1Y7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzNELE9BQU87S0FDVjtBQUNMLENBQUMsQ0FBQztBQVpXLFFBQUEsY0FBYyxrQkFZekI7QUFjSyxLQUFLLFVBQVUsb0JBQW9CO0lBQ3RDLElBQUk7UUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUE7UUFHdEMsTUFBTSxHQUFHLEdBQUcsNERBQTRELENBQUM7UUFFekUsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQTtRQUNqRCxPQUFPLElBQUksQ0FBQztLQUNmO0lBQUMsT0FBTyxLQUFLLEVB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