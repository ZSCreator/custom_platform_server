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
exports.PlayerController = void 0;
const common_1 = require("@nestjs/common");
const player_service_1 = require("./player.service");
const pinus_logger_1 = require("pinus-logger");
const token_guard_1 = require("../../main/token.guard");
let PlayerController = class PlayerController {
    constructor(PlayerService) {
        this.PlayerService = PlayerService;
        this.logger = (0, pinus_logger_1.getLogger)('thirdHttp', __filename);
    }
    async getPlayers(str) {
        console.log("getPlayers", str);
        try {
            const page = Number(str.page);
            const pageSize = Number(str.pageSize);
            const uid = str.uid;
            const thirdUid = str.thirdUid;
            const ip = str.ip;
            if (uid || thirdUid || ip) {
                const result = await this.PlayerService.queryPlayer(uid, thirdUid, ip);
                return result;
            }
            else {
                const result = await this.PlayerService.getPlayers(page, pageSize);
                return result;
            }
        }
        catch (error) {
            this.logger.error(`获取玩家列表 :${error}`);
            return { code: 500, error };
        }
    }
    async getOnePlayerMessage(str) {
        console.log("getOnePlayerMessage", str);
        try {
            const uid = str.uid;
            const result = await this.PlayerService.getOnePlayerMessage(uid);
            return result;
        }
        catch (error) {
            this.logger.error(`获取玩家的基础信息 :${error}`);
            return { code: 500, error };
        }
    }
    async changePlayerPassWord(str) {
        console.log("changePlayerPassWord", str);
        try {
            const param = str;
            const uid = param.uid;
            const passWord = param.passWord;
            const result = await this.PlayerService.changePlayerPassWord(uid, passWord);
            return result;
        }
        catch (error) {
            this.logger.error(`修改玩家密码 :${error}`);
            return { code: 500, error };
        }
    }
    async closeTimeAndReason(str) {
        console.log("closeTimeAndReason", str);
        try {
            const param = str;
            const uid = param.uid;
            const closeReason = param.closeReason;
            const closeTime = param.closeTime;
            const result = await this.PlayerService.closeTimeAndReason(uid, closeReason, closeTime);
            return result;
        }
        catch (error) {
            this.logger.error(`封禁玩家的分钟数以及封禁原因 :${error}`);
            return { code: 500, error };
        }
    }
    async changePlayerPosition(str) {
        console.log("changePlayerPosition", str);
        try {
            const uid = str.uid;
            await this.PlayerService.changePlayerPosition(uid);
            return { code: 200, msg: '修正成功' };
        }
        catch (error) {
            this.logger.error(`如果玩家不在线了，将玩家身上的 position 的位置进行修正 :${error}`);
            return { code: 500, error };
        }
    }
    async deleteOnlinePlayer(str) {
        console.log("deleteOnlinePlayer", str);
        try {
            const uid = str.uid;
            await this.PlayerService.deleteOnlinePlayer(uid);
            return { code: 200, msg: '删除成功' };
        }
        catch (error) {
            this.logger.error(`如果玩家不在线了，将玩家身上的 position 的位置进行修正 :${error}`);
            return { code: 500, error };
        }
    }
    async getPlayerGameRecordForUidAndGroupId(str) {
        console.log("getPlayerGameRecordForUidAndGroupId", str);
        try {
            let { uid, group_id, page } = str;
            if (!uid) {
                return { code: 500, msg: '缺少参数uid 和 group_id' };
            }
            if (!page) {
                page = 1;
            }
            const { list, count } = await this.PlayerService.getPlayerGameRecordForUidAndGroupId(uid, group_id, page);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`如果玩家不在线了，将玩家身上的 position 的位置进行修正 :${error}`);
            return { code: 500, error };
        }
    }
    async kickOnePlayer(str) {
        console.log("kickOnePlayer", str);
        try {
            let { uid } = str;
            if (!uid) {
                return { code: 500, msg: '缺少参数uid' };
            }
            await this.PlayerService.kickOnePlayer(uid);
            return { code: 200 };
        }
        catch (error) {
            this.logger.error(`踢掉单个玩家 :${error}`);
            return { code: 500, error };
        }
    }
    async kickOneGamePlayers(str) {
        console.log("kickOnePlayer", str);
        try {
            let { nid } = str;
            if (!nid) {
                return { code: 500, msg: '缺少参数nid' };
            }
            await this.PlayerService.kickOneGamePlayers(nid);
            return { code: 200 };
        }
        catch (error) {
            this.logger.error(`根据某个游戏踢掉该游戏的所有玩家 :${error}`);
            return { code: 500, error };
        }
    }
    async managerPlayerFengkong(str) {
        try {
            const { uid, thirdUid, ip, nidList, dayProfit, maxBetGold, page, addRmb, pageSize, platformUid, } = str;
            if (uid || thirdUid) {
                const result = await this.PlayerService.managerFentkongForSinglePlayer(uid, thirdUid);
                return Object.assign({ code: 200 }, result);
            }
            else {
                const result = await this.PlayerService.managerPlayerFengkongForPlayerList(platformUid, nidList, ip, dayProfit, maxBetGold, addRmb, page, pageSize);
                return Object.assign({ code: 200 }, result);
            }
        }
        catch (error) {
            this.logger.error(`平台给平台代理添加金币 :${error}`);
            return { code: 500, error: error };
        }
    }
};
__decorate([
    (0, common_1.Post)('getPlayers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayers", null);
__decorate([
    (0, common_1.Post)('getOnePlayerMessage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getOnePlayerMessage", null);
__decorate([
    (0, common_1.Post)('changePlayerPassWord'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "changePlayerPassWord", null);
__decorate([
    (0, common_1.Post)('closeTimeAndReason'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "closeTimeAndReason", null);
__decorate([
    (0, common_1.Post)('changePlayerPosition'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "changePlayerPosition", null);
__decorate([
    (0, common_1.Post)('deleteOnlinePlayer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "deleteOnlinePlayer", null);
__decorate([
    (0, common_1.Post)('getPlayerGameRecordForUidAndGroupId'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayerGameRecordForUidAndGroupId", null);
__decorate([
    (0, common_1.Post)('kickOnePlayer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "kickOnePlayer", null);
__decorate([
    (0, common_1.Post)('kickOneGamePlayers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "kickOneGamePlayers", null);
__decorate([
    (0, common_1.Post)('managerPlayerFengkong'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "managerPlayerFengkong", null);
PlayerController = __decorate([
    (0, common_1.Controller)('player'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [player_service_1.PlayerService])
], PlayerController);
exports.PlayerController = PlayerController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGxheWVyL3BsYXllci5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUF3RTtBQUN4RSxxREFBaUQ7QUFDakQsK0NBQXlDO0FBQ3pDLHdEQUFvRDtBQU9wRCxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQUV6QixZQUE2QixhQUE0QjtRQUE1QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUNyRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQU9ELEtBQUssQ0FBQyxVQUFVLENBQVMsR0FBUTtRQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUM5QixJQUFJO1lBRUEsTUFBTSxJQUFJLEdBQVcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxNQUFNLFFBQVEsR0FBVyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sR0FBRyxHQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFDNUIsTUFBTSxRQUFRLEdBQVcsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUN0QyxNQUFNLEVBQUUsR0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFCLElBQUcsR0FBRyxJQUFJLFFBQVEsSUFBSSxFQUFFLEVBQUM7Z0JBQ3JCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRyxFQUFFLENBQUMsQ0FBQztnQkFDeEUsT0FBTyxNQUFNLENB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