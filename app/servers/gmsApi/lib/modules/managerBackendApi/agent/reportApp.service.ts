import { Injectable, } from '@nestjs/common';
import { getLogger } from "pinus-logger";
import PlayerManagerDao from "../../../../../../common/dao/daoManager/Player.manager";
import MallService from "../../../../../../services/hall/mallHandler/mallService";
import PlayerCashRecordMysqlDao from "../../../../../../common/dao/mysql/PlayerCashRecord.mysql.dao";
import PromotionReportAppMysqlDao from "../../../../../../common/dao/mysql/PromotionReportApp.mysql.dao";
import GameRecordMysqlDao from "../../../../../../common/dao/mysql/GameRecord.mysql.dao";
const  ManagerErrorLogger = getLogger('http', __filename);
import PayInfoMysqlDao from "../../../../../../common/dao/mysql/PayInfo.mysql.dao";
import PlatformNameAgentListRedisDao from "../../../../../../common/dao/redis/PlatformNameAgentList.redis.dao";
import OperationalRetentionMysqlDao from "../../../../../../common/dao/mysql/OperationalRetention.mysql.dao";
import * as moment from "moment";
import {GmsApiResultVO} from "../../../const/GmsApiResult.vo";




@Injectable()
export class ReportAppService {
    mallService: MallService;

    constructor() {
        this.mallService = new MallService();
    }

    /**
     *  推广渠道统计
     * @param agentNum
     * @param gold
     */
    async platformStatistics(managerAgent: string ): Promise<any> {
        try {
            //查询今日的数据
            let startTime = moment().format("YYYY-MM-DD 00:00:00");
            let endTime = moment().add(1,'day').format("YYYY-MM-DD 00:00:00");
            let tableTime =  moment().format("YYYYMM");
            const result_player = await PlayerManagerDao.todayAddPlayer_groupRemark(managerAgent, startTime , endTime);

            /** step1 获取渠道代理当日的充值信息*/

            const result_pay = await PayInfoMysqlDao.todayAddTotal_fee_groupRemark(managerAgent ,startTime , endTime);

            /** step1 获取渠道代理当日的提现信息*/
            const result_tixian = await PlayerCashRecordMysqlDao.todayAddTixian_groupRemark(managerAgent ,startTime , endTime);

            //获取平台当日的码量和抽水
            const platformUid = await PlatformNameAgentListRedisDao.findPlatformUid({platformName :managerAgent });
            const tableName = `Sp_GameRecord_${platformUid}_${tableTime}`;

            const result_flow = await GameRecordMysqlDao.getPlatformData(tableName,startTime, endTime);

              //获取总的码量和抽水
              const result_all = await PromotionReportAppMysqlDao.getPromotionReportApp(managerAgent);
              //获取所有的平台
               const platformList = await PlatformNameAgentListRedisDao.findOne({platformName : managerAgent});

                let list = [];
                for(let m of platformList){
                    let info = {
                        agentUid : null,
                        agentName : m,
                        platformName : managerAgent,
                        todayPlayer :0,
                        todayAddRmb :0,
                        todayTixian :0,
                        todayFlow :0,
                        todayCommission :0,
                        allAddRmb:0,
                        allTixian:0,
                        allPlayer:0,
                    }
                    let item_player = result_player.find(x=>x.agentName == m);
                    if(item_player){
                        info.todayPlayer = parseInt(item_player.todayPlayer);
                    }

                    let item_pay = result_pay.find(x=>x.agentName == m);
                    if(item_pay){
                        info.todayAddRmb = parseInt(item_pay.todayAddRmb);
                    }


                    let item_tixian = result_tixian.find(x=>x.agentName == m);
                    if(item_tixian){
                        info.todayTixian = parseInt(item_tixian.todayTixian);
                    }

                    let item_flow = result_flow.find(x=>x.groupRemark == m);
                    if(item_flow){
                        info.todayFlow = parseInt(item_flow.validBetTotal);
                        info.agentUid = item_flow.uid;
                        info.todayCommission = parseInt(item_flow.bet_commissionTotal ) +  parseInt(item_flow.win_commissionTotal ) + parseInt(item_flow.settle_commissionTotal);
                    }

                    //判断 agentUid 是否存在,如果不存在就要去数据库查找
                    if(result_all.length > 0){
                        const item = result_all.find(x=>x.agentName == m);
                        if(item){
                            info.allPlayer = item.todayPlayer + info.todayPlayer;
                            info.allAddRmb = item.todayAddRmb + info.todayAddRmb;
                            info.allTixian = item.todayTixian + info.todayTixian;
                            info.agentUid = item.agentUid;
                            info.todayCommission += item.todayCommission + info.todayCommission;
                        }

                    }

                    list.push(info);
                }

            return list ;
        } catch (e) {
            ManagerErrorLogger.error(`获取推广渠道统计: ${e.stack | e}`,e);
            return {list : [] };
        }
    };


    /**
     *  推广渠道统计
     * @param agentNum
     * @param gold
     */
    async agentStatistics(agentName: string, startTime :string, endTime : string  ): Promise<any> {
        try {
            let startTimeDate = moment(startTime).format("YYYY-MM-DD 00:00:00");
            let endTimeDate = moment(endTime).format("YYYY-MM-DD 23:59:59");
            if(startTimeDate > endTimeDate){
                return Promise.reject("时间范围选择错误");
            }
            //获取总的码量和抽水
            const result_all = await PromotionReportAppMysqlDao.getPromotionReportApp_Agent(agentName ,startTimeDate ,endTimeDate);
            return result_all ;
        } catch (e) {
            ManagerErrorLogger.error(`获取推广渠道统计: ${e.stack | e}`);
            return [];
        }
    };

    /**
     *  运营留存报表
     * @param agentNum
     * @param gold
     */
    async getOperationalRetention(agentName: string, startTime :string, endTime : string  ): Promise<any> {
        try {
            let startTimeDate = moment(startTime).format("YYYY-MM-DD 00:00:00");
            let endTimeDate = moment(endTime).format("YYYY-MM-DD 23:59:59");
            if(startTimeDate > endTimeDate){
                return Promise.reject("时间范围选择错误");
            }
            //获取总的码量和抽水
            const result_all = await OperationalRetentionMysqlDao.getOperationalRetentionList_AgentName(agentName ,startTimeDate ,endTimeDate);
            let list = [];
            if(result_all.length > 0){
                for(let m of result_all){
                    let info = {
                        createDate : m.createDate,
                        agentName : m.agentName,
                        betPlayer : m.betPlayer.length,
                        addPlayer : m.addPlayer.length,
                        AddRmbPlayer : m.AddRmbPlayer.length,
                        allAddRmb : m.allAddRmb,
                        secondNum : m.secondNum,
                        threeNum : m.threeNum,
                        sevenNum : m.sevenNum,
                        fifteenNum : m.fifteenNum,
                    };
                    list.push(info);
                }
            }
            return list ;
        } catch (e) {
            ManagerErrorLogger.error(`获取推广渠道统计: ${e.stack | e}`);
            return [];
        }
    };




    /**
     *  运营留存数据报表报数据求和
     * @param agentNum
     * @param gold
     */
    async getOperationalRetentionSum_Time(agentName: string, startTime :string, endTime : string  ): Promise<any> {
        try {
            let startTimeDate = moment(startTime).format("YYYY-MM-DD 00:00:00");
            let endTimeDate = moment(endTime).format("YYYY-MM-DD 23:59:59");
            if(startTimeDate > endTimeDate){
                return Promise.reject("时间范围选择错误");
            }
            //获取总的码量和抽水
            let info = {
                startTime : startTime,
                endTime : endTime,
                agentName : agentName,
                betPlayer : 0,
                addPlayer : 0,
                AddRmbPlayer : 0,
                allAddRmb : 0,
                secondNum : 0,
                threeNum : 0,
                sevenNum : 0,
                fifteenNum : 0,
            };
            let num = 0;
            const result_all = await OperationalRetentionMysqlDao.getOperationalRetentionList_AgentName(agentName ,startTimeDate ,endTimeDate);
            if(result_all.length > 0){
                for(let m of result_all){
                    // let info = {
                    //     createDate : m.createDate,
                    //     agentName : m.agentName,
                    //     betPlayer : m.betPlayer.length,
                    //     addPlayer : m.addPlayer.length,
                    //     AddRmbPlayer : m.AddRmbPlayer.length,
                    //     allAddRmb : m.allAddRmb,
                    //     secondNum : m.secondNum,
                    //     threeNum : m.threeNum,
                    //     sevenNum : m.sevenNum,
                    //     fifteenNum : m.fifteenNum,
                    // };
                    num += 1;
                    info.betPlayer += m.betPlayer.length;
                    info.addPlayer += m.addPlayer.length;
                    info.AddRmbPlayer += m.AddRmbPlayer.length;
                    info.allAddRmb += m.allAddRmb;
                    info.secondNum += m.secondNum;
                    info.threeNum += m.threeNum;
                    info.sevenNum += m.sevenNum;
                    info.fifteenNum += m.fifteenNum;
                }
            }

            if(num == 0){
                return  info;
            }

            info.betPlayer = Math.floor( info.betPlayer / 3);
            info.addPlayer = Math.floor( info.addPlayer / 3);
            info.AddRmbPlayer = Math.floor( info.AddRmbPlayer / 3);
            info.allAddRmb = Math.floor( info.allAddRmb / 3);
            info.secondNum = Math.floor( info.secondNum / 3);
            info.threeNum = Math.floor( info.threeNum / 3);
            info.sevenNum = Math.floor( info.sevenNum / 3);
            info.fifteenNum = Math.floor( info.fifteenNum / 3);

            return info ;
        } catch (e) {
            ManagerErrorLogger.error(`获取推广渠道统计: ${e.stack | e}`);
            return null;
        }
    };





}


