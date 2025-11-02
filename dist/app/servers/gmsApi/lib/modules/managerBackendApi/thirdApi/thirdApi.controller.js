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
exports.ThirdApiController = void 0;
const common_1 = require("@nestjs/common");
const thirdApi_service_1 = require("./thirdApi.service");
const pinus_logger_1 = require("pinus-logger");
const token_guard_1 = require("../../main/token.guard");
const GmsApiResult_vo_1 = require("../../../const/GmsApiResult.vo");
let ThirdApiController = class ThirdApiController {
    constructor(thirdApiService) {
        this.thirdApiService = thirdApiService;
        this.logger = (0, pinus_logger_1.getLogger)('http', __filename);
    }
    async getGameRecrodApi(str) {
        console.log("getGameRecrodApi", str);
        try {
            let { roundId, startTime, endTime, page, managerAgent, thirdUid, nid, pageSize, gameOrder, rootAgent, managerUid } = str;
            if (!page) {
                page = 1;
            }
            if (!pageSize) {
                pageSize = 100;
            }
            const result = await this.thirdApiService.getGameRecrodApiForMoreTable(managerUid, rootAgent, page, startTime, endTime, managerAgent, thirdUid, nid, pageSize, gameOrder, roundId);
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`第三方 API 的相关功能， 获取游戏记录 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getAgentPlayers(str) {
        console.log("getAgentPlayers", str);
        try {
            let { managerUid, rootAgent, page, managerAgent, thirdUid, pageSize, uid, ip } = str;
            if (!page) {
                page = 1;
            }
            if (uid || thirdUid || ip) {
                const result = await this.thirdApiService.queryPlayer(uid, managerUid, rootAgent, managerAgent, thirdUid, page, pageSize, ip);
                return result;
            }
            else {
                const result = await this.thirdApiService.getAgentPlayers(uid, managerUid, rootAgent, managerAgent, thirdUid, page, pageSize, ip);
                return result;
            }
        }
        catch (error) {
            this.logger.error(`第三方 API 的相关功能， 获取游戏记录 :${error}`);
            return { code: 500, error: error ? error : "获取失败" };
        }
    }
    async getWarnGoldCfg(str) {
        try {
            const data = await this.thirdApiService.getWarnGoldCfg();
            return { code: 200, data };
        }
        catch (error) {
            this.logger.error(`获取第三方上下分警告设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async setWarnGoldCfg(str) {
        try {
            const { warnGoldCfg } = str;
            if (!Array.isArray(warnGoldCfg)) {
                return { code: 500, msg: "应传入数组" };
            }
            const checkResult = warnGoldCfg.every(({ startGold, endGold, targetGold, status }) => typeof startGold === "number" &&
                typeof endGold === "number" &&
                typeof targetGold === "number" &&
                typeof status === "number");
            if (!checkResult) {
                return { code: 500, msg: "数组每项参数应含 startGold endGold targetGold status, 且均为整数类型" };
            }
            await this.thirdApiService.setWarnGoldCfg(warnGoldCfg);
            return { code: 200, msg: "修改成功" };
        }
        catch (error) {
            this.logger.error(`获取第三方上下分警告设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getThirdGoldRecord(str) {
        try {
            let { page, uid, startTime, endTime, pageSize } = str;
            pageSize = pageSize ? pageSize : 20;
            if (!page || !pageSize) {
                return { code: 200, msg: "参数不正确" };
            }
            const result = await this.thirdApiService.getThirdGoldRecord(page, uid, pageSize, startTime, endTime);
            return { code: 200, result };
        }
        catch (error) {
            return { code: 500, error: '获取失败' };
        }
    }
    async setPlayerWarnGold(str) {
        try {
            let { orderId, uid, remark } = str;
            await this.thirdApiService.setPlayerWarnGold(orderId, uid, remark);
            return { code: 200, msg: '操作成功' };
        }
        catch (error) {
            return { code: 500, error: '操作失败' };
        }
    }
    async onlinePlayers(str) {
        try {
            let { page, pageSize } = str;
            page = page ? page : 1;
            const { games, playerList, length } = await this.thirdApiService.onlinePlayers(page, pageSize);
            return { code: 200, games, playerList, length };
        }
        catch (error) {
            return { code: 500, error: '操作失败' };
        }
    }
    async loginPlayers(str) {
        try {
            let { page, pageSize } = str;
            page = page ? page : 1;
            const { playerList, length } = await this.thirdApiService.loginPlayers(page, pageSize);
            return { code: 200, playerList, length };
        }
        catch (error) {
            return { code: 500, error: '操作失败' };
        }
    }
    async createPlayers(str) {
        try {
            let { page, pageSize } = str;
            page = page ? page : 1;
            const { playerList, length } = await this.thirdApiService.createPlayers(page, pageSize);
            return { code: 200, playerList, length };
        }
        catch (error) {
            return { code: 500, error: '操作失败' };
        }
    }
    async agentPlayerGameRecord(str) {
        try {
            let { managerAgent, rootAgent, startTime, endTime, thirdUid, nid } = str;
            const num = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
            if (num > 31) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "时间请不要超过一个月");
            }
            if (!rootAgent || !managerAgent) {
                return { code: 500, error: '后台账号信息不正确，请重新登陆' };
            }
            const total = await this.thirdApiService.agentPlayerGameRecord(managerAgent, rootAgent, startTime, endTime, thirdUid, nid);
            return { code: 200, total };
        }
        catch (error) {
            return { code: 500, error: error ? error : '操作失败' };
        }
    }
};
__decorate([
    (0, common_1.Post)('getGameRecrodApi'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "getGameRecrodApi", null);
__decorate([
    (0, common_1.Post)('getAgentPlayers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "getAgentPlayers", null);
__decorate([
    (0, common_1.Post)('getWarnGoldCfg'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "getWarnGoldCfg", null);
__decorate([
    (0, common_1.Post)('setWarnGoldCfg'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "setWarnGoldCfg", null);
__decorate([
    (0, common_1.Post)('getThirdGoldRecord'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "getThirdGoldRecord", null);
__decorate([
    (0, common_1.Post)('setPlayerWarnGold'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "setPlayerWarnGold", null);
__decorate([
    (0, common_1.Post)('onlinePlayers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "onlinePlayers", null);
__decorate([
    (0, common_1.Post)('loginPlayers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "loginPlayers", null);
__decorate([
    (0, common_1.Post)('createPlayers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "createPlayers", null);
__decorate([
    (0, common_1.Post)('agentPlayerGameRecord'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdApiController.prototype, "agentPlayerGameRecord", null);
ThirdApiController = __decorate([
    (0, common_1.Controller)('thirdApi'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [thirdApi_service_1.ThirdApiService])
], ThirdApiController);
exports.ThirdApiController = ThirdApiController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhpcmRBcGkuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS90aGlyZEFwaS90aGlyZEFwaS5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFxRjtBQUNyRix5REFBcUQ7QUFDckQsK0NBQXlDO0FBQ3pDLHdEQUFvRDtBQUNwRCxvRUFBOEQ7QUFPOUQsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBa0I7SUFHM0IsWUFBNkIsZUFBZ0M7UUFBaEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBQ3pELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBT0QsS0FBSyxDQUFDLGdCQUFnQixDQUFTLEdBQVE7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNwQyxJQUFJO1lBRUEsSUFBSSxFQUFFLE9BQU8sRUFBSSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRyxZQUFZLEVBQUcsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFHLFNBQVMsRUFBRSxVQUFVLEVBQUMsR0FBRyxHQUFHLENBQUM7WUFDN0gsSUFBRyxDQUFDLElBQUksRUFBQztnQkFDTCxJQUFJLEdBQUcsQ0FBQyxDQUFDO2FBQ1o7WUFDRCxJQUFHLENBQUMsUUFBUSxFQUFDO2dCQUNULFFBQVEsR0FBRyxHQUFHLENBQUM7YUFDbEI7WUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsNEJBQTRCLENBQUMsVUFBVSxFQUFHLFNBQVMsRUFBRyxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxZ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