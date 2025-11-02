import OnlinePlayerDao from "../../common/dao/redis/OnlinePlayer.redis.dao";
import Schedule = require("node-schedule");
import PlayerRedisDao from "../../common/dao/redis/Player.redis.dao";
import ThirdGoldRecordMysqlDao from "../../common/dao/mysql/ThirdGoldRecord.mysql.dao";
import WalletRecordMysqlDao from "../../common/dao/mysql/WalletRecord.mysql.dao";
import ManagerLogsMysqlDao from "../../common/dao/mysql/ManagerLogs.mysql.dao";
import AlarmEventThingMysqlDao from "../../common/dao/mysql/AlarmEventThing.mysql.dao";
import {RDSClient} from "../../common/dao/mysql/lib/RDSClient";
import {initRedisConnection} from "../../services/databaseService";
import * as moment from "moment";
import {PlayerGameHistory} from "../../common/dao/mysql/entity/PlayerGameHistory.entity";
import {SumTenantOperationalData} from "../../common/dao/mysql/entity/SumTenantOperationalData.entity";
import SumTenantOperationalDataMysqlDao from "../../common/dao/mysql/SumTenantOperationalData.mysql.dao";
import HotGameDataMysqlDao from "../../common/dao/mysql/HotGameData.mysql.dao";
import TenantGameDataMysqlDao from "../../common/dao/mysql/TenantGameData.mysql.dao";
import ConnectionManager from "../../common/dao/mysql/lib/connectionManager";
import PlatformNameAgentListRedisDao from "../../common/dao/redis/PlatformNameAgentList.redis.dao";
import platfomMonthKillRateRedisDao from "../../common/dao/redis/platfomMonthKillRate.redis.dao";
import SceneManagerDao from "../../common/dao/daoManager/Scene.manager";
import redisManager from "../../common/dao/redis/lib/BaseRedisManager";
import {RedisDB} from "../../common/dao/redis/config/DBCfg.enum";

/**
 * 修正玩家属性
 */
async function resetPlayer() {
    try {
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始重置玩家自玩流水相关属性成功`)

        //采用sql语句得形式修改
        /** step1 批量处理数据库中所有 dailyFlow > 0 得玩家属性*/
        const sql= `UPDATE Sp_Player p
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

        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 重置mysql 流水`)
        await ConnectionManager.getConnection().query(sql);
        /** step2 修改删除redis得数据*/
        await PlayerRedisDao.deleteAll({});
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 重置玩家自玩流水相关属性成功 ==> 结束`);
        return true;
    } catch (error) {
        console.error(`resetPlayer ==> 重置自玩流水相关信息出错：::${error.stack} `);
        return false;
    }
}

/**
 * 删除玩家 PlayerGameHistory记录
 */

async function deletPlayerGameHistory() {
    try {
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始删除玩家 PlayerGameHistory记录`)
        const startTime =  moment().subtract(3, "days").format("YYYY-MM-DD");
         await ConnectionManager.getConnection()
            .createQueryBuilder()
            .delete()
            .from(PlayerGameHistory)
            .where(`Sp_PlayerGameHistory.createDateTime < "${startTime}"` )
            .execute();

        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 删除玩家 PlayerGameHistory记录 ==> 结束`);
        return true;
    } catch (error) {
        console.error(`resetPlayer ==> PlayerGameHistory记录：::${error.stack} `);
        return false;
    }
}





async function start() {
    /**
     * 连接数据库
     */
    await RDSClient.demoInit();
    /**
     * 连接redis
     */
    await initRedisConnection(null);

    Schedule.scheduleJob("00 00 * * *", async function () {
        try {

            /**
             * 充值当日在线最高人数
             */
            await OnlinePlayerDao.init({});
            await resetPlayer();

            return;
        } catch (error) {
            console.error(`resetPlayer 每日凌晨清楚玩家的登陆和新增 ==> 每日00点01:${error.stack}`);
            return;
        }
    });

    /**
     * 定时删除上下分记录，删除一周前的
      */
    Schedule.scheduleJob("00 02 * * *", async function () {
        try {
            console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始删除上下分记录=====开始`);
            const startTime =  moment().subtract(1, "weeks").format("YYYY-MM-DD");
            const startTime_month =  moment().subtract(1, "month").format("YYYY-MM-DD");
            /**
             * 定时删除上下分记录，删除一周前的
             */
            await ThirdGoldRecordMysqlDao.deletData(startTime);
            /**
             * 删除一周前的红包转账记录
             */
            await WalletRecordMysqlDao.deletData(startTime);

            /**
             * 删除一个月前的服务器日志记录
             */
            await ManagerLogsMysqlDao.deletData(startTime_month);


            console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始删除上下分记录=====完成`);
            return;
        } catch (error) {
            console.error(`resetPlayer 每日凌晨清楚玩家的登陆和新增 ==> 每日00点01:${error.stack}`);
            return;
        }
    });


    /**
     * 定时删除游戏预警记录，删除一周前的
     */
    Schedule.scheduleJob("10 02 * * *", async function () {
        try {
            console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 定时删除游戏预警记录，删除一周前的=====开始`);
            const startTime =  moment().subtract(1, "weeks").format("YYYY-MM-DD");
            /**
             * 定时删除游戏预警记录，删除一周前的
             */
            await AlarmEventThingMysqlDao.deletData(startTime);
            console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 定时删除游戏预警记录，删除一周前的=====完成`);
            return;
        } catch (error) {
            console.error(`resetPlayer 定时删除游戏预警记录，删除一周前的 ==> 每日00点01:${error.stack}`);
            return;
        }
    });

    /**
     * 删除玩家 PlayerGameHistory记录
     */

    Schedule.scheduleJob("00 03 * * *", async function () {
        try {
            console.warn(`${moment().format("YYYY-MM-DD HH:mm:ss")} 删除玩家 PlayerGameHistory记录=====开始`);
            await deletPlayerGameHistory();
            console.warn(`${moment().format("YYYY-MM-DD HH:mm:ss")} 删除玩家 PlayerGameHistory记录=====完成`);
            return;
        } catch (error) {
            console.error(`resetPlayer 删除玩家 PlayerGameHistory记录 ==> 每日00点01:${error.stack}`);
            return;
        }
    });





    //每日凌晨1点
    Schedule.scheduleJob("00 01 * * * ", async function () {
        console.warn("开始汇总数据........",moment().format("YYYY-MM-DD HH:mm:ss"));
        try {
            /** Step 1: 获取主表信息判断是否迁移数据 */

            const lastRecord = await ConnectionManager.getConnection()
                    .getRepository(SumTenantOperationalData)
                    .createQueryBuilder("gr")
                    .orderBy("gr.sumDate", "DESC")
                    .getOne();
            if (!lastRecord) {
                console.warn(`没有最近汇总记录，初始化出错`);
                return;
            }
            // let sumDate = '2021-08-10 00:00:00';
            let lastDateTime = moment(lastRecord.sumDate).format("YYYY-MM-DD HH:mm:ss");
            const diffDays = moment().diff(lastDateTime, "day");

            console.warn(`最近的汇总记录日期`, lastDateTime, diffDays);

            for (let i = 1; i < diffDays; i++) {
                const checkTargetDate1 = moment(lastDateTime).add(i, "day").format("YYYY-MM-DD");
                const checkTargetDate2 = moment(lastDateTime).add(i + 1, "day").format("YYYY-MM-DD");
                const startDateTime = `${checkTargetDate1} 00:00:00`;
                const endDateTime = `${checkTargetDate2} 00:00:00`;
                /** Step 2.2.2: 统计租户运营数据 */
                console.warn(`开始统计`, startDateTime, endDateTime);
                let tableTime = moment(startDateTime).format("YYYYMM");
                const platformList = await PlatformNameAgentListRedisDao.findAllPlatformUidList(false);
                for( let key of platformList){
                    let platformUid = key.platformUid;
                    const tableName = `Sp_GameRecord_${platformUid}_${tableTime}`;
                    const result =  await SumTenantOperationalDataMysqlDao.copyTenantOperationalData(tableName, startDateTime, endDateTime);
                    await SumTenantOperationalDataMysqlDao.insertMany(result);
                }
            }

            console.warn("开始统计数据结束",moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        } catch (e) {
            console.error(`定时任务 | 备份、汇总每日游戏记录出错: ${e.stack}`);
        }
    })




    //每日凌晨1点办
    Schedule.scheduleJob("30 01 * * * ", async function () {
        console.warn("统计每个代理一个月的杀率........",moment().format("YYYY-MM-DD HH:mm:ss"));
        try {

            /** Step 2: 统计每个代理一个月的杀率 */
            const result = await TenantGameDataMysqlDao.getTenantMonthData();
            if(result && result.length != 0){
                const list = result.map((info) => {
                    const { profitTotal, validBetTotal } = info;
                    const winRate = validBetTotal > 0 ? ((-Number(profitTotal))  / validBetTotal).toFixed(4) : 0;
                    delete info.profitTotal;
                    delete info.validBetTotal;
                    return { winRate,...info };
                });
                await platfomMonthKillRateRedisDao.insert({agentList : list});
            }
            console.warn("统计每个代理一个月的杀率",moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        } catch (e) {
            console.error(`定时任务 | 统计每个代理一个月的杀率出错: ${e.stack}`);
        }
    })



    //每周星期天凌晨4点清理45天没登陆同时金币 < 1 的玩家
    Schedule.scheduleJob("0 0 4 * * 7", async function () {
    // Schedule.scheduleJob("50 15 * * *", async function () {
        console.warn("每周星期天凌晨1点清理45天没登陆同时金币........开始",moment().format("YYYY-MM-DD HH:mm:ss"));
        try {

            /** Step 1: 每周凌晨1点清理45天没登陆同时金币 */
            const time = moment().subtract(60, "days").format("YYYY-MM-DD 00:00:00");
            console.warn(`删除多少天以前得玩家数据:${time}`);

            /** Step 1: #第一步先删除H5进游戏得玩家账号 */
            const sql = `DELETE from Sp_Player
						where
						Sp_Player.pk_uid not in(select Sp_Player_Agent.fk_uid from Sp_Player_Agent WHERE Sp_Player_Agent.role_type in (2,3))
						AND Sp_Player.thirdUid is NULL`;
            await ConnectionManager.getConnection(false).query(sql);
            console.warn(`第一步先删除H5进游戏得玩家账号----完成`);
            /** Step 2: #第二步删除代理关系长期没上线得玩家关系数据 */
            const sqlToPlayerAgent = `
                        DELETE from Sp_Player_Agent
						WHERE   Sp_Player_Agent.fk_uid  in ( select Sp_Player.pk_uid FROM Sp_Player WHERE Sp_Player.gold < 100 AND Sp_Player.updateTime < "${time}")
						AND Sp_Player_Agent.role_type  = 1`;
            await ConnectionManager.getConnection(false).query(sqlToPlayerAgent);
            console.warn(`第二步删除代理关系长期没上线得玩家关系数据----完成`);
            /** Step 3: #第三步删除长久没上线得玩家信息同时金币< 1 */
            const sqlToPlayer = `
                        DELETE from Sp_Player
						where
						Sp_Player.pk_uid not in(select Sp_Player_Agent.fk_uid from Sp_Player_Agent WHERE Sp_Player_Agent.role_type in (2,3))
						AND Sp_Player.gold < 100
						AND Sp_Player.updateTime < "${time}"`;
            await ConnectionManager.getConnection(false).query(sqlToPlayer);
            console.warn(`第三步删除长久没上线得玩家信息同时金币< 1----完成`);
            console.warn("每周星期天凌晨4点清理45天没登陆同时金币.......完成",moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        } catch (e) {
            console.error(`定时任务 | 每周星期天凌晨1点清理45天没登陆同时金币: ${e.stack}`);
        }
    })

    /**
     * 每日统计热门游戏数据
     */

    Schedule.scheduleJob("30 59 23 * * *", async function () {
        try {
            //获取当天的日期
            console.warn(`每日统计热门游戏数据--开始`)
            const day = moment().format("YYYY-MM-DD");
            const time =  moment().format("YYYY-MM-DD 23:59:30");
            //获取所有场的nid 和场id
            const list = await SceneManagerDao.getAllSceneData();
            let resultArr = [];
            const conn = await redisManager.getConnection(RedisDB.Persistence_DB);
            for (const sceneInfo of list) {
                let num = await conn.scard(`GameLoginStatistics:${day}:${sceneInfo.nid}:${sceneInfo.sceneId}`);
                resultArr.push({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId, playerNum: num, createTime: time});
            }
            await HotGameDataMysqlDao.insertMany(resultArr);
            console.warn(`每日统计热门游戏数据--结束`);
            //每日的热门游戏统计数据结束过后需要进行删除redis 的相关数据
            const keys = await conn.keys(`GameLoginStatistics:*`);
            if(keys.length != 0){
                await conn.del(...keys);
            }
            return;
        } catch (e) {
            console.error(`定时任务 | 每日统计热门游戏数据: ${e.stack}`);
        }
    })

}

start();