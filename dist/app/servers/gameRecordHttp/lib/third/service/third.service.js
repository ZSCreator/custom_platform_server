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
exports.ThirdService = void 0;
const common_1 = require("@nestjs/common");
const GameRecord_mysql_dao_1 = require("../../../../../common/dao/mysql/GameRecord.mysql.dao");
const PlatformNameAgentList_redis_dao_1 = require("../../../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const MiddlewareEnum = require("../../const/middlewareEnum");
const Utils = require("../../../../../utils/index");
const SystemConfig_manager_1 = require("../../../../../common/dao/daoManager/SystemConfig.manager");
const pinus_1 = require("pinus");
let ThirdService = class ThirdService {
    constructor() {
        this.thirdHttp_call = (0, pinus_1.getLogger)('thirdHttp_call');
        this.thirdHttp_game_record_Logger = (0, pinus_1.getLogger)('thirdHttp_game_record');
    }
    async getGameRecord(agent, startTime, endTime) {
        try {
            const num = Math.ceil((endTime - startTime) / (1000 * 60));
            if (num > 31) {
                return { s: 106, m: "/getGameRecord", d: { code: MiddlewareEnum.STATISTICAL_TIME_ERROR.status } };
            }
            const startTimeDate = Utils.cDate(startTime);
            const endTimeDate = Utils.cDate(endTime);
            const platformUid = await PlatformNameAgentList_redis_dao_1.default.findPlatformUidForAgent({ agent: agent });
            if (!platformUid) {
                return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
            }
            const list = await GameRecord_mysql_dao_1.default.findListAll(platformUid, agent, startTimeDate, endTimeDate);
            return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.SUCCESS.status, record: list } };
        }
        catch (error) {
            return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
        }
    }
    async getGameRecordForPlatformName(agent, startTime, endTime) {
        try {
            const num = Math.ceil((endTime - startTime) / (1000 * 60));
            if (num > 16) {
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.STATISTICAL_TIME_ERROR.status } };
            }
            const startTimeDate = Utils.cDate(startTime);
            const endTimeDate = Utils.cDate(endTime);
            const platformUid = await PlatformNameAgentList_redis_dao_1.default.findPlatformUid({ platformName: agent });
            if (!platformUid) {
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
            }
            const list = await GameRecord_mysql_dao_1.default.newPlatformNamefindListAll(platformUid, startTimeDate, endTimeDate);
            return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.SUCCESS.status, record: list } };
        }
        catch (error) {
            return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
        }
    }
    async getGameRecordResult(agent, gameOrder, createTimeDate, groupRemark) {
        try {
            const platformUid = await PlatformNameAgentList_redis_dao_1.default.findPlatformUidForAgent({ agent: agent });
            if (!platformUid) {
                return { s: 111, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.AGENT_ERROR.status } };
            }
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            if (systemConfig && systemConfig.gameResultUrl) {
                let url = systemConfig.gameResultUrl + "?groupRemark=" + groupRemark + "&createTimeDate=" + createTimeDate + "&gameOrder=" + gameOrder;
                return { s: 111, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.SUCCESS.status, url } };
            }
            else {
                return { s: 111, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
            }
        }
        catch (error) {
            return { s: 111, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status } };
        }
    }
};
ThirdService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ThirdService);
exports.ThirdService = ThirdService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhpcmQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dhbWVSZWNvcmRIdHRwL2xpYi90aGlyZC9zZXJ2aWNlL3RoaXJkLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTRDO0FBQzVDLCtGQUFzRjtBQUN0RixxSEFBNEc7QUFDNUcsNkRBQThEO0FBQzlELG9EQUFxRDtBQUNyRCxvR0FBNEY7QUFDNUYsaUNBQXdDO0FBR3hDLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQVk7SUFHckI7UUFDSSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUEsaUJBQVMsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFBLGlCQUFTLEVBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBU0QsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsRUFBRSxPQUFlO1FBQ2pFLElBQUk7WUFFQSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0QsSUFBSSxHQUFHLEdBQUcsRUFBRSxFQUFFO2dCQUNWLE9BQU8sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7YUFDckc7WUFJRCxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFekMsTUFBTSxXQUFX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