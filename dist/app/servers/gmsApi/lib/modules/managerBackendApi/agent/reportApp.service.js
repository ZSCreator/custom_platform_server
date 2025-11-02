"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportAppService = void 0;
const common_1 = require("@nestjs/common");
const pinus_logger_1 = require("pinus-logger");
const Player_manager_1 = require("../../../../../../common/dao/daoManager/Player.manager");
const mallService_1 = require("../../../../../../services/hall/mallHandler/mallService");
const PlayerCashRecord_mysql_dao_1 = require("../../../../../../common/dao/mysql/PlayerCashRecord.mysql.dao");
const PromotionReportApp_mysql_dao_1 = require("../../../../../../common/dao/mysql/PromotionReportApp.mysql.dao");
const GameRecord_mysql_dao_1 = require("../../../../../../common/dao/mysql/GameRecord.mysql.dao");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
const PayInfo_mysql_dao_1 = require("../../../../../../common/dao/mysql/PayInfo.mysql.dao");
const PlatformNameAgentList_redis_dao_1 = require("../../../../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const OperationalRetention_mysql_dao_1 = require("../../../../../../common/dao/mysql/OperationalRetention.mysql.dao");
const moment = require("moment");
let ReportAppService = class ReportAppService {
    constructor() {
        this.mallService = new mallService_1.default();
    }
    async platformStatistics(managerAgent) {
        try {
            let startTime = moment().format("YYYY-MM-DD 00:00:00");
            let endTime = moment().add(1, 'day').format("YYYY-MM-DD 00:00:00");
            let tableTime = moment().format("YYYYMM");
            const result_player = await Player_manager_1.default.todayAddPlayer_groupRemark(managerAgent, startTime, endTime);
            const result_pay = await PayInfo_mysql_dao_1.default.todayAddTotal_fee_groupRemark(managerAgent, startTime, endTime);
            const result_tixian = await PlayerCashRecord_mysql_dao_1.default.todayAddTixian_groupRemark(managerAgent, startTime, endTime);
            const platformUid = await PlatformNameAgentList_redis_dao_1.default.findPlatformUid({ platformName: managerAgent });
            const tableName = `Sp_GameRecord_${platformUid}_${tableTime}`;
            const result_flow = await GameRecord_mysql_dao_1.default.getPlatformData(tableName, startTime, endTime);
            const result_all = await PromotionReportApp_mysql_dao_1.default.getPromotionReportApp(managerAgent);
            const platformList = await PlatformNameAgentList_redis_dao_1.default.findOne({ platformName: managerAgent });
            let list = [];
            for (let m of platformList) {
                let info = {
                    agentUid: null,
                    agentName: m,
                    platformName: managerAgent,
                    todayPlayer: 0,
                    todayAddRmb: 0,
                    todayTixian: 0,
                    todayFlow: 0,
                    todayCommission: 0,
                    allAddRmb: 0,
                    allTixian: 0,
                    allPlayer: 0,
                };
                let item_player = result_player.find(x => x.agentName == m);
                if (item_player) {
                    info.todayPlayer = parseInt(item_player.todayPlayer);
                }
                let item_pay = result_pay.find(x => x.agentName == m);
                if (item_pay) {
                    info.todayAddRmb = parseInt(item_pay.todayAddRmb);
                }
                let item_tixian = result_tixian.find(x => x.agentName == m);
                if (item_tixian) {
                    info.todayTixian = parseInt(item_tixian.todayTixian);
                }
                let item_flow = result_flow.find(x => x.groupRemark == m);
                if (item_flow) {
                    info.todayFlow = parseInt(item_flow.validBetTotal);
                    info.agentUid = item_flow.uid;
                    info.todayCommission = parseInt(item_flow.bet_commissionTotal) + parseInt(item_flow.win_commissionTotal) + parseInt(item_flow.settle_commissionTotal);
                }
                if (result_all.length > 0) {
                    const item = result_all.find(x => x.agentName == m);
                    if (item) {
                        info.allPlayer = item.todayPlayer + info.todayPlayer;
                        info.allAddRmb = item.todayAddRmb + info.todayAddRmb;
                        info.allTixian = item.todayTixian + info.todayTixian;
                        info.agentUid = item.agentUid;
                        info.todayCommission += item.todayCommission + info.todayCommission;
                    }
                }
                list.push(info);
            }
            return list;
        }
        catch (e) {
            ManagerErrorLogger.error(`获取推广渠道统计: ${e.stack | e}`, e);
            return { list: [] };
        }
    }
    ;
    async agentStatistics(agentName, startTime, endTime) {
        try {
            let startTimeDate = moment(startTime).format("YYYY-MM-DD 00:00:00");
            let endTimeDate = moment(endTime).format("YYYY-MM-DD 23:59:59");
            if (startTimeDate > endTimeDate) {
                return Promise.reject("时间范围选择错误");
            }
            const result_all = await PromotionReportApp_mysql_dao_1.default.getPromotionReportApp_Agent(agentName, startTimeDate, endTimeDate);
            return result_all;
        }
        catch (e) {
            ManagerErrorLogger.error(`获取推广渠道统计: ${e.stack | e}`);
            return [];
        }
    }
    ;
    async getOperationalRetention(agentName, startTime, endTime) {
        try {
            let startTimeDate = moment(startTime).format("YYYY-MM-DD 00:00:00");
            let endTimeDate = moment(endTime).format("YYYY-MM-DD 23:59:59");
            if (startTimeDate > endTimeDate) {
                return Promise.reject("时间范围选择错误");
            }
            const result_all = await OperationalRetention_mysql_dao_1.default.getOperationalRetentionList_AgentName(agentName, startTimeDate, endTimeDate);
            let list = [];
            if (result_all.length > 0) {
                for (let m of result_all) {
                    let info = {
                        createDate: m.createDate,
                        agentName: m.agentName,
                        betPlayer: m.betPlayer.length,
                        addPlayer: m.addPlayer.length,
                        AddRmbPlayer: m.AddRmbPlayer.length,
                        allAddRmb: m.allAddRmb,
                        secondNum: m.secondNum,
                        threeNum: m.threeNum,
                        sevenNum: m.sevenNum,
                        fifteenNum: m.fifteenNum,
                    };
                    list.push(info);
                }
            }
            return list;
        }
        catch (e) {
            ManagerErrorLogger.error(`获取推广渠道统计: ${e.stack | e}`);
            return [];
        }
    }
    ;
    async getOperationalRetentionSum_Time(agentName, startTime, endTime) {
        try {
            let startTimeDate = moment(startTime).format("YYYY-MM-DD 00:00:00");
            let endTimeDate = moment(endTime).format("YYYY-MM-DD 23:59:59");
            if (startTimeDate > endTimeDate) {
                return Promise.reject("时间范围选择错误");
            }
            let info = {
                startTime: startTime,
                endTime: endTime,
                agentName: agentName,
                betPlayer: 0,
                addPlayer: 0,
                AddRmbPlayer: 0,
                allAddRmb: 0,
                secondNum: 0,
                threeNum: 0,
                sevenNum: 0,
                fifteenNum: 0,
            };
            let num = 0;
            const result_all = await OperationalRetention_mysql_dao_1.default.getOperationalRetentionList_AgentName(agentName, startTimeDate, endTimeDate);
            if (result_all.length > 0) {
                for (let m of result_all) {
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
            if (num == 0) {
                return info;
            }
            info.betPlayer = Math.floor(info.betPlayer / 3);
            info.addPlayer = Math.floor(info.addPlayer / 3);
            info.AddRmbPlayer = Math.floor(info.AddRmbPlayer / 3);
            info.allAddRmb = Math.floor(info.allAddRmb / 3);
            info.secondNum = Math.floor(info.secondNum / 3);
            info.threeNum = Math.floor(info.threeNum / 3);
            info.sevenNum = Math.floor(info.sevenNum / 3);
            info.fifteenNum = Math.floor(info.fifteenNum / 3);
            return info;
        }
        catch (e) {
            ManagerErrorLogger.error(`获取推广渠道统计: ${e.stack | e}`);
            return null;
        }
    }
    ;
};
ReportAppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ReportAppService);
exports.ReportAppService = ReportAppService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0QXBwLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvYWdlbnQvcmVwb3J0QXBwLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTZDO0FBQzdDLCtDQUF5QztBQUN6QywyRkFBc0Y7QUFDdEYseUZBQWtGO0FBQ2xGLDhHQUFxRztBQUNyRyxrSEFBeUc7QUFDekcsa0dBQXlGO0FBQ3pGLE1BQU8sa0JBQWtCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMxRCw0RkFBbUY7QUFDbkYsd0hBQStHO0FBQy9HLHNIQUE2RztBQUM3RyxpQ0FBaUM7QUFPakMsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBZ0I7SUFHekI7UUFDSSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUkscUJBQVcsRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFPRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsWUFBb0I7UUFDekMsSUFBSTtZQUVBLElBQUksU0FBUyxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3ZELElBQUksT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDbEUsSUFBSSxTQUFTLEdBQUksTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sYUFBYSxHQUFHLE1BQU0sd0JBQWdCLENBQUMsMEJBQTBCLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRyxPQUFPLENBQUMsQ0FBQztZQUkzRyxNQUFNLFVBQVUsR0FBRyxNQUFNLDJCQUFlLENBQUMs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