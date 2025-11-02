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
exports.ThirdController = void 0;
const common_1 = require("@nestjs/common");
const third_service_1 = require("../service/third.service");
const Utils = require("../../../../../utils/index");
const MiddlewareEnum = require("../../const/middlewareEnum");
const pinus_1 = require("pinus");
const changePlayerMoney_redis_dao_1 = require("../../../../../common/dao/redis/changePlayerMoney.redis.dao");
(0, pinus_1.configure)({
    appenders: {
        "console": {
            "type": "console"
        },
        "thirdHttp": {
            "type": "dateFile",
            "filename": "/data/logs/thirdHttp",
            "layout": {
                "type": "pattern",
                "pattern": "|%d|%p|%c|%m|"
            },
            "alwaysIncludePattern": true,
            "pattern": "_yyyy-MM-dd.log"
        },
        "thirdHttp_call": {
            "type": "dateFile",
            "filename": "/data/logs/thirdHttp_call",
            "layout": {
                "type": "pattern",
                "pattern": "|%d|%p|%c|%m|"
            },
            "alwaysIncludePattern": true,
            "pattern": "_yyyy-MM-dd.log"
        },
        "thirdHttp_game_record": {
            "type": "dateFile",
            "filename": "/data/logs/thirdHttp_game_record",
            "layout": {
                "type": "pattern",
                "pattern": "|%d|%p|%c|%m|"
            },
            "alwaysIncludePattern": true,
            "pattern": "_yyyy-MM-dd.log"
        },
    },
    categories: {
        "default": {
            "appenders": [
                "console",
            ],
            "level": "warn",
            "enableCallStack": true
        },
        thirdHttp: {
            "appenders": [
                "console",
                "thirdHttp"
            ],
            "level": "warn",
            "enableCallStack": true
        },
        thirdHttp_call: {
            "appenders": [
                "console",
                "thirdHttp_call"
            ],
            "level": "warn",
            "enableCallStack": true
        },
        thirdHttp_game_record: {
            "appenders": [
                "console",
                "thirdHttp_game_record"
            ],
            "level": "warn",
            "enableCallStack": true
        }
    },
});
let ThirdController = class ThirdController {
    constructor(thirdService) {
        this.thirdService = thirdService;
        this.logger = (0, pinus_1.getLogger)('thirdHttp');
        this.thirdHttp_call = (0, pinus_1.getLogger)('thirdHttp_call');
    }
    async login(str) {
        const param = str.param;
        const money = Number(param.money);
        const account = param.account;
        const KindId = String(param.KindID);
        const agent = str.agent;
        const language = param.language;
        const lineCode = param.lineCode;
        const loginHall = param.loginHall === 'true';
        const backHall = param.backHall === 'true';
        const timestamp = Number(str.timestamp);
        this.thirdHttp_call.warn(`玩家登陆 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},站点:${lineCode}语言:${language} loginHall:${loginHall},KindId:${KindId}`);
        try {
            if (!KindId) {
                return { s: 100, m: "/login", d: { code: MiddlewareEnum.KINDID_NOT_EXIST.status } };
            }
            if (!account) {
                return { s: 100, m: "/login", d: { code: MiddlewareEnum.ACCOUNT_LOSE.status } };
            }
            const result = await this.thirdService.login(agent, money, account, KindId, language, lineCode, loginHall, backHall);
            this.thirdHttp_call.warn(`玩家登陆返回 :account${account},时间:${Utils.cDate(timestamp)}, url:${result.d.url}`);
            return result;
        }
        catch (error) {
            this.logger.error(`玩家登陆 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 100, m: "/login", d: { code: status } };
        }
    }
    async checkPlayerMoney(str) {
        try {
            const param = str.param;
            const agent = str.agent;
            const account = String(param.account);
            this.thirdHttp_call.warn(`查询玩家可上下分:account: ${account},时间:${Utils.cDate()},代理:${agent}`);
            if (!account) {
                return { s: 101, m: "/checkPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_LOSE.status } };
            }
            const result = await this.thirdService.checkPlayerMoney(account, agent);
            return result;
        }
        catch (error) {
            this.logger.error(`查询玩家可上下分 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 101, m: "/checkPlayerMoney", d: { code: status } };
        }
    }
    async addPlayerMoney(str) {
        const param = str.param;
        const agent = str.agent;
        const timestamp = Number(str.timestamp);
        const account = param.account;
        const money = Number(param.money);
        const orderid = param.orderid;
        this.thirdHttp_call.warn(`第三方请求给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},money:${money}`);
        try {
            if (!agent || !account) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_LOSE.msg} | 上分异常 | 参数不全`);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_LOSE.status } };
            }
            if (!orderid) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_NOT_EXIST.msg} | 上分异常 | orderId已存在`);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status } };
            }
            if (typeof money !== 'number' || isNaN(money) || money <= 0) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_RULE_ERROR.msg} | 上分异常 | 上分金币不正确`);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.ORDERID_RULE_ERROR.status } };
            }
            const changeExists = await changePlayerMoney_redis_dao_1.default.changePlayerMoneySAdd(agent, account);
            if (!changeExists) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_RULE_ERROR.msg} | 上分异常 | 上下分正在处理中`);
                return { s: 102, m: "/addPlayerMoney", d: { code: MiddlewareEnum.UP_DOWN_MONEY_ERROR.status } };
            }
            const result = await this.thirdService.addPlayerMoney(account, money, agent, orderid, timestamp);
            this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag last`);
            return result;
        }
        catch (error) {
            this.logger.error(`给玩家上分 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 102, m: "/addPlayerMoney", d: { code: status } };
        }
    }
    async lowerPlayerMoney(str) {
        const param = str.param;
        const agent = str.agent;
        const timestamp = Number(str.timestamp);
        let { account, money, orderid } = param;
        this.thirdHttp_call.warn(`第三方请求玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},money:${money}`);
        try {
            if (!agent || !account) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_PLAYING.msg} | 下分异常 | 参数不全`);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ACCOUNT_LOSE.status } };
            }
            if (!orderid) {
                this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ACCOUNT_PLAYING.msg} | 下分异常 | 未有orderId`);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status } };
            }
            const changeExists = await changePlayerMoney_redis_dao_1.default.changePlayerMoneySAdd(agent, account);
            if (!changeExists) {
                this.thirdHttp_call.warn(`发送第三方给玩家上分 :account: ${account},时间:${Utils.cDate(timestamp)},代理:${agent},异常情况:${MiddlewareEnum.ORDERID_RULE_ERROR.msg} | 下分异常 | 下分未处理完`);
                return { s: 103, m: "/lowerPlayerMoney", d: { code: MiddlewareEnum.UP_DOWN_MONEY_ERROR.status } };
            }
            if (money) {
                money = -Number(money);
            }
            else {
                money = null;
            }
            const result = await this.thirdService.lowerPlayerMoney(account, money, agent, orderid, timestamp);
            this.thirdHttp_call.warn(`发送第三方给玩家下分 :account: ${account},时间:${Utils.cDate(Date.now())},代理:${agent} tag last`);
            return result;
        }
        catch (error) {
            this.logger.error(`给玩家下分 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 103, m: "/lowerPlayerMoney", d: { code: status } };
        }
    }
    async queryOrderId(str) {
        try {
            const param = str.param;
            const orderid = String(param.orderid);
            if (!orderid) {
                return { s: 104, m: "/queryOrderId", d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status } };
            }
            const result = await this.thirdService.queryOrderId(orderid);
            return result;
        }
        catch (error) {
            this.logger.error(`检查订单号 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ORDERID_NOT_EXIST.status;
            return { s: 104, m: "/queryOrderId", d: { code: status } };
        }
    }
    async findPlayerOnline(str) {
        try {
            const param = str.param;
            const account = param.account;
            const agent = str.agent;
            const timestamp = Number(param.timestamp);
            const result = await this.thirdService.findPlayerOnline(agent, account, timestamp);
            return result;
        }
        catch (error) {
            this.logger.error(`查询玩家在线状态 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 105, m: "/findPlayerOnline", d: { code: status, status: MiddlewareEnum.ACCOUNT_OLINE_ERROR.status } };
        }
    }
    async queryPlayerGold(str) {
        try {
            const param = str.param;
            const account = param.account;
            const agent = str.agent;
            const timestamp = Number(param.timestamp);
            const result = await this.thirdService.queryPlayerGold(agent, account, timestamp);
            return result;
        }
        catch (error) {
            this.logger.error(`查询玩家总分 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 106, m: "/queryPlayerGold", d: { code: status, status: MiddlewareEnum.ACCOUNT_GET_LOSE.status } };
        }
    }
    async kickPlayer(str) {
        try {
            const param = str.param;
            const account = param.account;
            const agent = str.agent;
            const timestamp = Number(param.timestamp);
            const result = await this.thirdService.kickPlayer(agent, account, timestamp);
            return result;
        }
        catch (error) {
            this.logger.error(`踢玩家下线 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.ACCOUNT_GET_LOSE.status;
            return { s: 107, m: "/queryPlayerGold", d: { code: status, status: MiddlewareEnum.ACCOUNT_OLINE_ERROR.status } };
        }
    }
    async getPlatformData(str) {
        let hadAdded = false;
        try {
            const param = str.param;
            const agent = str.agent;
            if (!agent || !param || !param.startTime || !param.endTime) {
                return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.VALIDATION_ERROR.status, status: MiddlewareEnum.VALIDATION_ERROR.msg } };
            }
            const startTime = Number(param.startTime);
            const endTime = Number(param.endTime);
            if (typeof startTime !== 'number' || typeof endTime !== 'number' || startTime <= 0 || endTime <= 0 || (endTime - startTime) <= 0) {
                return { s: 108, m: "/getPlatformData", d: { code: MiddlewareEnum.GAME_LIMIT_ERROR.status, status: MiddlewareEnum.GAME_LIMIT_ERROR.msg } };
            }
            hadAdded = true;
            const result = await this.thirdService.getPlatformData(agent, startTime, endTime);
            console.log("getPlatformData", agent, '拉单成功');
            return result;
        }
        catch (error) {
            this.logger.error(`拉取游戏记录 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.DATA_NOT_EXIST.status;
            return { s: 108, m: "/getPlatformData", d: { code: status, status: MiddlewareEnum.LA_DAN_LOSE.status } };
        }
    }
};
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('checkPlayerMoney'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "checkPlayerMoney", null);
__decorate([
    (0, common_1.Post)('addPlayerMoney'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "addPlayerMoney", null);
__decorate([
    (0, common_1.Post)('lowerPlayerMoney'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "lowerPlayerMoney", null);
__decorate([
    (0, common_1.Post)('queryOrderId'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "queryOrderId", null);
__decorate([
    (0, common_1.Post)('findPlayerOnline'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "findPlayerOnline", null);
__decorate([
    (0, common_1.Post)('queryPlayerGold'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "queryPlayerGold", null);
__decorate([
    (0, common_1.Post)('kickPlayer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "kickPlayer", null);
__decorate([
    (0, common_1.Post)('getPlatformData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "getPlatformData", null);
ThirdController = __decorate([
    (0, common_1.Controller)('third'),
    __metadata("design:paramtypes", [third_service_1.ThirdService])
], ThirdController);
exports.ThirdController = ThirdController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhpcmQuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL25lc3RIdHRwL2xpYi90aGlyZC9jb250cm9sbGVyL3RoaXJkLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQXdEO0FBQ3hELDREQUF3RDtBQUN4RCxvREFBcUQ7QUFDckQsNkRBQThEO0FBQzlELGlDQUFtRDtBQUNuRCw2R0FBb0c7QUFDcEcsSUFBQSxpQkFBUyxFQUFDO0lBQ04sU0FBUyxFQUFFO1FBQ1AsU0FBUyxFQUFFO1lBQ1AsTUFBTSxFQUFFLFNBQVM7U0FDcEI7UUFDRCxXQUFXLEVBQUU7WUFDVCxNQUFNLEVBQUUsVUFBVTtZQUNsQixVQUFVLEVBQUUsc0JBQXNCO1lBQ2xDLFFBQVEsRUFBRTtnQkFDTixNQUFNLEVBQUUsU0FBUztnQkFDakIsU0FBUyxFQUFFLGVBQWU7YUFDN0I7WUFDRCxzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLFNBQVMsRUFBRSxpQkFBaUI7U0FDL0I7UUFDRCxnQkFBZ0IsRUFBRTtZQUNkLE1BQU0sRUFBRSxVQUFVO1lBQ2xCLFVBQVUsRUFBRSwyQkFBMkI7WUFDdkMsUUFBUSxFQUFFO2dCQUNOLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixTQUFTLEVBQUUsZUFBZTthQUM3QjtZQUNELHNCQUFzQixFQUFFLElBQUk7WUFDNUIsU0FBUyxFQUFFLGlCQUFpQjtTQUMvQjtRQUNELHVCQUF1QixFQUFFO1lBQ3JCLE1BQU0sRUFBRSxVQUFVO1lBQ2xCLFVBQVUsRUFBRSxrQ0FBa0M7WUFDOUMsUUFBUSxFQUFFO2dCQUNOLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixTQUFTLEVBQUUsZUFBZTthQUM3QjtZQUNELHNCQUFzQixFQUFFLElBQUk7WUFDNUIsU0FBUyxFQUFFLGlCQUFpQjtTQUMvQjtLQUNKO0lBQ0QsVUFBVSxFQUFFO1FBQ1Is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