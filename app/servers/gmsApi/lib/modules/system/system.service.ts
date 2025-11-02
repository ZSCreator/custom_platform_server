import { Injectable, ParseIntPipe } from '@nestjs/common';
import ActivityMongoManager = require('../../../../../common/dao/mongoDB/ActivityInfoDao');
import * as MailService from "../../../../../services/MailService";
import { getLogger } from "pinus-logger";
import GameCommissionManager from "../../../../../common/dao/daoManager/GameCommission.manager";
import GameManager from "../../../../../common/dao/daoManager/Game.manager";
import PlayerManager from "../../../../../common/dao/daoManager/Player.manager";
import OnlinePlayerRedisDao from "../../../../../common/dao/redis/OnlinePlayer.redis.dao";
import DayCreatePlayerRedisDao from "../../../../../common/dao/redis/DayCreatePlayer.redis.dao";
import DayLoginPlayerRedisDao from "../../../../../common/dao/redis/DayLoginPlayer.redis.dao";
import SystemConfigManagerDao from "../../../../../common/dao/daoManager/SystemConfig.manager";
import AlarmEventThingMysqlDao from "../../../../../common/dao/mysql/AlarmEventThing.mysql.dao";
import AlarmEventThingRedisDao from "../../../../../common/dao/redis/AlarmEventThing.redis.dao";
import WhiteIpRecordMysqlDao from "../../../../../common/dao/mysql/WhiteIpRecord.mysql.dao";
import AnnouncementMysqlDao from "../../../../../common/dao/mysql/Announcement.mysql.dao";
import ThirdGoldRecordMysqlDao from "../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao";
import ThirdGoldRecordRedisDao from "../../../../../common/dao/redis/ThirdGoldRecord.redis.dao";
import PlatformNameAgentListRedisDao from "../../../../../common/dao/redis/PlatformNameAgentList.redis.dao";
import BlackIpRedisDao from "../../../../../common/dao/redis/BlackIp.redis.dao";
import fileUtils = require('../../../../../utils/fileData/fileUtils');
import Utils = require('../../../../../utils/index');
import DayApiDataMysqlDao from "../../../../../common/dao/mysql/DayApiData.mysql.dao";
import ManagerLogsMysqlDao from "../../../../../common/dao/mysql/ManagerLogs.mysql.dao";
const ManagerErrorLogger = getLogger('http', __filename);
import * as moment from "moment";
import * as MessageService from "../../../../../services/MessageService";


import {pinus} from "pinus";

@Injectable()
export class SystemService {
    /**
     * 获取 系统设置信息
     * @param
     */
    async getSystemConfig(): Promise<any> {
        try {
            const platformList = await PlatformNameAgentListRedisDao.findAllPlatformUidList();
            const systemConfig = await SystemConfigManagerDao.findOne({},true);
            return { code: 200, data: systemConfig , platformList };
        } catch (error) {
            ManagerErrorLogger.warn(`getSystemConfig ==>error: ${error}`);
            console.info(`getSystemConfig ==>error: ${error}`);
            return Promise.reject(error);
        }
    }



    /**
     * 修改 系统设置信息
     * @param data  系统配置信息{
     *
     * }
     */
    async changeSystemConfig(data: any): Promise<any> {
        try {

            await SystemConfigManagerDao.updateOne({ id: data.id }, data);
            return { code: 200, msg: '修改成功' };
        } catch (error) {
            ManagerErrorLogger.warn(`changeSystemConfig ==>error: ${error}`);
            console.info(`changeSystemConfig ==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 获取无线代 参数
     * @param
     *
     * }
     */
    async getUnlimitedList(): Promise<any> {
        try {

            const systemConfig = await await SystemConfigManagerDao.findOne({},true);
            let openUnlimited = false;
            let unlimitedList = [];
            let id = 1;
            let iplRebate = 0;
            if(systemConfig){
                 openUnlimited = systemConfig.openUnlimited ? true : false ;
                 unlimitedList = systemConfig.unlimitedList ? systemConfig.unlimitedList : [] ;
                 id = systemConfig.id;
                 iplRebate = systemConfig.iplRebate;
            }
            return { code: 200,  id,  openUnlimited , unlimitedList , iplRebate  };
        } catch (error) {
            ManagerErrorLogger.warn(`changeSystemConfig ==>error: ${error}`);
            console.info(`changeSystemConfig ==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 设置无线代
     * @param
     *
     * }
     */
    async setUnlimitedList(id : number , openUnlimited : boolean , unlimitedList : any[] , iplRebate : number): Promise<any> {
        try {

            await SystemConfigManagerDao.updateOne({ id:id }, {openUnlimited ,unlimitedList ,iplRebate });
            return { code: 200, msg:"设置成功"  };
        } catch (error) {
            ManagerErrorLogger.warn(`changeSystemConfig ==>error: ${error}`);
            console.info(`changeSystemConfig ==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 系统发送邮件
     * @param data 系统发送邮件
     *
     *  * uid:
     * mail:{
        sender : opts.sender ,
        name : opts.name,
        reason : opts.reason,
        content : opts.content,
     *
     * }
     */
    async PostMails(uid: string, mail: any , sender:string): Promise<any> {
        try {
            mail.sender = sender;
            await MailService.generatorMail(mail, uid);
            return { code: 200, msg: "发送成功" };
        } catch (error) {
            ManagerErrorLogger.warn(`PostMails ==>error: ${error}`);
            console.info(`PostMails ==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 根据uid 来查询该玩家的邮件
     * @param uids
     * @param mail
     */

    async selectPlayerMails(uid : string , page : number): Promise<any> {
        try {
            const { list ,count } = await MailService.selectPlayerMails( uid , page );
            return { list ,count } ;
        } catch (error) {
            ManagerErrorLogger.warn(`PostMails ==>error: ${error}`);
            console.info(`PostMails ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    /**
     * 获取网站活动的内容
     *
     */
    async getSystemAnnouncement(): Promise<any> {
        try {
            const  { list ,count } = await AnnouncementMysqlDao.findListToLimit();
            return  { list ,count};
        } catch (error) {
            ManagerErrorLogger.warn(`getSystemAnnouncement ==>error: ${error}`);
            console.info(`getSystemAnnouncement ==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 保存网站活动内容公告以及
     */
    async changeAndSaveAnnouncement(id , content, openType, sort, title): Promise<any> {
        try {
            if (id) {
                const info = {
                    content: content,
                    openType: openType,
                    title: title,
                    sort: sort,
                };
                await AnnouncementMysqlDao.updateOne({ id }, info);
            } else {
                const info = {
                    content: content,
                    openType: openType,
                    title: title,
                    sort: sort,
                }
                await AnnouncementMysqlDao.insertOne(info);
            }
            return true;
        } catch (error) {
            ManagerErrorLogger.warn(`changeAndSaveAnnouncement ==>error: ${error}`);
            console.info(`changeAndSaveAnnouncement ==>error: ${error}`);
            return Promise.reject(error);
        }
    }

    /**
     * 删除公告
     */
    async deleteUpdateAnnouncement(id: number): Promise<any> {
        try {
            await AnnouncementMysqlDao.delete({id});
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`deleteUpdateAnnouncement ==>error: ${error}`);
            console.info(`deleteUpdateAnnouncement==>error: ${error}`);
            return Promise.reject(error);
        }
    }


    /**
     * 获取所有活动配置
     */
    async getAllActivityInfo(): Promise<any> {
        return await ActivityMongoManager.findAllActivityInfos();
    };
    /**
     * 获取所有开启活动配置
     */
    async getOpenActivityInfo(): Promise<any> {
        return await ActivityMongoManager.findOpenActivityInfos();
    };
    /**
     * 添加或更新一条活动配置
     * @param activityInfo
     */
    async saveOrUpdateActivityInfo(type: number, remark: string, title: string, sort: number, contentImg: string, isLeading: string, isOpen: boolean, _id: string): Promise<any> {
        try {

            let list = [];
            list.push(contentImg);
            const activityInfo = {
                _id,
                type,
                remark,
                title,
                sort,
                isLeading,
                contentImg: list,
                isOpen,
                updateTime: Date.now()
            }
            await ActivityMongoManager.saveOrUpdateActivityInfo(activityInfo);
            return true;
        } catch (e) {
            ManagerErrorLogger.error(`ActivityService.saveOrUpdateActivityInfo exception : ${e.stack | e}`);
            return false;
        }
    };
    /**
     * 添加或更新一条活动配置
     * @param id
     */
    async deleteActivityInfo(_id: string): Promise<any> {
        try {
            if (!_id) {
                return false;
            }
            await ActivityMongoManager.deleteActivityInfo(_id);
            return true;
        } catch (e) {
            ManagerErrorLogger.error(`ActivityService.deleteActivityInfo exception : ${e.stack | e}`);
            return false;
        }
    };



    /**
     *   设置报警事件的设置
     */
    async setAlarmEventThing(inputGoldThan: number, winGoldThan: number, winAddRmb: number): Promise<any> {
        try {
            const systemConfig = await SystemConfigManagerDao.findOne({});
            systemConfig.inputGoldThan = inputGoldThan;
            systemConfig.winGoldThan = winGoldThan;
            systemConfig.winAddRmb = winAddRmb;
            await SystemConfigManagerDao.updateOne({ id: systemConfig.id }, systemConfig);
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`setAlarmEventThing ==>error: ${error}`);
            console.info(`setAlarmEventThing ==>error: ${error}`);
            return Promise.reject(false);
        }
    }

    /**
     *   设置报警事件的设置
     */
    async getAlarmEventThing(): Promise<any> {
        try {
            const systemConfig = await SystemConfigManagerDao.findOne({});
            const inputGoldThan = systemConfig.inputGoldThan ? systemConfig.inputGoldThan : 0;
            const winGoldThan = systemConfig.winGoldThan ? systemConfig.winGoldThan : 0;
            const winAddRmb = systemConfig.winAddRmb ? systemConfig.winAddRmb : 0;
            return { inputGoldThan, winGoldThan, winAddRmb };
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`getAlarmEventThing ==>error: ${error}`);
            console.info(`getAlarmEventThing ==>error: ${error}`);
            return Promise.reject(false);
        }
    }

    /**
     *   获取报警事件的记录
     */
    async getAlarmEventThingRecord(page: number, status: number, startTime: number, endTime: number, pageSize: number): Promise<any> {
        try {
            let { list, count } = await AlarmEventThingMysqlDao.findListToLimitNoTime(page, pageSize, status)
            return { list, count };
        } catch (error) {
            ManagerErrorLogger.info(`getAlarmEventThingRecord ==>error: ${error}`);
            console.info(`getAlarmEventThingRecord ==>error: ${error}`);
            return Promise.reject(false);
        }
    }

    /**
     *   设置报警事件的设置
     */
    async setAlarmEventThingRecord(id: number, status: number, managerId: string): Promise<any> {
        try {
            if (!managerId) {
                return Promise.reject("处理失败");
            }
            await AlarmEventThingMysqlDao.updateOne({ id }, { status: status, managerId: managerId });
            //减少redis游戏预警的数量
            await AlarmEventThingRedisDao.delLength({length:1});
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`setAlarmEventThingRecord ==>error: ${error}`);
            console.info(`setAlarmEventThingRecord ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }

    /**
     *   一键处理设置报警事件
     */
    async setAlarmEventThingList(  managerId: string): Promise<any> {
        try {
            if (!managerId ) {
                return Promise.reject("处理失败");
            }
            await AlarmEventThingMysqlDao.updateOne({ status: 0 }, { status: 1, managerId: managerId });
            //重置为0
            await AlarmEventThingRedisDao.init({length:0});
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`setAlarmEventThingList ==>error: ${error}`);
            console.info(`setAlarmEventThingList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }

    /**
     *   在线人数以及报警事件条数提醒
     */
    async remindOnlineAndAlarm(): Promise<any> {
        try {
            const [allOnlineUid, length ,waitingForReview] = await Promise.all([
                OnlinePlayerRedisDao.getPlayerLength({}),
                AlarmEventThingRedisDao.getPlayerLength({}),
                ThirdGoldRecordRedisDao.getPlayerLength({})
            ]);
            return { allOnlineUid: allOnlineUid, length ,waitingForReview};
        } catch (error) {
            ManagerErrorLogger.info(`setAlarmEventThingRecord ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }

    /**
     *   获取抽水设置
     */
    async getGameCommissionList(): Promise<any> {
        try {
            const games = await GameManager.findList({});
            const GameCommissionList = await GameCommissionManager.findList({});
            if(GameCommissionList.length == 0){
                await GameCommissionManager.deleteAllInRedis({});
            }
            return { games, GameCommissionList };
        } catch (error) {
            ManagerErrorLogger.info(`getGameCommissionList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }


    /**
     *   新增一个游戏的抽水
     */
    async addOneGameCommissionList(nid, way, targetCharacter, bet, win, settle, open): Promise<any> {
        try {
            const record = await GameCommissionManager.findOne({ nid });
            if (record) {
                return Promise.reject("该游戏的抽水设置已经存在");
            }
            await GameCommissionManager.insertOne({ nid, way, targetCharacter, bet, win, settle, open })
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`addOneGameCommissionList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }

    /**
     *   删除一个游戏的抽水
     */
    async deleteOneGameCommissionList(nid): Promise<any> {
        try {
            await GameCommissionManager.delete({ nid })
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`deleteOneGameCommissionList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }


    /**
     *   修改一个游戏的抽水
     */
    async updateOneGameCommissionList(nid, way, targetCharacter, bet, win, settle, open): Promise<any> {
        try {
            await GameCommissionManager.updateOne({ nid }, { nid, way, targetCharacter, bet, win, settle, open })
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`updateOneGameCommissionList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }



    /**
     *   获取前端的系统日志
     *    list.push(item);
     */
    async getWebLogs(scene :string , uid : string , createTime:string , level : string , page : number): Promise<any> {
        try {
            const address = `/data/logs/client._${createTime}.log`;
            let data = await fileUtils.readLogs(address);
            if(!data){
                return { list : [], length : 0 };
            }
            let ss = data.toString();
            let ll = ss.split("|");
            let list = [];
            for(let key of ll){
                if(key){
                    let item = JSON.parse(key.toString());
                    if(scene && !uid && !level){
                       if(item.scene == scene){
                           list.push(item);
                       }
                    }else if(!scene && uid && !level ){
                        if(item.uid == uid){
                            list.push(item);
                        }
                    }else if(!scene && !uid && level ){
                        if(item.uid == uid){
                            list.push(item);
                        }
                    }else if(scene && uid && !level){
                        if(item.uid == uid && item.scene == scene ){
                            list.push(item);
                        }
                    }else if(scene && level && !uid){
                        if(item.scene == scene && item.level == level ){
                            list.push(item);
                        }
                    }else if(!scene && level && uid){
                        if(item.uid == uid && item.level == level ){
                            list.push(item);
                        }
                    }else if(scene && level && uid){
                        if(item.uid == uid && item.level == level && item.uid == uid ){
                            list.push(item);
                        }
                    }else{
                        list.push(item);
                    }
                }
            }
            // 分页
            const count = 20;
            const length  =list.length ;
            const start = (page - 1) * count;
            const end = (page ? page : 1) * count + 1;
            list = list.slice(start ,end);
            return { list, length };
        } catch (error) {
            ManagerErrorLogger.info(`getWebLogs ==>error: ${error}`);
            return Promise.reject("获取失败");
        }
    }

    /**
     *   根据登陆账号获取ip地址列表
     */
    async getWhiteIpFromUserName(page : number ,pageSize : number , manager :string): Promise<any> {
        try {
            const { list ,count } = await WhiteIpRecordMysqlDao.findListToLimitFromUserName(page ,pageSize , manager);
            return { list ,count };
        } catch (error) {
            ManagerErrorLogger.info(`getAllWhiteIp ==>error: ${error}`);
            return Promise.reject("获取所有的白名单失败");
        }
    }


    /**
     *   获取所有的白名单
     */
    async getAllWhiteIp(page : number ,pageSize : number): Promise<any> {
        try {
            const { list ,count } = await WhiteIpRecordMysqlDao.findListToLimitNoTime(page ,pageSize);
            return { list ,count };
        } catch (error) {
            ManagerErrorLogger.info(`getAllWhiteIp ==>error: ${error}`);
            return Promise.reject("获取所有的白名单失败");
        }
    }


    /**
     *   根据所属人查询白名单
     */
    async selectWhiteIp(account : string ): Promise<any> {
        try {
            const { list ,count } = await WhiteIpRecordMysqlDao.findListToLimitFromAccount(account);
            return { list ,count };
        } catch (error) {
            ManagerErrorLogger.info(`selectWhiteIp ==>error: ${error}`);
            return Promise.reject("根据所属人查询白名单失败");
        }
    }

    /**
     *   新增一个白名单
     */
    async addWhiteIp(ip : string ,account : string , message : string, userName : string): Promise<any> {
        try {
            await WhiteIpRecordMysqlDao.insertOne({ip ,account ,message , createUser : userName  });
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`addWhiteIp ==>error: ${error}`);
            return Promise.reject("新增一个白名单失败");
        }
    }

    /**
     *   修改一个白名单
     */
    async updateWhiteIp(id : number , ip : string ,account : string , message : string): Promise<any> {
        try {
            await WhiteIpRecordMysqlDao.updateOne({id },{ip ,account ,message   });
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`addWhiteIp ==>error: ${error}`);
            return Promise.reject("新增一个白名单失败");
        }
    }


    /**
     *   删除一个白名单
     */
    async deleteWhiteIp(id : number ): Promise<any> {
        try {
             await WhiteIpRecordMysqlDao.delete({id} );
            return true;
        } catch (error) {
            ManagerErrorLogger.info(`deleteWhiteIp ==>error: ${error}`);
            return Promise.reject("删除一个白名单失败");
        }
    }


    /**
     *   游戏登陆报表
     */
    async gameLoginData(): Promise<any> {
        try {
            const  [ result , createLength , loginLength , onlineLength , maxOnline ] = await Promise.all([
                PlayerManager.findPlayerDayLoginData(),
                DayCreatePlayerRedisDao.getPlayerLength({}),
                DayLoginPlayerRedisDao.getPlayerLength({}),
                OnlinePlayerRedisDao.getPlayerLength({}),
                OnlinePlayerRedisDao.getOnlineMax({}),
            ])
            return { result , createLength , loginLength , onlineLength , maxOnline  };
        } catch (error) {
            ManagerErrorLogger.info(`gameLoginData ==>error: ${error}`);
            return Promise.reject("游戏登陆报表");
        }
    }

    /**
     *   获游戏登陆报表时间段明细
     */
    async playerLoginHourData(): Promise<any> {
        try {
            const  [result ,Onlinelist ] = await Promise.all([
                ThirdGoldRecordMysqlDao.PlayerLoginHourData(),
                DayCreatePlayerRedisDao.findList({})
            ]);
            let listData = [];
            let oneHour = 60 * 60 * 1000;
            for(let i = 0 ; i< 24 ; i++){
                const item  = result.find(key=>Number(key.hour) == i);
                const length = Onlinelist.filter(key=> key.createTime > Utils.zerotime() + i * oneHour &&   key.createTime < Utils.zerotime() + ( i + 1 )* oneHour);
                const info ={
                    time : i + '--' + (i+1),
                    entryCount : item ? Number(item.id) : 0,
                    entryGold : item ? item.loginGold : 0,
                    createPlayer: length.length,
                }
                listData.push(info);
            }
            return listData;
        } catch (error) {
            ManagerErrorLogger.info(`playerLoginHourData ==>error: ${error}`);
            return Promise.reject("playerLoginHourData");
        }
    }

    /**
     *   获游戏登陆报表时间段明细
     */
    async dayApiData(startTime : number , endTime : number ): Promise<any> {
        try {
            const  startTimeDate = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
            const  endTimeDate = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
            const { list, count } = await DayApiDataMysqlDao.findListToLimit(startTimeDate, endTimeDate);
            return {list , count}
        } catch (error) {
            ManagerErrorLogger.info(`dayApiData ==>error: ${error}`);
            return Promise.reject("dayApiData");
        }
    }


    /**
     * 自己给自己修改密码
     * @param userName    账号
     * @param passWord    密码
     */
    async postSystemNotice(content : string): Promise<any> {
        try {
            content = content ? content : "我们将在30分钟后停服务器";
            await MessageService.notice({route : 'system', content : content});
            return true;
        } catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }

    /**
     * 是否设置关闭API登陆请求
     * @param isCloseApi    是否关闭API登陆
     * @param id    密码
     */
    async closeApiLogin(isCloseApi : boolean , id : number, apiTestAgent): Promise<any> {
        try {

            await SystemConfigManagerDao.updateOne({id},{isCloseApi ,apiTestAgent});
            return true;
        } catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }


    /**
     *设置部分游戏维护状态
     * @param userName    账号
     * @param passWord    密码
     */
    async closeGameApi(nidList : any , id : number): Promise<any> {
        try {
            await SystemConfigManagerDao.updateOne({id},{closeNid : nidList});
            return true;
        } catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }

    /**
     *获取停服信息和停服游戏
     * @param userName    账号
     * @param passWord    密码
     */
    async getCloseApiData(): Promise<any> {
        try {
            const systemConfig = await SystemConfigManagerDao.findOne({});
            const games = await GameManager.findList({});
            const gameList = games.map((info)=>{
                return { nid: info.nid , zname : info.zname};
            })
            const { id , closeNid , isCloseApi , apiTestAgent } = systemConfig;
            return {  gameList,  id , closeNid : closeNid ? closeNid : []  , isCloseApi : isCloseApi ? isCloseApi : false , apiTestAgent } ;
        } catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }

    /**
     *踢掉所有玩家
     * @param userName    账号
     * @param passWord    密码
     */
    async kickAllPlayer(): Promise<any> {
        try {
            const onlinePlayers = await OnlinePlayerRedisDao.findList();
            for(let player of onlinePlayers){
                const { frontendServerId,  uid } = player;
                await pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
            }
            // await pinus.app.rpc.connector.enterRemote.kickAllOffline.toServer('*');
            return true ;
        } catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }

    /**
     *设置黑名单IP
     * @param userName    账号
     * @param passWord    密码
     */
    async setBlackIp(manager : string, ip : string): Promise<any> {
        try {

            await BlackIpRedisDao.insertOne({ip , time: new Date() , creator : manager});
            return true ;
        } catch (error) {
            ManagerErrorLogger.error(`设置黑名单IP :${error.stack || error}`);
            return { code: 500, info: '设置黑名单IP异常' };
        }
    }
    /**
     *获取黑名单IP
     * @param userName    账号
     * @param passWord    密码
     */
    async getAllBlackIp(): Promise<any> {
        try {

            const list =  await BlackIpRedisDao.findList();
            return list ;
        } catch (error) {
            ManagerErrorLogger.error(`获取黑名单IP :${error.stack || error}`);
            return { code: 500, info: '获取黑名单IP异常' };
        }
    }

    /**
     *删除所有黑名单IP
     * @param userName    账号
     * @param passWord    密码
     */
    async deleteAllBlackIp(): Promise<any> {
        try {
            await BlackIpRedisDao.delete({});
            return true ;
        } catch (error) {
            ManagerErrorLogger.error(`删除所有黑名单IP :${error.stack || error}`);
            return { code: 500, info: '删除所有黑名单IP' };
        }
    }

    /**
     *删除单个黑名单IP
     * @param userName    账号
     * @param passWord    密码
     */
    async deleteBlackIp(ip:string): Promise<any> {
        try {
            await BlackIpRedisDao.deleteOne({ip});
            return true ;
        } catch (error) {
            ManagerErrorLogger.error(`删除单个黑名单IP :${error.stack || error}`);
            return { code: 500, info: '删除单个黑名单IP' };
        }
    }


    /**
     *获取服务器日志
     * @param userName    账号
     * @param passWord    密码
     */
    async getSystemManagerLogs(ip:string , userName : string , startTime : string , endTime : string , page : number ): Promise<any> {
        try {

            if(!ip && !userName && !startTime && !endTime){
                let result = await ManagerLogsMysqlDao.findListToLimit();
                return result;
            }else {
                let where = null;
                //如果查询时间存在
                if(startTime || endTime){
                    where = `Sp_ManagerLogs.createDate > "${startTime}"  AND Sp_ManagerLogs.createDate <= "${endTime}"`;
                }
                //IP存在
                if(ip){
                    if(where){
                        where = where + `AND Sp_ManagerLogs.requestIp = "${ip}"`;
                    }else {
                        where = `Sp_ManagerLogs.requestIp = "${ip}"`;
                    }
                }
                //userName存在
                if(userName){
                    if(where){
                        where = where + `AND Sp_ManagerLogs.mangerUserName = "${userName}"`;
                    }else {
                        where = `Sp_ManagerLogs.mangerUserName = "${userName}"`;
                    }
                }


                let result = await ManagerLogsMysqlDao.getSelectWhereForLogs(where , page);
                return  result;

            }
        } catch (error) {
            ManagerErrorLogger.error(`getSystemManagerLogs :${error.stack || error}`);
            return { code: 500, info: '获取服务器日志失败' };
        }
    }





}


