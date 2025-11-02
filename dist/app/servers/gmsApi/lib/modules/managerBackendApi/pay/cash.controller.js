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
exports.CashController = void 0;
const common_1 = require("@nestjs/common");
const cash_service_1 = require("./cash.service");
const pinus_logger_1 = require("pinus-logger");
const token_guard_1 = require("../../main/token.guard");
let CashController = class CashController {
    constructor(CashService) {
        this.CashService = CashService;
        this.logger = (0, pinus_logger_1.getLogger)('thirdHttp', __filename);
    }
    async getPlayerCashRecord(str) {
        console.log("getPlayerCashRecord", str);
        try {
            let { manager, uid, page, pageSize, orderStatus, startTime, endTime } = str;
            page = page ? page : 1;
            const { list, count } = await this.CashService.getPlayerCashRecord(uid, orderStatus, manager, startTime, endTime, page, pageSize);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async setCashRecordForCheck(str) {
        console.log("setCashRecordForCheck", str);
        try {
            let { manager, id, orderStatus, content } = str;
            await this.CashService.setCashRecordForCheck(manager, id, orderStatus, content);
            return { code: 200, msg: "审核成功" };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async getPlayerIsCheckPass(str) {
        console.log("getPlayerIsCheckPass", str);
        try {
            let { manager, uid, cashStatus, page, pageSize, startTime, endTime, } = str;
            const { list, count } = await this.CashService.getPlayerIsCheckPass(manager, uid, cashStatus, page, pageSize, startTime, endTime);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async setCashRecordForCash_DaiFu(str) {
        console.log("setCashRecordForCash_DaiFu", str);
        try {
            let { manager, id, cashStatus } = str;
            if (cashStatus !== 1) {
                return { code: 200, msg: "设置代付参数不对" };
            }
            await this.CashService.setCashRecordForCash_DaiFu(manager, id, cashStatus);
            return { code: 200, msg: "设置成功" };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async setCashRecordForCash(str) {
        console.log("setCashRecordForCash", str);
        try {
            let { manager, id, cashStatus } = str;
            await this.CashService.setCashRecordForCash(manager, id, cashStatus);
            return { code: 200, msg: "设置成功" };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async getAllCashRecord(str) {
        console.log("getAllCashRecord", str);
        try {
            let { uid, cashStatus, orderStatus, page, pageSize, startTime, endTime, orderNo } = str;
            const { list, count } = await this.CashService.getAllCashRecord(uid, orderStatus, cashStatus, page, pageSize, startTime, endTime, orderNo);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async getPlayerBankForUid(str) {
        console.log("getPlayerBankForUid", str);
        try {
            let { uid } = str;
            const { list, count } = await this.CashService.getPlayerBankForUid(uid);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`精准查询玩家银行卡信息 :${error}`);
            return { code: 500, error };
        }
    }
};
__decorate([
    (0, common_1.Post)('getPlayerCashRecord'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "getPlayerCashRecord", null);
__decorate([
    (0, common_1.Post)('setCashRecordForCheck'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "setCashRecordForCheck", null);
__decorate([
    (0, common_1.Post)('getPlayerIsCheckPass'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "getPlayerIsCheckPass", null);
__decorate([
    (0, common_1.Post)('setCashRecordForCash_DaiFu'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "setCashRecordForCash_DaiFu", null);
__decorate([
    (0, common_1.Post)('setCashRecordForCash'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "setCashRecordForCash", null);
__decorate([
    (0, common_1.Post)('getAllCashRecord'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "getAllCashRecord", null);
__decorate([
    (0, common_1.Post)('getPlayerBankForUid'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "getPlayerBankForUid", null);
CashController = __decorate([
    (0, common_1.Controller)('cash'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [cash_service_1.CashService])
], CashController);
exports.CashController = CashController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FzaC5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL21hbmFnZXJCYWNrZW5kQXBpL3BheS9jYXNoLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQXdFO0FBQ3hFLGlEQUE2QztBQUM3QywrQ0FBeUM7QUFDekMsd0RBQW9EO0FBT3BELElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWM7SUFFdkIsWUFBNkIsV0FBd0I7UUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFPRCxLQUFLLENBQUMsbUJBQW1CLENBQVMsR0FBUTtRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZDLElBQUk7WUFDQSxJQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRyxJQUFJLEVBQUcsUUFBUSxFQUFFLFdBQVcsRUFBRyxTQUFTLEVBQUcsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFFO1lBQ2xGLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFO1lBQ3hCLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUssTUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsRUFBRyxXQUFXLEVBQUcsT0FBTyxFQUFFLFNBQVMsRUFBRyxPQUFPLEVBQUUsSUFBSSxFQUFHLFFBQVEsQ0FBQyxDQUFBO1lBQ3hJLE9BQU8sRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRyxLQUFLLEVBQUUsQ0FBQTtTQUNyQztRQUFDLE9B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