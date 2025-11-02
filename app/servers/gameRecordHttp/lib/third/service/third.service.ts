import { Injectable } from '@nestjs/common';
import GameRecordMysqlDao from '../../../../../common/dao/mysql/GameRecord.mysql.dao';
import PlatformNameAgentListRedisDao from '../../../../../common/dao/redis/PlatformNameAgentList.redis.dao';
import MiddlewareEnum = require('../../const/middlewareEnum');
import Utils = require("../../../../../utils/index");
import SystemConfigManager from '../../../../../common/dao/daoManager/SystemConfig.manager';
import {Logger, getLogger} from 'pinus';

@Injectable()
export class ThirdService {
    thirdHttp_call: Logger;
    thirdHttp_game_record_Logger: Logger;
    constructor() {
        this.thirdHttp_call = getLogger('thirdHttp_call');
        this.thirdHttp_game_record_Logger = getLogger('thirdHttp_game_record');
    }


    /**
     * 拉取游戏记录
     * @param account   玩家uid
     * @param timestamp 操作时间
     * 这里的订单编号改变了，以前是_id 现在是 gameOrder
     */
    async getGameRecord(agent: string, startTime: number, endTime: number): Promise<any> {
        try {

            const num = Math.ceil((endTime - startTime) / (1000 * 60));
            if (num > 31) {
                return { s: 106, m: "/getGameRecord", d: { code: MiddlewareEnum.STATISTICAL_TIME_ERROR.status } };
            }
            /**
             * 先从缓存里面获取相关数据
             */
            const startTimeDate = Utils.cDate(startTime);
            const endTimeDate = Utils.cDate(endTime);
            //查找该代理的顶级平台的uid
            const platformUid = await PlatformNameAgentListRedisDao.findPlatformUidForAgent({agent : agent});
            if(!platformUid){
                return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
            }
            const list = await GameRecordMysqlDao.findListAll(platformUid,agent, startTimeDate, endTimeDate);
            /**
             *  数据加入缓存
             */
            return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.SUCCESS.status, record: list } };
        } catch (error) {
            return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
        }

    }




    /**
     * 另外平台拉取游戏记录
     * @param account   玩家uid
     * @param timestamp 操作时间
     * 这里的订单编号改变了，以前是_id 现在是 gameOrder
     */
    async getGameRecordForPlatformName(agent: string, startTime: number, endTime: number): Promise<any> {
        try {

            const num = Math.ceil((endTime - startTime) / (1000 * 60));
            if (num > 16) {
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.STATISTICAL_TIME_ERROR.status } };
            }
            /**
             * 先从缓存里面获取相关数据
             */
            const startTimeDate = Utils.cDate(startTime);
            const endTimeDate = Utils.cDate(endTime);
            const platformUid = await PlatformNameAgentListRedisDao.findPlatformUid({platformName:agent});
            if(!platformUid){
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
            }

            const list = await GameRecordMysqlDao.newPlatformNamefindListAll( platformUid, startTimeDate, endTimeDate);

            /**
             *  数据加入缓存
             */
            return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.SUCCESS.status, record: list } };
        } catch (error) {
            return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
        }

    }


    /**
     * 另外平台拉取游戏记录
     * @param account   玩家uid
     * @param timestamp 操作时间
     * 这里的订单编号改变了，以前是_id 现在是 gameOrder
     */
    async getGameRecordResult(agent: string, gameOrder: string ,createTimeDate : number,groupRemark : string): Promise<any> {
        try {

            const platformUid = await PlatformNameAgentListRedisDao.findPlatformUidForAgent({agent:agent});
            if(!platformUid){
                return { s: 111, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.AGENT_ERROR.status } };
            }
            const systemConfig = await SystemConfigManager.findOne({});
            if(systemConfig && systemConfig.gameResultUrl){
               let url = systemConfig.gameResultUrl  + "?groupRemark=" + groupRemark + "&createTimeDate=" + createTimeDate + "&gameOrder=" + gameOrder ;
                return { s: 111, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.SUCCESS.status, url  } };
            }else{
                return { s: 111, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
            }
        } catch (error) {
            return { s: 111, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
        }

    }




}
