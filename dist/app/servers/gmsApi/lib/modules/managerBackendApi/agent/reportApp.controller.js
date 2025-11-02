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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportAppController = void 0;
const common_1 = require("@nestjs/common");
const reportApp_service_1 = require("./reportApp.service");
const pinus_logger_1 = require("pinus-logger");
const token_guard_1 = require("../../main/token.guard");
let ReportAppController = class ReportAppController {
    constructor(ReportAppService) {
        this.ReportAppService = ReportAppService;
        this.logger = (0, pinus_logger_1.getLogger)('thirdHttp', __filename);
    }
    async getPlayerCashRecord(str) {
        console.warn("platformStatistics", str);
        try {
            let { managerAgent } = str;
            if (!managerAgent) {
                return { code: 500, error: "请使用平台账号进行查看" };
            }
            const list = await this.ReportAppService.platformStatistics(managerAgent);
            return { code: 200, list };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async agentStatistics(str) {
        console.warn("agentStatistics", str);
        try {
            let { agentName, startTime, endTime } = str;
            if (!agentName) {
                return { code: 500, error: "请选择代理进行查询" };
            }
            const result = await this.ReportAppService.agentStatistics(agentName, startTime, endTime);
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async getOperationalRetention(str) {
        console.warn("getOperationalRetention", str);
        try {
            let { agentName, startTime, endTime } = str;
            if (!agentName) {
                return { code: 500, error: "请选择代理进行查询" };
            }
            const list = await this.ReportAppService.getOperationalRetention(agentName, startTime, endTime);
            return { code: 200, list: list };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async getOperationalRetentionSum_Time(str) {
        console.warn("getOperationalRetentionSum_Time", str);
        try {
            let { agentName, startTime, endTime } = str;
            if (!agentName) {
                return { code: 500, error: "请选择代理进行查询" };
            }
            const result = await this.ReportAppService.getOperationalRetentionSum_Time(agentName, startTime, endTime);
            if (result) {
                return { code: 200, result };
            }
            return { code: 200, result: null };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
};
__decorate([
    (0, common_1.Post)('platformStatistics'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportAppController.prototype, "getPlayerCashRecord", null);
__decorate([
    (0, common_1.Post)('agentStatistics'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportAppController.prototype, "agentStatistics", null);
__decorate([
    (0, common_1.Post)('getOperationalRetention'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportAppController.prototype, "getOperationalRetention", null);
__decorate([
    (0, common_1.Post)('getOperationalRetentionSum_Time'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportAppController.prototype, "getOperationalRetentionSum_Time", null);
ReportAppController = __decorate([
    (0, common_1.Controller)('reportApp'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [reportApp_service_1.ReportAppService])
], ReportAppController);
exports.ReportAppController = ReportAppController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0QXBwLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvYWdlbnQvcmVwb3J0QXBwLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQW1FO0FBQ25FLDJEQUF1RDtBQUN2RCwrQ0FBeUM7QUFDekMsd0RBQW9EO0FBT3BELElBQWEsbUJBQW1CLEdBQWhDLE1BQWEsbUJBQW1CO0lBRTVCLFlBQTZCLGdCQUFrQztRQUFsQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQzNELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBT0QsS0FBSyxDQUFDLG1CQUFtQixDQUFTLEdBQVE7UUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN2QyxJQUFJO1lBQ0EsSUFBSyxFQUFFLFlBQVksRUFBRSxHQUFHLEdBQUcsQ0FBRTtZQUM3QixJQUFHLENBQUMsWUFBWSxFQUFDO2dCQUNiLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBQyxhQUFhLEVBQUUsQ0FBQTthQUM1QztZQUNELE1BQU0sSUFBSSxHQUFLLE1BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBRSxDQUFBO1lBQzdFLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxDQUFDO1NBQzlCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEMsT0FBTyxFQUFFLElBQUksRUFBRSxH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