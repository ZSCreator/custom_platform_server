"use strict";
/**
 * 有关大厅功能方面的定时任务
 */
import Utils = require("../../../../utils");
import Schedule = require("node-schedule");
import HallImplementation = require("../hall/implementation/hallImplementation");
import { getLogger } from "pinus-logger";
import OnlinePlayerDao from "../../../../common/dao/redis/OnlinePlayer.redis.dao";
import DayCreatePlayerRedisDao from "../../../../common/dao/redis/DayCreatePlayer.redis.dao";
import DayLoginPlayerRedisDao from "../../../../common/dao/redis/DayLoginPlayer.redis.dao";
import AlarmEventThingRedisDao from "../../../../common/dao/redis/AlarmEventThing.redis.dao";
import AlarmEventThingMysqlDao from "../../../../common/dao/mysql/AlarmEventThing.mysql.dao";
import ThirdGoldRecordRedisDao from "../../../../common/dao/redis/ThirdGoldRecord.redis.dao";
import ThirdGoldRecordMysqlDao from "../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao";
import PlayerRedisDao from "../../../../common/dao/redis/Player.redis.dao";
import GameManagerDao from "../../../../common/dao/daoManager/Game.manager";
import * as GameDishRoadDao from "../../../../common/dao/redis/GameDishRoadDao";
import * as GameDishRoadChannelDao from "../../../../common/dao/redis/GameDishRoadChannelDao";
import RobotMysqlDao from "../../../../common/dao/mysql/Robot.mysql.dao";
import {playerCloseSessionByMysql} from "../../../../common/event/sessionEvent";
import { pinus } from "pinus";
import RobotLeaveTaskQueueRedisDao from "../../../../common/dao/redis/RobotLeaveTaskQueue.redis.dao";
import PlatformNameAgentListRedisDao from "../../../../common/dao/redis/PlatformNameAgentList.redis.dao";
import  PlayerMysqlDao from "../../../../common/dao/mysql/Player.mysql.dao";
import {Player} from "../../../../common/dao/mysql/entity/Player.entity";
import * as moment from "moment";
import {ApiResult} from "../../../../common/pojo/ApiResult";
import {hallState} from "../../../../common/systemState";
import { initVipConfig } from "../../../../services/activity/vipSystemService";
import * as redisManager from "../../../../common/dao/redis/lib/redisManager";
import * as DatabaseConst from "../../../../consts/databaseConst";
const Logger = getLogger("server_out", __filename);

export async function setHallScheduleJob() {
  console.warn(`开始执行大厅方面的定时任务`);
  /**
   * 定时删除邮件,暂时指定以阅读过后7天为一个周期
   */
  // await setDelMailsJob();


  /**
  * 重置玩家身上的一些属性
  */
  await resetPlayer();
  /**
  * 清除游戏在线玩家统计
  */
  await OnlinePlayerDao.delete({});

  /**
   * 将玩家身上的position去掉
   */
  // await changePlayerPosition();

  // 初始化vip等级、充值奖励、周奖励、月奖励配置信息
  await initVipConfig();
    /**
     * 启动服务器的时候重新配置平台==平台uid
     */
    await checkPlatformAgentUid();

  /**
  *  清除redis订阅通信所有玩家uid集合
  */
  // const gameList = await GameManagerDao.findList({});
  // for (const { nid } of gameList) {
  //   await GameDishRoadDao.deleteAll(nid);
  // }


  /**
  *  清除redis订阅通信所有频道集合
  */
  // const serverList = pinus.app.getServersByType("hall");
  // if (serverList && serverList.length > 0) {
  //   for (const { id: hallServerId } of serverList) {
  //     await GameDishRoadChannelDao.deleteAll(hallServerId);
  //   }
  // }

  /**
  * 每日凌晨清除玩家的创建和登陆存储在 ==redis 里面的uid
  */
  await removePlayerLoginAndCreate();

  /**
   * 登陆人数，创建人数，带入带出差额 每日晚上11点59分,58秒统计数据
   */
  await insertDayApiData();


  // await clearRobotForLeaving();

  /**
   * 每分钟数据校验一次预警数量和下方预警数量
   */
  await checkAlarmThingAndThirdGold()


    /**
     * 定时每个月28号创建对应得游戏记录表，SP_GameRecord_uid_202106
     */
    await createGameRecordTable();

    /**
     *  定时删除金币=0 同时半个小时没更新数据的在线玩家
     */
    await clearOnlinePlayer();

    /**
     * 清理走马灯
     */
    await clearBigWinNotice();

}



/**
 * 启动服务器的时候重新配置平台==平台uid
 */
async function checkPlatformAgentUid() {
    try {
        // 先清除
        await PlatformNameAgentListRedisDao.deleteAll({});
        await Promise.all([
            PlatformNameAgentListRedisDao.findList(true),
            PlatformNameAgentListRedisDao.findAllPlatformUidList(true)
        ]);
        return;
    } catch (error) {
        Logger.error(`启动服务器的时候重新配置平台 =====${error.stack}`);
        return;
    }
}


/**
 * 定时每个月28号创建对应得游戏记录表，SP_GameRecord_uid_202106
 */
async function createGameRecordTable() {
  /** 启动服务器的时候先校验当前月的数据库存在的平台是否存在这些表*/
  await HallImplementation.StartServerCheckGameRecordTable();
    Schedule.scheduleJob("00 00 04 28 * *", async function () {
        try {

            await HallImplementation.createGameRecordTable();
            return;
        } catch (error) {
            Logger.error(`insertDayApiData 每日晚上11点59分进行API得数据报表统计 ==> ${error.stack}`);
            return;
        }
    });
}

// 设置删除邮件的任务
// TODO: 可以设置每个文档的过期时间，到期自动删除 expireAfterSeconds
function setDelMailsJob() {
  Schedule.scheduleJob("10 01 * * *", async function () {
    try {
      const time = Date.now() - 7 * 24 * 60 * 60 * 1000;
      let startTime = Utils.zerotime(time);
      let endTime = startTime + 7 * 24 * 60 * 60 * 1000;
      await HallImplementation.setDelMailsJob(startTime, endTime);
      return;
    } catch (error) {
      Logger.error(`changeAgentBackRecord ==> 每日00点01:${error.stack}`);
      return;
    }
  });
}

/**
 * 每日凌晨清楚玩家的登陆和新增
 */
async function removePlayerLoginAndCreate() {
    /**启动之前将校验平台下面包含了哪些代理存入redis  */


  Schedule.scheduleJob("00 00 * * *", async function () {
    try {
      console.warn("每日凌晨清楚玩家的登陆和新增");
      await Promise.all([
        DayLoginPlayerRedisDao.delete({}),
        DayCreatePlayerRedisDao.delete({}),
      ]);
      return;
    } catch (error) {
      Logger.error(`removePlayerLoginAndCreate ==> 每日00点01:${error.stack}`);
      return;
    }
  });
}




/**
 * 重置玩家身上的一些属性
 * 重置当日在线最高人数
 */
async function resetPlayer() {
  Schedule.scheduleJob("00 00 * * *", async function () {
    try {

      /**
       * 充值当日在线最高人数
       */
      await OnlinePlayerDao.init({});
      return;
    } catch (error) {
      Logger.error(`resetPlayer 每日凌晨清楚玩家的登陆和新增 ==> 每日00点01:${error.stack}`);
      return;
    }
  });
}

/**
 将玩家身上的position去掉
 */
async function changePlayerPosition() {
  try {
    await HallImplementation.changePlayerPosition();
    return;
  } catch (error) {
    Logger.error(`resetPlayer 每日凌晨清楚玩家的登陆和新增 ==> 每日00点01:${error.stack}`);
    return;
  }
}


/**
 * 每日晚上11点59分进行API得数据报表统计，登陆人数，创建人数，带入带出差额
 */
async function insertDayApiData() {
  Schedule.scheduleJob("00 59 23 * * *", async function () {
    try {

      await HallImplementation.insertDayApiData();
      return;
    } catch (error) {
      Logger.error(`insertDayApiData 每日晚上11点59分进行API得数据报表统计 ==> ${error.stack}`);
      return;
    }
  });
}




/**
 * 每5分钟校验上下分预警和预警
 */
async function checkAlarmThingAndThirdGold() {
  console.warn("每5分钟校验上下分预警和预警");
  const [alarmLength, thirdGoldLength] = await Promise.all([
    AlarmEventThingMysqlDao.findListToLimitStatus(0),
    ThirdGoldRecordMysqlDao.findListForStatus({}),

  ]);

  await Promise.all([
    AlarmEventThingRedisDao.init({ length: alarmLength }),
    ThirdGoldRecordRedisDao.init({ length: thirdGoldLength })
  ])

  Schedule.scheduleJob(" */5 * * * *", async function () {
    try {
      const [alarmLength, thirdGoldLength] = await Promise.all([
        AlarmEventThingMysqlDao.findListToLimitStatus(0),
        ThirdGoldRecordMysqlDao.findListForStatus({}),

      ]);
      await Promise.all([
        AlarmEventThingRedisDao.init({ length: alarmLength }),
        ThirdGoldRecordRedisDao.init({ length: thirdGoldLength })
      ])
      return;
    } catch (error) {
      Logger.error(`checkAlarmThingAndThirdGold 每5分钟校验上下分预警和预警 ==> ${error.stack}`);
      return;
    }
  });
}



async function clearOnlinePlayer() {
    /**
     * 每半个小时进行一次在线玩家金币==0 ，同时更新数据没变动的踢掉删除处理
     */
    console.warn(`每半个小时进行一次在线玩家剔除--开始`)
    Schedule.scheduleJob(" */30 * * * *", async function () {
        try {
            //获取当天的日期
            const onlinePlayers = await OnlinePlayerDao.findList();
            if(onlinePlayers.length == 0){
                return;
            }
            for(let pl of onlinePlayers){
                // const player  = await PlayerMysqlDao.findOne({uid: pl.uid });
                if(pl.frontendServerId){
                    const isOnline = await pinus.app.rpc.connector.enterRemote.checkPlayerSession.toServer(pl.frontendServerId , pl.uid);
                    if(!isOnline){
                        await OnlinePlayerDao.deleteOne({uid : pl.uid});
                        Logger.warn(`在线玩家剔除成功：uid:${pl.uid}, time:${new Date()},nid: ${pl.nid} ,sceneId:${pl.sceneId}`);
                    }
                }

            }
            return;
        } catch (e) {
            Logger.error(`定时任务 | 每半个小时进行一次在线玩家剔除: ${e.stack}`);
        }
    })

}

/*
 *清理走马灯
 */
async function clearBigWinNotice() {
    await redisManager.deleteKeyFromRedis(DatabaseConst.BIG_WIN_NOTICE_ARR_SET);
    return ;
}
