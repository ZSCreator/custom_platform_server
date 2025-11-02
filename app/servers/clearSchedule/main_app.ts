import OnlinePlayerDao from "../../common/dao/redis/OnlinePlayer.redis.dao";
import Schedule = require("node-schedule");
import PlayerRedisDao from "../../common/dao/redis/Player.redis.dao";
import WalletRecordMysqlDao from "../../common/dao/mysql/WalletRecord.mysql.dao";
import AlarmEventThingMysqlDao from "../../common/dao/mysql/AlarmEventThing.mysql.dao";
import {RDSClient} from "../../common/dao/mysql/lib/RDSClient";
import {initRedisConnection} from "../../services/databaseService";
import * as moment from "moment";
import {PlayerGameHistory} from "../../common/dao/mysql/entity/PlayerGameHistory.entity";
import {SumTenantOperationalData} from "../../common/dao/mysql/entity/SumTenantOperationalData.entity";
import SumTenantOperationalDataMysqlDao from "../../common/dao/mysql/SumTenantOperationalData.mysql.dao";
import PlayerRebateRecordMysqlDao from "../../common/dao/mysql/PlayerRebateRecord.mysql.dao";
import PayInfoMysqlDao from "../../common/dao/mysql/PayInfo.mysql.dao";
import PlayerCashRecordMysqlDao from "../../common/dao/mysql/PlayerCashRecord.mysql.dao";
import SignRecordMysqlDao from "../../common/dao/mysql/SignRecord.mysql.dao";
import PlayerRebateMysqlDao from "../../common/dao/mysql/PlayerRebate.mysql.dao";
import PlayerManagerDao from "../../common/dao/daoManager/Player.manager";
import DayPlayerRebateRecordMysqlDao from "../../common/dao/mysql/DayPlayerRebateRecord.mysql.dao";
import OperationalRetentionMysqlDao from "../../common/dao/mysql/OperationalRetention.mysql.dao";
import PromotionReportAppMysqlDao from "../../common/dao/mysql/PromotionReportApp.mysql.dao";
import PlayerReceiveRebateRecordMysqlDao from "../../common/dao/mysql/PlayerReceiveRebateRecord.mysql.dao";
import HotGameDataMysqlDao from "../../common/dao/mysql/HotGameData.mysql.dao";
import TenantGameDataMysqlDao from "../../common/dao/mysql/TenantGameData.mysql.dao";
import ConnectionManager from "../../common/dao/mysql/lib/connectionManager";
import PlatformNameAgentListRedisDao from "../../common/dao/redis/PlatformNameAgentList.redis.dao";
import platfomMonthKillRateRedisDao from "../../common/dao/redis/platfomMonthKillRate.redis.dao";
import SceneManagerDao from "../../common/dao/daoManager/Scene.manager";
import redisManager from "../../common/dao/redis/lib/BaseRedisManager";
import {RedisDB} from "../../common/dao/redis/config/DBCfg.enum";
import PlayerAgentMysqlDao from "../../common/dao/mysql/PlayerAgent.mysql.dao";
import {array_same_list} from "../../utils/index";

/**
 * 修正玩家属性
 */
async function resetPlayer() {
    try {
        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 开始重置玩家自玩流水相关属性`)
        /** step1 修正玩家属性之前先进行玩家的数据统计*/






        await everDayOperationalRetention();

        console.warn(`${moment().format("YYYY年MM月DD日 HH:mm:ss")} 统计玩家当日数据表完成(今日充值，今日提现)`)
        //采用sql语句得形式修改
        /** step1 批量处理数据库中所有 dailyFlow > 0 得玩家属性*/
        const sql= `UPDATE Sp_Player p
              SET
                p.addDayRmb = 0,
                p.addDayTixian = 0,
                p.dailyFlow = 0,
                p.loginCount = 0,
                p.alms = 0`;

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


//每日留存报表的数据统计
// Schedule.scheduleJob("40 01 * * * ", async function () {
async function everDayOperationalRetention (){
    console.warn("开始每日每日留存报表的数据统计........",moment().format("YYYY-MM-DD HH:mm:ss"));
    try {
        /** step1 新增玩家的数据统计*/
            // let now = Date.now() - 1000 * 60 * 60 * 3 ;
        let now = Date.now() - 1000 * 60 * 60 * 3 ;
        let time = moment(now).format("YYYY-MM-DD 23:00:00");
        let startTime = moment(now).format("YYYY-MM-DD 00:00:00");
        let endTime = moment(now).add(1,'day').format("YYYY-MM-DD 00:00:00");

        //获取所有平台的uid
        const platformNameList = await PlatformNameAgentListRedisDao.findAllPlatformUidList(false);
        //获取所有的平台的代理名称
        const platformList = await PlatformNameAgentListRedisDao.findList(false);
        for(let platformName of platformNameList){
            const name = platformName.platformName;
            const platformUid = platformName.platformUid;
            const key = platformList.find(x=>x.platformName == name);
            if(!key){
                break;
            }
            const groupRemarkList = key.list;
            //获取某一个当天有下注的玩家
            const bet_players = await PlayerManagerDao.todayBetPlayer(platformUid, startTime , endTime);

            const add_players = await PlayerManagerDao.todayAddPlayer_uid(platformUid, startTime , endTime);

            const rmb_players = await PayInfoMysqlDao.todayAddTotal_fee_uid(groupRemarkList, startTime , endTime);


            const result = [];
            for(let m  of groupRemarkList){
                let allAddRmb = 0;
                //活跃人数
                const players_bet = bet_players.filter(x=>x.agentName == m);
                const bet_uids = players_bet.map(x=>x.uid);
                //新增人数
                const players_add = add_players.filter(x=>x.agentName == m);
                const add_uids = players_add.map(x=>x.uid);
                //充值人数
                const players_rmb = rmb_players.filter(x=>x.agentName == m);
                let rmb_uids = [];
                for(let m of players_rmb){
                    rmb_uids.push(m.uid);
                    allAddRmb +=  Number(m.todayAddRmb);
                }

                let info = {
                    agentName : m,
                    betPlayer : bet_uids,
                    addPlayer :add_uids,
                    AddRmbPlayer :rmb_uids,
                    allAddRmb :allAddRmb,
                    secondNum :0,
                    threeNum :0,
                    sevenNum :0,
                    fifteenNum :0,
                    createDate : time,
                }
                //将相关数据存入到数组里面
                result.push(info);
            }

            OperationalRetentionMysqlDao.insertMany(result);
        }
        console.warn("结束每日留存报表的数据统计........",moment().format("YYYY-MM-DD HH:mm:ss"));
        return true;
    } catch (e) {
        console.error(`定时任务 | 开始每日每日留存报表的数据统计出错: ${e.stack}`);
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

            /**
             * 删除一周前的红包转账记录
             */
            await WalletRecordMysqlDao.deletData(startTime);

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
                    if(result && result.length > 0){
                        await SumTenantOperationalDataMysqlDao.insertMany(result);
                    }

                }
            }

            console.warn("开始统计数据结束",moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        } catch (e) {
            console.error(`定时任务 | 开始汇总数据出错: ${e.stack}`);
        }
    })




    //每日渠道推广统计
    Schedule.scheduleJob("40 01 * * * ", async function () {
        // async function resetPlayer() {
        console.warn("开始每日渠道推广统计........",moment().format("YYYY-MM-DD HH:mm:ss"));
        try {
            /** step1 新增玩家的数据统计*/
            let now = Date.now() - 1000 * 60 * 60 * 3 ;
            let time = moment(now).format("YYYY-MM-DD 23:00:00");
            let startTime = moment(now).format("YYYY-MM-DD 00:00:00");
            let endTime = moment(now).add(1,'day').format("YYYY-MM-DD 00:00:00");

            const result_player = await PlayerManagerDao.todayAddPlayer(startTime , endTime)
            // //批量插入数据
            // if(result && result.length > 0){
            //     await PromotionReportAppMysqlDao.insertMany(result);
            // }

            /** step1 获取渠道代理当日的充值信息*/

            const result_pay = await PayInfoMysqlDao.todayAddTotal_fee(startTime , endTime);

            /** step1 获取渠道代理当日的提现信息*/
            const result_tixian = await PlayerCashRecordMysqlDao.todayAddTixian(startTime , endTime);

            /** step1 获取渠道代理当日的码量信息*/
            const result_flow = await SumTenantOperationalDataMysqlDao.todayAddFlow(startTime , endTime);

            //获取所有的平台
            const platformList = await PlatformNameAgentListRedisDao.findList(false);
            for(let platform of platformList){
                 const list = platform.list;
                 const platformName = platform.platformName;
                 let insertMany = [];
                 for(let m of list){
                     let info = {
                         agentUid : null,
                         agentName : m,
                         platformName : platformName,
                         todayPlayer :0,
                         todayAddRmb :0,
                         todayTixian :0,
                         todayFlow :0,
                         todayCommission :0,
                         createDate : time,
                     };
                     if(result_player){
                         let item_player = result_player.find(x=>x.agentName == m);
                         if(item_player){
                             info.todayPlayer = item_player.todayPlayer.length;
                         }
                     }

                     if(result_pay){
                         let item_pay = result_pay.find(x=>x.agentName == m);
                         if(item_pay){
                             info.todayAddRmb = Number(item_pay.todayAddRmb);
                         }
                     }


                      if(result_tixian){
                          let item_tixian = result_tixian.find(x=>x.agentName == m);
                          if(item_tixian){
                              info.todayTixian = Number(item_tixian.todayTixian);
                          }
                      }

                      if(result_flow){
                          let item_flow = result_flow.find(x=>x.groupRemark == m);
                          if(item_flow){
                              info.todayFlow = Number(item_flow.validBetTotal);
                              info.agentUid = item_flow.uid;
                              info.todayCommission =  Number(item_flow.bet_commissionTotal) +  Number(item_flow.win_commissionTotal) +  Number(item_flow.settle_commissionTotal);
                          }
                      }


                     //判断 agentUid 是否存在,如果不存在就要去数据库查找
                     if(!info.agentUid){
                         const playerAgent = await PlayerAgentMysqlDao.findOne({platformName : m});
                         if(playerAgent){
                             info.agentUid = playerAgent.uid;
                         }
                     }

                     insertMany.push(info);
                 }
                 PromotionReportAppMysqlDao.insertMany(insertMany);
            }

            return true;
        } catch (e) {
            console.error(`定时任务 | 开始每日渠道推广统计记录出错: ${e.stack}`);
        }
    });





    //每日对15内的留存报表进行修改
    Schedule.scheduleJob("00 02 * * * ", async function () {
        console.warn("开始每日对15内的留存报表进行修改........",moment().format("YYYY-MM-DD HH:mm:ss"));
        try {
            /** step1 新增玩家的数据统计*/
            let now = Date.now()  ;
            let endTime = moment(now).format("YYYY-MM-DD 00:00:00");
            let startTime = moment(now).subtract(16,'day').format("YYYY-MM-DD 00:00:00");
            //获取所有的平台的代理名称
            const platformList = await PlatformNameAgentListRedisDao.findList(false);
            for(let platform of platformList){
                const agentNameList = platform.list;
                for(let agentName of agentNameList){

                    const list = await OperationalRetentionMysqlDao.getOperationalRetentionList_AgentName(agentName,startTime ,endTime );
                    if(list.length > 0){
                           await this.updateOperationalRetention(list,endTime);
                    }
                }

            }
            console.warn("结束每日对15内的留存报表进行修改........",moment().format("YYYY-MM-DD HH:mm:ss"));
            return true;
        } catch (e) {
            console.error(`定时任务 | 开始每日对15内的留存报表进行修改出错: ${e.stack}`);
        }
    });


    //对每日留存进行数修改   JSON.parse( jsonStr )
    async function updateOperationalRetention ( list : any [], endTime : string ) {
        let startTime_3 = moment(endTime).subtract(1,'day').format("YYYY-MM-DD 00:00:00");
        let endTime_3 = moment(endTime).subtract(0,'day').format("YYYY-MM-DD 00:00:00");
        //获取当日得数据today array_same_list
        let today = list.find(x=>x.createDate > new Date(startTime_3) && x.createDate <  new Date(endTime_3)  );
        if(today){
            let ss = [1,3,7,15];
            let betPlayer =  JSON.parse( today.betPlayer ) ;
            for(let m of ss){
                let startTime_2 = moment(startTime_3).subtract(m ,'day').format("YYYY-MM-DD 00:00:00");
                let endTime_2 = moment(startTime_3).subtract(m-1,'day').format("YYYY-MM-DD 00:00:00");

                const item = list.find(x=>x.createDate > new Date(startTime_2) && x.createDate < new Date(endTime_2)  );
                if(item){
                    let item_addPlayer = JSON.parse( item.addPlayer ) ;
                    let arr_ = array_same_list(betPlayer,item_addPlayer);
                    if(arr_ && arr_.length > 0){
                        let num = Math.floor( (arr_.length/item_addPlayer.length) * 100) ;
                        if(m == 1){
                            await OperationalRetentionMysqlDao.updateOne({id : item.id }, { secondNum : num })
                        }else if(m == 3){
                            await OperationalRetentionMysqlDao.updateOne({id : item.id }, { threeNum : num })
                        }else if(m == 7){
                            await OperationalRetentionMysqlDao.updateOne({id : item.id }, { sevenNum : num })
                        }else if(m == 15){
                            await OperationalRetentionMysqlDao.updateOne({id : item.id }, { fifteenNum : num })
                        }

                    }
                }
            }
        }

    }







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



    // //每周星期天凌晨4点清理45天没登陆同时金币 < 1 的玩家
    // Schedule.scheduleJob("0 0 4 * * 7", async function () {
    // // Schedule.scheduleJob("50 15 * * *", async function () {
    //     console.warn("每周星期天凌晨1点清理45天没登陆同时金币........开始",moment().format("YYYY-MM-DD HH:mm:ss"));
    //     try {
    //
    //         /** Step 1: 每周凌晨1点清理45天没登陆同时金币 */
    //         const time = moment().subtract(60, "days").format("YYYY-MM-DD 00:00:00");
    //         console.warn(`删除多少天以前得玩家数据:${time}`);
    //
    //         /** Step 1: #第一步先删除H5进游戏得玩家账号 */
    //         const sql = `DELETE from Sp_Player
	// 					where
	// 					Sp_Player.pk_uid not in(select Sp_Player_Agent.fk_uid from Sp_Player_Agent WHERE Sp_Player_Agent.role_type in (2,3))
	// 					AND Sp_Player.thirdUid is NULL`;
    //         await ConnectionManager.getConnection(false).query(sql);
    //         console.warn(`第一步先删除H5进游戏得玩家账号----完成`);
    //         /** Step 2: #第二步删除代理关系长期没上线得玩家关系数据 */
    //         const sqlToPlayerAgent = `
    //                     DELETE from Sp_Player_Agent
	// 					WHERE   Sp_Player_Agent.fk_uid  in ( select Sp_Player.pk_uid FROM Sp_Player WHERE Sp_Player.gold < 100 AND Sp_Player.updateTime < "${time}")
	// 					AND Sp_Player_Agent.role_type  = 1`;
    //         await ConnectionManager.getConnection(false).query(sqlToPlayerAgent);
    //         console.warn(`第二步删除代理关系长期没上线得玩家关系数据----完成`);
    //         /** Step 3: #第三步删除长久没上线得玩家信息同时金币< 1 */
    //         const sqlToPlayer = `
    //                     DELETE from Sp_Player
	// 					where
	// 					Sp_Player.pk_uid not in(select Sp_Player_Agent.fk_uid from Sp_Player_Agent WHERE Sp_Player_Agent.role_type in (2,3))
	// 					AND Sp_Player.gold < 100
	// 					AND Sp_Player.updateTime < "${time}"`;
    //         await ConnectionManager.getConnection(false).query(sqlToPlayer);
    //         console.warn(`第三步删除长久没上线得玩家信息同时金币< 1----完成`);
    //         console.warn("每周星期天凌晨4点清理45天没登陆同时金币.......完成",moment().format("YYYY-MM-DD HH:mm:ss"));
    //         return true;
    //     } catch (e) {
    //         console.error(`定时任务 | 每周星期天凌晨1点清理45天没登陆同时金币: ${e.stack}`);
    //     }
    // })

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



    /**
     * 每日统计前一天得玩家的直属返佣
     */

    Schedule.scheduleJob("00 00 01 * * *", async function () {
        try {
            //获取当天的日期
            console.warn(`每日统计前一天得玩家的直属返佣--开始`)
            const startTime =  moment().subtract(1,'days').format("YYYY-MM-DD 00:00:00");
            const endTime =  moment().subtract(1,'days').format("YYYY-MM-DD 23:59:59:999");
            let  time =   moment().subtract(1,'days').format("YYYY-MM-DD 23:00:00");
            //获取所有场的nid 和场id
            const list = await PlayerRebateRecordMysqlDao.getStatisticsUid(startTime,endTime);
            if(list && list.length > 0){
                for (const item of list) {
                    let res = await PlayerRebateRecordMysqlDao.getDayPlayerRebateForUid(item.uid,startTime,endTime);
                    let resultList = [];
                    for(let m of res){
                        m['createDate'] = time;
                        resultList.push(m);
                    }
                    await DayPlayerRebateRecordMysqlDao.insertMany(res);
                }
            }
            console.warn(`每日统计前一天得玩家的直属返佣--结束`);
            return;
        } catch (e) {
            console.error(`定时任务 | 每日统计前一天得玩家的直属返佣: ${e.stack}`);
        }
    })




    /**
     * 每日玩家自动领取
     */

    Schedule.scheduleJob("00 01 00 * * *", async function () {
        try {
            //获取当天的日期
            console.warn(`每日每日玩家自动领取--开始`)
            let time = moment().subtract(1,'days').format("YYYY-MM-DD 23:59:00");
            const list = await PlayerRebateMysqlDao.getPlayerRebate();
            if(list && list.length > 0){
                for (const item of list) {
                    let gold = item.todayRebate + item.iplRebate;
                    //更新玩家金币
                    await PlayerManagerDao.updatePlayerGold(item.uid ,gold ); //更新玩家金币
                    //更新返佣表
                    await PlayerRebateMysqlDao.updateDelRebate(item.uid,item.todayRebate);
                    //添加记录
                    PlayerReceiveRebateRecordMysqlDao.insertOne({uid: item.uid , rebate : gold , createDate : new Date(time) });
                }
            }
            console.warn(`每日每日玩家自动领取--结束`);
            return;
        } catch (e) {
            console.error(`定时任务 | 每日玩家自动领取: ${e.stack}`);
        }
    });


    /**
     * 每日清理玩家一个月以前佣金记录
     */

    Schedule.scheduleJob("00 00 03 * * *", async function () {
        try {
            //获取当天的日期
            console.warn(`每日每日玩家自动领取--开始`)
            let time = moment().subtract(30,'days').format("YYYY-MM-DD 00:00:00");
            let signTime = moment().subtract(15,'days').format("YYYY-MM-DD 00:00:00");
            await PlayerReceiveRebateRecordMysqlDao.deletePlayerReceiveRebateRecord(time);
            await DayPlayerRebateRecordMysqlDao.deleteDayPlayerRebateRecord(time);
            await PlayerRebateRecordMysqlDao.deletePlayerRebateRecord(time);
            //删除15天以前玩家的签到记录
            await SignRecordMysqlDao.deleteSignRecord(signTime);

            console.warn(`每日每日玩家自动领取--结束`);
            return;
        } catch (e) {
            console.error(`定时任务 | 每日玩家自动领取: ${e.stack}`);
        }
    })



}

start();