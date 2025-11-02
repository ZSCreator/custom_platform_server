import { Controller, Post, Get, Body, UseGuards, Session } from "@nestjs/common";
import { SystemService } from "./system.service";
import { getLogger } from 'pinus-logger';
import { Logger } from "pinus";
import { TokenGuard } from "../main/token.guard";
import * as moment from "moment";

/**
 * 管理后台
 */
@Controller('system')
@UseGuards(TokenGuard)
export class SystemController {
    logger: Logger;
    constructor(private readonly SystemService: SystemService) {
        this.logger = getLogger('thirdHttp', __filename);
    }

    /**
     * 获取系统设置
     * @param str
     */
    @Post('getSystemConfig')
    async getSystemConfig(@Body() str: any): Promise<any> {
        console.log("getSystemConfig", str)
        try {
            const result = await this.SystemService.getSystemConfig();
            return result;
        } catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error }
        }

    }


    /**
     * 修改系统设置
     * @param str
     */
    @Post('changeSystemConfig')
    async changeSystemConfig(@Body() str: any): Promise<any> {
        console.log("getSystemConfig", str)
        try {
            // const param = str.param;
            const data = str.data;
            const result = await this.SystemService.changeSystemConfig(data);
            return result;
        } catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error }
        }

    }


    /**
     * 获取无线代参数
     * @param str
     */
    @Post('getUnlimitedList')
    async getUnlimitedList(@Body() str: any): Promise<any> {
        console.log("getUnlimitedList", str)
        try {
            // const param = str.param;
            const result = await this.SystemService.getUnlimitedList();
            return result;
        } catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error }
        }

    }


    /**
     * 设置无线代
     * @param str
     */
    @Post('setUnlimitedList')
    async setUnlimitedList(@Body() str: any): Promise<any> {
        console.log("setUnlimitedList", str)
        try {
            // const param = str.param;
            let { id, openUnlimited ,iplRebate, unlimitedList } = str ;
            if(!id){
                return { code: 500, error: "id 不存在" }
            }
            if(openUnlimited == true && unlimitedList.length == 0){
                return { code: 500, error: "无线代不能为空" }
            }
            if(!iplRebate){
                return { code: 500, error: " IPL参数不存在" }
            }
            const result = await this.SystemService.setUnlimitedList( id, openUnlimited , unlimitedList , iplRebate);
            return result;
        } catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error }
        }

    }



    /**
     * 发送邮件
     * @param str
     */
    @Post('PostMails')
    async PostMails(@Body() str: any): Promise<any> {
        try {
            const param = str;
            const uid = param.uid;
            const mail = param.mail;
            const sender = param.sender ?  param.sender : 'system';
            if(!uid){
                return { code: 500, error: "请输入玩家id" }
            }
            const result = await this.SystemService.PostMails(uid, mail ,sender);
            return result;
        } catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error }
        }

    }

    /**
     * 根据uid 来查询该玩家的邮件
     * @param str
     */
    @Post('selectPlayerMails')
    async selectPlayerMails(@Body() str: any): Promise<any> {
        try {
            const param = str;
            const uid = param.uid;
            let page = param.page;
            if(!uid){
                return { code: 500, error: "请输入玩家id进行查询" }
            }
            page = page ? page : 1 ;
            const { list ,count }  = await this.SystemService.selectPlayerMails(uid ,page);
            return {code: 200 , list ,count };
        } catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error }
        }

    }

    /**
     * 获取网站活动的内容
     * @param str
     */
    @Post('getSystemAnnouncement')
    async getSystemAnnouncement(@Body() str: any): Promise<any> {
        console.log("getSystemConfig", str)
        try {
            const {list ,count} = await this.SystemService.getSystemAnnouncement();
            return  {code : 200 , list ,length : count };
        } catch (error) {
            this.logger.error(`获取网站活动的内容 :${error}`);
            return { code: 500, error: error }
        }

    }

    /**
     * 保存网站活动内容公告以及
     * @param str
     */
    @Post('updateAnnouncement')
    async updateAnnouncement(@Body() str: any): Promise<any> {
        try {
            console.log('updateAnnouncement', str.param);
            const param = str;
            const content = param.content;
            const sort = param.sort;
            const title = param.title;
            const openType = param.openType;
            const id = param.id;
            await this.SystemService.changeAndSaveAnnouncement(id , content, openType, sort, title);
            return { code: 200, msg: "网站活动设置成功" };
        } catch (error) {
            this.logger.error(`获取网站活动的内容 :${error}`);
            return { code: 500, error: error }
        }

    }


    /**
     * 删除公告
     * @param str
     */
    @Post('deleteUpdateAnnouncement')
    async deleteUpdateAnnouncement(@Body() str: any): Promise<any> {
        try {
            console.log('deleteUpdateAnnouncement', str);
            const param = str;
            const id = param.id;
            await this.SystemService.deleteUpdateAnnouncement(id);
            return { code: 200, msg: "删除公告" };
        } catch (error) {
            this.logger.error(`删除公告 :${error}`);
            return { code: 500, error: error }
        }

    }



    /**
     * 获取所有的功能性活动
     * @param str
     */
    @Post('getAllActivityInfo')
    async getAllActivityInfo(@Body() str: any): Promise<any> {
        try {
            console.log('getAllActivityInfo', str.param);
            const result = await this.SystemService.getAllActivityInfo();
            return { code: 200, result };
        } catch (error) {
            this.logger.error(`获取所有的功能性活动 :${error}`);
            return { code: 500, error: error }
        }

    }


    /**
     * 添加或更新一条活动配置
     * @param str
     */
    @Post('saveOrUpdateActivityInfo')
    async saveOrUpdateActivityInfo(@Body() str: any): Promise<any> {
        try {
            console.log('saveOrUpdateActivityInfo', str.param);
            const param = str.param;
            const type = param.type;
            const remark = param.remark;
            const title = param.title;
            const sort = param.sort;
            const contentImg = param.contentImg;
            const isLeading = param.isLeading;
            const isOpen = param.isOpen;
            const _id = param._id;
            const result = await this.SystemService.saveOrUpdateActivityInfo(type, remark, title, sort, contentImg, isLeading, isOpen, _id);
            return { code: 200, result };
        } catch (error) {
            this.logger.error(`添加或更新一条活动配置 :${error}`);
            return { code: 500, error: error }
        }

    }


    /**
     * 删除一条活动配置
     * @param str
     */
    @Post('deleteActivityInfo')
    async deleteActivityInfo(@Body() str: any): Promise<any> {
        try {
            console.log('deleteActivityInfo', str.param);
            const param = str.param;
            const _id = param._id;
            await this.SystemService.deleteActivityInfo(_id);
            return { code: 200, msg: "删除成功" };
        } catch (error) {
            this.logger.error(`删除一条活动配置 :${error}`);
            return { code: 500, error: error }
        }

    }



    /**
     *  设置报警事件的设置
     *    "inputGoldThan": 0,
     "winGoldThan": 0,
     "winAddRmb": 0,
     */
    @Post('setAlarmEventThing')
    async setAlarmEventThing(@Body() str: any): Promise<any> {
        try {
            console.warn('getPlatformAgentDatDayRecord', str);
            // const param = str.param;
            const { inputGoldThan, winGoldThan, winAddRmb } = str;
            await this.SystemService.setAlarmEventThing(inputGoldThan, winGoldThan, winAddRmb);
            return { code: 200, msg: '保存成功' };
        } catch (error) {
            this.logger.error(`设置报警事件的设置 :${error}`);
            return { code: 500, error: "保存失败" }
        }

    }

    /**
     *  获取报警事件的设置
     */
    @Post('getAlarmEventThing')
    async getAlarmEventThing(@Body() str: any): Promise<any> {
        try {
            console.log('getAlarmEventThing', str.param);
            const param = str;
            const { inputGoldThan, winGoldThan, winAddRmb } = await this.SystemService.getAlarmEventThing();
            return { code: 200, inputGoldThan, winGoldThan, winAddRmb };
        } catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: error }
        }
    }


    /**
     *  获取触发报警的事件
     */
    @Post('getAlarmEventThingRecord')
    async getAlarmEventThingRecord(@Body() str: any): Promise<any> {
        try {
            console.log('getAlarmEventThingRecord', str);
            // const param = str.param;
            let { status, page, startTime, endTime ,pageSize } = str;   //根据传入的状态获取触发事件的状态
            if(!status.toString() || !pageSize ||!page){
                return { code: 500, error: "参数不完整" };
            }
            const result = await this.SystemService.getAlarmEventThingRecord(page, status, startTime, endTime ,pageSize);
            return { code: 200, result };
        } catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: error };
        }
    }

    /**
     *  设置触发报警的事件
     */
    @Post('setAlarmEventThingRecord')
    async setAlarmEventThingRecord(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('setAlarmEventThingRecord', str.param);
            // const param = str.param;
            let { id, status , managerId } = str;   //根据传入的状态获取触发事件的状态
            await this.SystemService.setAlarmEventThingRecord(id, status, managerId);
            return { code: 200, msg: '处理成功' };
        } catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: '处理失败' }
        }
    }


    /**
     *  一键处理设置报警事件
     */
    @Post('setAlarmEventThingList')
    async setAlarmEventThingList(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('setAlarmEventThingRecord', str.param);
            // const param = str.param;
            let { managerId } = str;   //根据传入的状态获取触发事件的状态
            await this.SystemService.setAlarmEventThingList( managerId);
            return { code: 200, msg: '处理成功' };
        } catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: '处理失败' }
        }
    }


    /**
     *  在线人数以及报警事件条数提醒
     */
    @Post('remindOnlineAndAlarm')
    async remindOnlineAndAlarm(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('remindOnlineAndAlarm', str.param);
            const { allOnlineUid , length ,waitingForReview  } = await this.SystemService.remindOnlineAndAlarm();
            return { code: 200, allOnlineUid , length ,waitingForReview  };
        } catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: '处理成功' }
        }
    }


    /**
     *  获取抽水设置
     */
    @Post('getGameCommissionList')
    async getGameCommissionList(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('getGameCommissionList', str.param);
            const { games, GameCommissionList  } = await this.SystemService.getGameCommissionList();
            return { code: 200, games, GameCommissionList  };
        } catch (error) {
            this.logger.error(`获取抽水设置 :${error}`);
            return { code: 500, error: '处理成功' }
        }
    }


    /**
     *  新增一个游戏的抽水
     */
    @Post('addOneGameCommissionList')
    async addOneGameCommissionList(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('getGameCommissionList', str);
            // const param = str.param;
            let { nid , way , targetCharacter , bet ,win , settle , open } = str;   //根据传入的状态获取触发事件的状态
            if(!nid){
                return { code: 500, error: 'nid 数据传入错误' }
            }
            open = open ?  true : false;
            await this.SystemService.addOneGameCommissionList(nid , way , targetCharacter , bet ,win , settle , open);
            return { code: 200, msg:"添加成功" };
        } catch (error) {
            this.logger.error(`获取抽水设置 :${error}`);
            return { code: 500, error: '处理失败' }
        }
    }


    /**
     *  修改一个游戏的抽水
     */
    @Post('updateOneGameCommissionList')
    async updateOneGameCommissionList(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('updateOneGameCommissionList', str);
            // const param = str.param;
            let { nid , way , targetCharacter , bet ,win , settle , open } = str;   //根据传入的状态获取触发事件的状态
            if(!nid){
                return { code: 500, error: 'nid 数据传入错误' }
            }
            await this.SystemService.updateOneGameCommissionList(nid , way , targetCharacter , bet ,win , settle , open);
            return { code: 200, msg:"处理成功" };
        } catch (error) {
            this.logger.error(`获取抽水设置 :${error}`);
            return { code: 500, error: '处理失败' }
        }
    }



    /**
     *  删除一个游戏的抽水
     */
    @Post('deleteOneGameCommissionList')
    async deleteOneGameCommissionList(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('deleteOneGameCommissionList', str);
            // const param = str.param;
            let { nid } = str;   //根据传入的状态获取触发事件的状态
            if(!nid){
                return { code: 500, error: 'nid 数据传入错误' }
            }
            await this.SystemService.deleteOneGameCommissionList( nid );
            return { code: 200, msg:"处理成功" };
        } catch (error) {
            this.logger.error(`获取抽水设置 :${error}`);
            return { code: 500, error: '处理失败' }
        }
    }


    /**
     *  获取前端的系统日志
     */
    @Post('getWebLogs')
    async getWebLogs(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('getWebLogs', str);
            // const param = str.param;
            let { uid , scene , createTime ,page , level } = str;
            const { list, length } = await this.SystemService.getWebLogs(scene , uid , createTime , level , page);
            return { code: 200, list, length };
        } catch (error) {
            this.logger.error(`获取前端的系统日志 :${error}`);
            return { code: 500, error: '获取失败' }
        }
    }


    /**
     *  获取所有的白名单
     */
    @Post('getAllWhiteIp')
    async getAllWhiteIp(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('getAllWhiteIp', str);
            let { page , pageSize , account } = str;
            page = page ?  page : 1;
            pageSize = pageSize ?  pageSize : 20;
            if(account){
                const { list, count } = await this.SystemService.selectWhiteIp(account);
                return { code: 200, list, length:count };
            }else{
                const { list, count } = await this.SystemService.getAllWhiteIp(page ,pageSize);
                return { code: 200, list, length:count };
            }

        } catch (error) {
            this.logger.error(`获取所有的白名单 :${error}`);
            return { code: 500, error: '获取失败' }
        }
    }


    /**
     *  根据登陆账号获取ip地址列表
     */
    @Post('getWhiteIpFromUserName')
    async getWhiteIpFromUserName(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('getAllWhiteIp', str);
            // const param = str.param;
            let { page , pageSize ,manager } = str;
            if(!manager){
                return { code: 500, error: '后台账户信息错误' }
            }
            page = page ?  page : 1;
            pageSize = pageSize ?  pageSize : 20;
            const { list, count } = await this.SystemService.getWhiteIpFromUserName(page ,pageSize , manager );
            return { code: 200, list, length:count };
        } catch (error) {
            this.logger.error(`获取所有的白名单 :${error}`);
            return { code: 500, error: '获取失败' }
        }
    }


    /**
     *  新增一个白名单
     */
    @Post('addWhiteIp')
    async addWhiteIp(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('addWhiteIp', str);
            // const param = str.param;
            let { ip ,account , message , manager } = str;
            if(!ip || !account){
                return  { code: 500, error: '请输入ip和账号' }
            }
            await this.SystemService.addWhiteIp(ip ,account , message , manager );
            return { code: 200, };
        } catch (error) {
            this.logger.error(`新增一个白名单 :${error}`);
            return { code: 500, error: '获取失败' }
        }
    }






    /**
     *  修改一个白名单
     */
    @Post('updateWhiteIp')
    async updateWhiteIp(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('addWhiteIp', str);
            // const param = str.param;
            let { id , ip ,account , message ,  } = str;
            if(!id){
                return  { code: 500, error: '请输入ip和账号' }
            }
            await this.SystemService.updateWhiteIp(id ,ip ,account , message  );
            return { code: 200, };
        } catch (error) {
            this.logger.error(`新增一个白名单 :${error}`);
            return { code: 500, error: '获取失败' }
        }
    }


    /**
     *  删除一个白名单
     */
    @Post('deleteWhiteIp')
    async deleteWhiteIp(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('deleteWhiteIp', str);
            // const param = str.param;
            let { id  } = str;
            if(!id ){
                return  { code: 500, error: '请输入ip' }
            }
            await this.SystemService.deleteWhiteIp(id);
            return { code: 200,  };
        } catch (error) {
            this.logger.error(`删除一个白名单 :${error}`);
            return { code: 500, error: '获取失败' }
        }
    }


    /**
     *  游戏登陆报表
     */
    @Post('gameLoginData')
    async gameLoginData(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('gameLoginData', str);
            const {result , createLength , loginLength , onlineLength , maxOnline } =  await this.SystemService.gameLoginData();
            const data = {
                gold: result ?  result.gold : 0 ,
                entryGold : result ? result.addDayRmb : 0 ,
                leaveGold : result ? result.addDayTixian : 0,
                createLength,
                loginLength,
                onlineLength,
                maxOnline,
            }
            return { code: 200, data  };
        } catch (error) {
            this.logger.error(`游戏登陆报表 :${error}`);
            return { code: 500, error: '获取失败' }
        }
    }

    /**
     *  获游戏登陆报表时间段明细
     */
    @Post('playerLoginHourData')
    async playerLoginHourData(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('playerLoginHourData', str);
            const result =  await this.SystemService.playerLoginHourData();

            return { code: 200, result  };
        } catch (error) {
            this.logger.error(`游戏登陆报表 :${error}`);
            return { code: 500, error: '获取失败' }
        }
    }

    /**
     *   获取平台相关数据
     */
    @Post('dayApiData')
    async dayApiData(@Body() str: any, @Session() session: any): Promise<any> {
        try {
            console.log('dayApiData', str);
            const {startTime , endTime } = str;
            if(!startTime || !endTime){
                const {result , createLength , loginLength ,  maxOnline } =  await this.SystemService.gameLoginData();
                const data = {
                    selfGold: result ?  Number(result.gold) : 0 ,
                    entryGold : result ? Number(result.addDayRmb) : 0 ,
                    leaveGold : result ? Number(result.addDayTixian) : 0,
                    createLength,
                    loginLength,
                    maxOnline : Number(maxOnline),
                    entryAndLeave : Number( result.addDayRmb) - Number(result.addDayTixian),
                    createDate: moment().format("YYYY-MM-DD HH:mm:ss")
                };
                let list = [];
                list.push(data);
                return { code: 200, list , count : 1 };
            }
            const {list ,count } =  await this.SystemService.dayApiData(startTime , endTime );
            return { code: 200, list , count  };
        } catch (error) {
            this.logger.error(`获取平台相关数据 :${error}`);
            return { code: 500, error: '获取失败' }
        }
    }


    /**
     * 发送玩家跑马灯
     * @param str
     */
    @Post('postSystemNotice')
    async postSystemNotice(@Body() { content , postNum , postTime}): Promise<any> {
        try {
            let time = postTime * 1000;
            for(let num = 0 ; num < postNum ; num++ ){
                setTimeout(() => {
                    this.SystemService.postSystemNotice(content);
                }, time);
            }

            return { code: 200 , msg: "发送成功"  };
        } catch (error) {
            return { code: 500, error }
        }

    }

    /**
     * 是否设置关闭API登陆请求
     * @param str
     */
    @Post('closeApiLogin')
    async closeApiLogin(@Body() { isCloseApi , id , apiTestAgent }): Promise<any> {
        try {
             await this.SystemService.closeApiLogin(isCloseApi , id , apiTestAgent);
            return { code: 200 , msg: "设置成功"  };
        } catch (error) {
            return { code: 500, error }
        }
    }

    /**
     * 设置部分游戏维护状态
     * @param str
     */
    @Post('closeGameApi')
    async closeGameApi(@Body() { nidList , id }): Promise<any> {
        try {
            await this.SystemService.closeGameApi(nidList , id);
            return { code: 200 , msg: "设置成功"  };
        } catch (error) {
            return { code: 500, error }
        }
    }


    /**
     * 获取停服信息和停服游戏
     * @param str
     */
    @Post('getCloseApiData')
    async getCloseApiData(): Promise<any> {
        try {
            const {  gameList,  id , closeNid , isCloseApi , apiTestAgent  } = await this.SystemService.getCloseApiData();
            return { code: 200 , gameList,  id , closeNid , isCloseApi ,apiTestAgent };
        } catch (error) {
            return { code: 500, error }
        }
    }

    /**
     * 踢掉所有玩家
     * @param str
     */
    @Post('kickAllPlayer')
    async kickAllPlayer(): Promise<any> {
        try {
             await this.SystemService.kickAllPlayer();
            return { code: 200  };
        } catch (error) {
            return { code: 500, error }
        }
    }
    /**
     * 设置黑名单IP
     * @param str
     */
    @Post('setBlackIp')
    async setBlackIp(@Body() str: any,): Promise<any> {
        try {
            const {manager , ip  }  = str ;
            await this.SystemService.setBlackIp(manager , ip);
            return { code: 200  };
        } catch (error) {
            return { code: 500, error }
        }
    }

    /**
     * 获取所有黑名单IP
     * @param str
     */
    @Post('getAllBlackIp')
    async getAllBlackIp(@Body() str: any,): Promise<any> {
        try {
            const list  = await this.SystemService.getAllBlackIp();
            return { code: 200 , list };
        } catch (error) {
            return { code: 500, error }
        }
    }

    /**
     * 删除黑名单IP
     * @param str
     */
    @Post('deleteBlackIp')
    async deleteBlackIp(@Body() str: any,): Promise<any> {
        try {
            const {  ip  }  = str ;
            if(!ip){
                await this.SystemService.deleteAllBlackIp()
            }else{
                await this.SystemService.deleteBlackIp(ip)
            }
            return { code: 200 };
        } catch (error) {
            return { code: 500, error }
        }
    }


    /**
     * 获取服务器日志
     * @param str
     */
    @Post('getSystemManagerLogs')
    async getSystemManagerLogs(@Body() str: any,): Promise<any> {
        try {
            const {  ip , userName , startTime , endTime ,page  }  = str ;
            const result = await this.SystemService.getSystemManagerLogs(ip,userName, startTime , endTime , page )
            return { code: 200 , result};
        } catch (error) {
            return { code: 500, error }
        }
    }






}