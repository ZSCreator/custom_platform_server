/**
 * 大厅相关功能的定时器进行实现
 */
import PlayerManagerDao from '../../../../../common/dao/daoManager/Player.manager';
import PlayerRedisDao from '../../../../../common/dao/redis/Player.redis.dao';
import DayApiDataDao from '../../../../../common/dao/mysql/DayApiData.mysql.dao';
import PlayerAgentDao from '../../../../../common/dao/mysql/PlayerAgent.mysql.dao';
import GameRecordDateTableDao from '../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao';
import { getLogger } from 'pinus-logger';
import DayCreatePlayerRedisDao from "../../../../../common/dao/redis/DayCreatePlayer.redis.dao";
import DayLoginPlayerRedisDao from "../../../../../common/dao/redis/DayLoginPlayer.redis.dao";
import OnlinePlayerRedisDao from "../../../../../common/dao/redis/OnlinePlayer.redis.dao";
import { getConnection } from "typeorm";
import RestPlayerRedisDao from '../../../../../common/dao/redis/RestPlayer.redis.dao';
const Logger = getLogger('server_out', __filename);
import * as moment from "moment";
import ConnectionManager from "../../../../../common/dao/mysql/lib/connectionManager";
/**
 * 实现定时删除邮件的数据记录
 * @param startTime
 * @param endTime
 */

export const setDelMailsJob = async (startTime, endTime) => {
    try {

        /**
         * 如果附件gold :0 同时 isRead 为true 则删除  或者 isdelete : true
         */
        // await mailsModel.remove({ time: { $lt: endTime }, $or: [{ isdelete: true }, { $and: { 'attachment.gold': 0, 'isRead': true } }] });
        return;
    } catch (error) {
        Logger.error(`setDelMailsJob ==> 删除邮件失败::${error.stack} `);
        return;
    }
};










/**
 *  开始执行改变玩家position ,游戏位置
 */
export async function changePlayerPosition() {
    try {
        console.warn("开始执行改变玩家position ,游戏位置")
        //采用sql语句得形式批量修改修改
        /** step1 批量处理数据库中所有 dailyFlow > 0 得玩家属性*/
        const sql = `UPDATE Sp_Player p SET p.position = 0 WHERE p.position > 0`;

        await ConnectionManager.getConnection().query(sql);

        Logger.warn("changePlayerPosition ==> 开始执行改变玩家position ,游戏位置");
        console.warn("开始执行改变玩家position ,游戏位置=========结束")
        return true;
    } catch (error) {
        Logger.error(`changePlayerPosition ==> 开始执行改变玩家position ,游戏位置：::${error.stack} `);
        return false;
    }
}


/**
 * 每日晚上11点59分进行API得数据报表统计，登陆人数，创建人数，带入带出差额
 */
export const insertDayApiData = async () => {
    try {
        console.warn("11点59分进行API得数据报表统计  ==== 开始");
        const createDate = new Date();
        const [create, login, maxOnline, result] = await Promise.all([
            DayCreatePlayerRedisDao.getPlayerLength({}),
            DayLoginPlayerRedisDao.getPlayerLength({}),
            OnlinePlayerRedisDao.getOnlineMax({}),
            PlayerManagerDao.findPlayerDayLoginData()
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
            createDate : createDate,
        };
        await DayApiDataDao.insertOne(info);
        console.warn("11点59分进行API得数据报表统计  ==== 结束")
        return true;
    } catch (error) {
        Logger.error(`insertDayApiData ==> 每日晚上11点59分进行API得数据报表统计::${error.stack} `);
        return false;
    }
};


/**
 * 定时每个月28号创建对应得游戏记录表，SP_GameRecord_uid_202106
 */
export const createGameRecordTable = async () => {
    try {
        console.warn("开始创建游戏记录分表 === 开始");
        /** step1 先获取所有平台信息*/
        const timeTableName =  moment().add(1,'month').format("YYYYMM");
        const platformList = await PlayerAgentDao.findList({roleType : 2});
        /** step2 循环对每个平台新增游戏记录表*/
        for(let platform of platformList){
            const uid = platform.uid ;
            if(uid){
                let tableName = `${uid}_${timeTableName}`;
                await GameRecordDateTableDao.createTable(tableName);
            }
        }
        /** step2 同时默认创建当月的SP_GameRecord*/
        await GameRecordDateTableDao.createTable(timeTableName);
        console.warn("开始创建游戏记录分表  ==== 结束");
        return true;
    } catch (error) {
        Logger.error(`insertDayApiData ==> 定时每个月28号创建对应得游戏记录表::${error.stack} `);
        return false;
    }
};

/**
 * 启动服务器的时候先校验当前月的数据库存在的平台是否存在这些表，SP_GameRecord_uid_202106
 */
export const StartServerCheckGameRecordTable = async () => {
    try {
        console.warn("启动服务器的时候先校验当前月的数据库存在的平台是否存在这些表 === 开始");
        /** step1 先获取所有平台信息*/
        const timeTableName =  moment().format("YYYYMM");
        const platformList = await PlayerAgentDao.findList({roleType : 2});
        /** step2 循环对每个平台新增游戏记录表*/
        for(let platform of platformList){
            const uid = platform.uid ;
            if(uid){
                let tableName = `${uid}_${timeTableName}`;
                const  isExists = await GameRecordDateTableDao.tableBeExists(tableName);
                if(!isExists){
                    await GameRecordDateTableDao.createTable(tableName);
                }

            }
        }
        /** step2 同时默认创建当月的SP_GameRecord*/
        const  isExists = await GameRecordDateTableDao.tableBeExists(timeTableName);
        if(!isExists){
            await GameRecordDateTableDao.createTable(timeTableName);
        }
        console.warn("启动服务器的时候先校验当前月的数据库存在的平台是否存在这些表  ==== 结束");
        return true;
    } catch (error) {
        Logger.error(`StartServerCheckGameRecordTable ==> 启动服务器的时候先校验当前月的数据库存在的平台是否存在这些表::${error.stack} `);
        return false;
    }
};