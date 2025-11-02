'use strict';

import Schedule = require('node-schedule');
import Utils = require('../../utils');
import { getLogger, ILogger } from 'pinus-logger';
const Logger = getLogger('server_out', __filename);
const ScheduleServer = module.exports;

/**
 * 定时任务启动器
 * @param app
 */
export const startSchedule = async (app) => {
    console.log('开始执行==>startSchedule');
    // addAllPlayerGold();
    // WebAPI真人视讯被动下线
    // await VideoHelper.cron();
    /**
     * 删除多余数据以及备份数据的功能
     */
    // DeleteData.startDeleteDataSchedule();
    /**
     * 每日整合代理的相关数据
     */
    // addAgentProfits();

    /**
     * 属于大区的进行数据整合
     */
    // addQudaoProfits();
    /**
     * 1、每日整个系统进行数据整合
     * 2、所有玩家功能的数据整合，使用定时器来进行触发  ======  营收统计
     * 3、所有裂变玩家功能的数据整合，使用定时器来进行触发  ======  营收统计
     */
    // dayProfitsRecord();
    /**
     * 记录玩家每日的游戏利润
     */
    // addDailyNetProfit();
    /**
     * 进行付费留存的数据整改 ====营收统计
     */
    // changeDaquProfitsToYingShou();
    /**
     *  记录每日所有游戏的输赢的数据整合  game_record 根据分类来进行整合
     */
    // addGameRecordGameTypeDay();
    /**
     *  LTV 的定时器计算  (暂时废弃)
     *  计算每日的充值金额除以直属玩家的人数
     *  记录裂变的人数，就是非直属玩家的人数，充值，提现，其余的数据明细在营收分析里面
     */
    // calculatePromotionForLTV();
    /**这个是给代理人看的营收相关数据，以及ltv , 只算等级为2的相关数据
     *  1、LTV 的定时器计算
     *  计算每日的充值金额除以直属玩家的人数
     *  记录裂变的人数，就是非直属玩家的人数，充值，提现，其余的数据明细在营收分析里面
     *
     *  2、渠道下面每天进行以前每日注册过的玩家进行总的提现金额，充值金额累加，
     *
     */
    // calculatePromotionLTVForAgentLook();

    /**
     * ================================无限代50方式的代理模式定时器==========================
     */
    /**
     * 统计当日产生的直接玩家产生的利润以及间接玩家产生的利润   (无限代模式 50)
     */
    // addAgentBackDayRecord();
    /**
     *每日凌晨1点对前一天的所有直接和间接的利润进行累加，玩家人数的重构    (无限代模式 50)
     */
    // changeAgentBackRecord();




    /**
     * ================================无限代级差方式的代理模式定时器==========================
     */

    /**
     * 1.结算流水的押注
     * 2.人数的统计
     * 3.周末佣金返佣
     */
    // addDayPlayerProfitsPayRecord_wuxian_jicha();
    // addDayPeopleAndActive();
    // addAgentKaoheProfitsRecord();

};



/**
 * 统计当日产生的直接玩家产生的利润以及间接玩家产生的利润，
 *  通过 day_player_profits_pay_record来进行数据整合
 */
function  addAgentBackDayRecord(){
    Schedule.scheduleJob('*/10 * * * *', async function () {
        try {
            console.log('开始出发定时器=====>addAgentBackDayRecord');
            const istrue = Utils.isNeedTimerToYesterDay(10);
            const oneDay = 24 * 60 * 60 * 1000;
            let startTime = Utils.zerotime();
            let endTime = Utils.zerotime() + oneDay ;
            if(istrue){
                startTime -= oneDay;
                endTime -= oneDay;
            }
            // await AgentBackTimer.addAgentBackDayRecord(startTime,endTime);
            return true;
        } catch (error) {
            console.log('addAgentBackDayRecord ==> 每隔十分钟:',error);
            Logger.error("addAgentBackDayRecord ==> 每隔十分钟:", error)
        }
    });
}
/**
 * 每日凌晨1点:10对前一天的所有直接和间接的利润进行累加，玩家人数的重构
 *
 */
function  changeAgentBackRecord(){
    Schedule.scheduleJob('10 01 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay ;
            // await AgentBackTimer.changeAgentBackRecord(startTime,endTime);
            return true;
        } catch (error) {
            console.log('changeAgentBackRecord ==> 每日00点01:',error);
            Logger.error("changeAgentBackRecord ==> 每日00点01:", error)
        }
    });
}
/** 每日01点00统计当天的利润 */
function dayProfitsRecord() {
    Schedule.scheduleJob('01 01 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay ;
            // await ManagerTimer.addDayManagerDataLieBianForYingShou(startTime, endTime); //整个系统的裂变
            // await ManagerTimer.addDayManagerDataGuanWangForYingShou(startTime, endTime); // 整个系统的官网下载
            return true;
        } catch (error) {
            Logger.error("HallController.dayProfitsRecord ==> 每日23点55统计当天的利润:", error)
        }
    });
}

/** 每日02:00记录每个大区渠道的详细数据 */
function  addQudaoProfits(){
    Schedule.scheduleJob('01 02 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay ;
            return Promise.resolve();
        } catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error)
        }
    });
}


/** 每日的03:00统计记录每日所有游戏的输赢的数据整合  game_record 根据分类来进行整合 */
function  addAgentProfits(){
    Schedule.scheduleJob('05 01 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() -  oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay ;
            return Promise.resolve();
        } catch (error) {
            Logger.error("royal_scheduleJob.addTodayPlatformAgentData", error)
        }
    });
}



/** 每日的03:00统计记录每日所有游戏的输赢的数据整合  game_record 根据分类来进行整合 */
function  addGameRecordGameTypeDay(){
    Schedule.scheduleJob('03 03 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() -  oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay ;
            return Promise.resolve();
        } catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error)
        }
    });
}

/** 每日的02:30记录修改付费留存数据 */
function  changeDaquProfitsToYingShou(){
    Schedule.scheduleJob('31 02 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay ;
            return Promise.resolve();
        } catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error)
        }
    });
}

/** 每日的03:30记录LTV 的定时器计算*/
function  calculatePromotionForLTV(){
    Schedule.scheduleJob('32 03 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay ;
            return Promise.resolve();
        } catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error)
        }
    });
}

/** 每日给代理看的相关数据的03:41记录LTV 的定时器计算*/
function  calculatePromotionLTVForAgentLook(){
    Schedule.scheduleJob('41 03 * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            const time = Date.now() - 1 * oneDay;
            let startTime = Utils.zerotime(time);
            let endTime = startTime + oneDay ;
            //type == 1 就存入数据库，如果type == 2 则查询实时数据
            return Promise.resolve();
        } catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error)
        }
    });
}



/**
 * ================================无限代级差方式的代理模式定时器==========================
 */

/** 每个10分钟来，更新玩家身上的结算流水,时间越长点越好,只是玩家推广周业绩数据不是最新*/
function  addDayPlayerProfitsPayRecord_wuxian_jicha(){
    Schedule.scheduleJob('*/10 * * * *', async function () {
        try {
            const oneDay = 24 * 60 * 60 * 1000;
            let startTime = Utils.zerotime();
            let endTime = Utils.zerotime() + oneDay ;
            // await AgentBackProfitsLiushuiForJichaTimer.addDayPlayerProfitsPayRecord_wuxian_jicha(startTime , endTime);
            return Promise.resolve();
        } catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error)
        }
    });
}

/** 每隔50分钟进行人数的数据整合*/
function  addDayPeopleAndActive(){
    Schedule.scheduleJob('*/50 * * * *', async function () {
        try {
            const istrue = Utils.isNeedTimerToYesterDay(50);
            const oneDay = 24 * 60 * 60 * 1000;
            let startTime = Utils.zerotime();
            let endTime = Utils.zerotime() + oneDay ;
            if(istrue){
                startTime -= oneDay;
                endTime -= oneDay;
            }
            // await AgentBackProfitsLiushuiForJichaTimer.addDayPeopleAndActive(startTime , endTime);
            return Promise.resolve();
        } catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error)
        }
    });
}


/** 每周末 59 23 * * 7 来进行流水的数据返佣*/
function  addAgentKaoheProfitsRecord(){
    Schedule.scheduleJob('59 23 * * 7', async function () {
        try {
            // await AgentBackProfitsLiushuiForJichaTimer.addAgentKaoheProfitsRecord();
            return Promise.resolve();
        } catch (error) {
            Logger.error("royal_scheduleJob.addQudaoProfits", error)
        }
    });
}