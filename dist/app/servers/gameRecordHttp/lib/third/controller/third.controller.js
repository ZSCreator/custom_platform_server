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
const MiddlewareEnum = require("../../const/middlewareEnum");
const pinus_1 = require("pinus");
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
        this.reqMap = new Map();
        this.maxReq = 50;
        this.reqCount = 0;
        this.logger = (0, pinus_1.getLogger)('thirdHttp');
        this.thirdHttp_call = (0, pinus_1.getLogger)('thirdHttp_call');
    }
    async getGameRecord(str) {
        console.log("getGameRecord", str);
        let hadAdded = false;
        try {
            const param = str.param;
            const agent = str.agent;
            if (this.reqCount > this.maxReq) {
                this.logger.error(`拉取游戏记录失败:代理${agent},reqCount : ${this.reqCount} ,maxReq : ${this.maxReq} `);
                return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.LA_DAN_LOSE.status, status: MiddlewareEnum.LA_DAN_LOSE.status } };
            }
            if (!agent || !param || !param.startTime || !param.endTime) {
                return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.VALIDATION_ERROR.status, status: MiddlewareEnum.VALIDATION_ERROR.msg } };
            }
            const startTime = Number(param.startTime);
            const endTime = Number(param.endTime);
            if (typeof startTime !== 'number' || typeof endTime !== 'number' || startTime <= 0 || endTime <= 0 || (endTime - startTime) <= 0) {
                return { s: 109, m: "/getGameRecord", d: { code: MiddlewareEnum.GAME_LIMIT_ERROR.status, status: MiddlewareEnum.GAME_LIMIT_ERROR.msg } };
            }
            this.reqCount++;
            hadAdded = true;
            const result = await this.thirdService.getGameRecord(agent, startTime, endTime);
            this.reqMap.set(agent, Date.now());
            console.log("getGameRecord", agent, '拉单成功');
            return result;
        }
        catch (error) {
            this.logger.error(`拉取游戏记录 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.DATA_NOT_EXIST.status;
            return { s: 109, m: "/getGameRecord", d: { code: status, status: MiddlewareEnum.LA_DAN_LOSE.status } };
        }
        finally {
            if (hadAdded) {
                this.reqCount--;
            }
        }
    }
    async getGameRecordForPlatformName(str) {
        console.log("getGameRecordForPlatformName", str);
        let hadAdded = false;
        try {
            const param = str.param;
            const agent = str.agent;
            if (this.reqCount > 30) {
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.LA_DAN_LOSE.status, status: MiddlewareEnum.LA_DAN_LOSE.status } };
            }
            if (!agent || !param || !param.startTime || !param.endTime) {
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.VALIDATION_ERROR.status, status: MiddlewareEnum.VALIDATION_ERROR.msg } };
            }
            const startTime = Number(param.startTime);
            const endTime = Number(param.endTime);
            if (typeof startTime !== 'number' || typeof endTime !== 'number' || startTime <= 0 || endTime <= 0 || (endTime - startTime) <= 0) {
                return { s: 110, m: "/getGameRecordForPlatformName", d: { code: MiddlewareEnum.GAME_LIMIT_ERROR.status, status: MiddlewareEnum.GAME_LIMIT_ERROR.msg } };
            }
            this.reqCount++;
            hadAdded = true;
            const result = await this.thirdService.getGameRecordForPlatformName(agent, startTime, endTime);
            this.reqMap.set(agent, Date.now());
            console.log("getGameRecordForPlatformName", agent, '拉单成功');
            return result;
        }
        catch (error) {
            this.logger.error(`拉取游戏记录 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.DATA_NOT_EXIST.status;
            return { s: 110, m: "/getGameRecordForPlatformName", d: { code: status, status: MiddlewareEnum.LA_DAN_LOSE.status } };
        }
        finally {
            if (hadAdded) {
                this.reqCount--;
            }
        }
    }
    async getGameRecordResult(str) {
        console.log("getGameRecordResult", str);
        let hadAdded = false;
        try {
            const param = str.param;
            const agent = str.agent;
            if (!agent || !param) {
                return { s: 111, m: "/getGameRecordResult", d: { code: MiddlewareEnum.VALIDATION_ERROR.status, status: MiddlewareEnum.VALIDATION_ERROR.msg } };
            }
            const gameOrder = param.gameOrder;
            const createTimeDate = param.createTimeDate;
            const groupRemark = param.groupRemark;
            if (!gameOrder) {
                return { s: 111, m: "/getGameRecordResult", d: { code: MiddlewareEnum.ORDERID_NOT_EXIST.status, status: MiddlewareEnum.ORDERID_NOT_EXIST.msg } };
            }
            const result = await this.thirdService.getGameRecordResult(agent, gameOrder, createTimeDate, groupRemark);
            return result;
        }
        catch (error) {
            this.logger.error(`拉取游戏记录 :${JSON.stringify(error)}`);
            const status = error ? error : MiddlewareEnum.DATA_NOT_EXIST.status;
            return { s: 111, m: "/getGameRecordResult", d: { code: status, status: MiddlewareEnum.LA_DAN_LOSE.status } };
        }
        finally {
            if (hadAdded) {
                this.reqCount--;
            }
        }
    }
};
__decorate([
    (0, common_1.Post)('getGameRecord'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "getGameRecord", null);
__decorate([
    (0, common_1.Post)('getGameRecordForPlatformName'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "getGameRecordForPlatformName", null);
__decorate([
    (0, common_1.Post)('getGameRecordResult'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThirdController.prototype, "getGameRecordResult", null);
ThirdController = __decorate([
    (0, common_1.Controller)('third'),
    __metadata("design:paramtypes", [third_service_1.ThirdService])
], ThirdController);
exports.ThirdController = ThirdController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhpcmQuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dhbWVSZWNvcmRIdHRwL2xpYi90aGlyZC9jb250cm9sbGVyL3RoaXJkLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTZEO0FBQzdELDREQUF3RDtBQUN4RCw2REFBOEQ7QUFDOUQsaUNBQW1EO0FBRW5ELElBQUEsaUJBQVMsRUFBQztJQUNOLFNBQVMsRUFBRTtRQUNQLFNBQVMsRUFBRTtZQUNQLE1BQU0sRUFBRSxTQUFTO1NBQ3BCO1FBQ0QsV0FBVyxFQUFFO1lBQ1QsTUFBTSxFQUFFLFVBQVU7WUFDbEIsVUFBVSxFQUFFLHNCQUFzQjtZQUNsQyxRQUFRLEVBQUU7Z0JBQ04sTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLFNBQVMsRUFBRSxlQUFlO2FBQzdCO1lBQ0Qsc0JBQXNCLEVBQUUsSUFBSTtZQUM1QixTQUFTLEVBQUUsaUJBQWlCO1NBQy9CO1FBQ0QsZ0JBQWdCLEVBQUU7WUFDZCxNQUFNLEVBQUUsVUFBVTtZQUNsQixVQUFVLEVBQUUsMkJBQTJCO1lBQ3ZDLFFBQVEsRUFBRTtnQkFDTixNQUFNLEVBQUUsU0FBUztnQkFDakIsU0FBUyxFQUFFLGVBQWU7YUFDN0I7WUFDRCxzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLFNBQVMsRUFBRSxpQkFBaUI7U0FDL0I7UUFDRCx1QkFBdUIsRUFBRTtZQUNyQixNQUFNLEVBQUUsVUFBVTtZQUNsQixVQUFVLEVBQUUsa0NBQWtDO1lBQzlDLFFBQVEsRUFBRTtnQkFDTixNQUFNLEVBQUUsU0FBUztnQkFDakIsU0FBUyxFQUFFLGVBQWU7YUFDN0I7WUFDRCxzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLFNBQVMsRUFBRSxpQkFBaUI7U0FDL0I7S0FDSjtJQUNELFVBQVUsRUFBRTtRQUNSLFNBQVMsRUFBRTtZQUNQLFdBQVcsRUFBRTtnQkFDVCxTQUFTO2FBQ1o7WUFDRCxPQUFPLEVBQUUsTUFBTTtZQUNmLGlCQUFpQixFQUFFLElBQUk7U0FDMUI7UUFDRCxTQUFTLEVBQUU7WUFDUCxXQUFXLEVBQUU7Z0JBQ1QsU0FBUztnQkFDVCxXQUFXO2FBQ2Q7WUFDRCxPQUFPLEVBQUUsTUFBTTtZQUNmLGlCQUFpQixFQUFFLElBQUk7U0FDMUI7UUFDRCxjQUFjLEVBQUU7WUFDWixXQUFXLEVBQUU7Z0JBQ1QsU0FBUztnQkFDVCxnQkFBZ0I7YUFDbkI7WUFDRCxPQUFPLEVBQUUsTUFBTTtZQUNmLGlCQUFpQixFQUFFLElBQUk7U0FDMUI7UUFDRCxxQkFBcUIsRUFBRTtZQUNuQixXQUFXLEVBQUU7Z0JBQ1QsU0FBUztnQkFDVCx1QkFBdUI7YUFDMUI7WUFDRCxPQUFPLEVBQUUsTUFBTTtZQUNmLGlCQUFpQixFQUFFLElBQUk7U0FDMUI7S0FDSjtDQUNKLENBQUMsQ0FBQztBQU9ILElBQWEsZUFBZSxHQUE1QixNQUFhLGVBQWU7SUFNeEIsWUFDcUIsWUFBMEI7UUFBMUIsaUJBQVksR0FBWixZQUFZLENBQWM7UUFKL0MsV0FBTSxHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLFdBQU0sR0FBRyxFQUFFLENBQUM7UUFDWixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBSWpCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBQSxpQkFBUyxFQUFDLGdCQUFnQixDQUFDLENBQUM7SUFHdEQsQ0FBQztJQVNELEtBQUssQ0FBQyxhQUFhLENBQVMsR0FBUTtRQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVsQyxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFFckIsSUFBSTtZQUNBLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDeEIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUV4QixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxLQUFLLGVBQWUsSUFBSSxDQUFDLFFBQVEsY0FBYyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDL0YsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsY0FBYyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFBO2FBQ3BJO1lBRUQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUN4RCxPQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFBO2FBQzNJO1lBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBR3RDLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxTQUFTLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM5SCxPQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFBO2FBQzNJO1lBUUQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDaEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRWhGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUMsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO1lBQ3BFLE9BQU8sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUE7U0FDekc7Z0JBQU87WUFDSixJQUFHLFFBQVEsRUFBQztnQkFDUixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDbkI7U0FDSjtJQUVMLENBQUM7SUFTRCxLQUFLLENBQUMsNEJBQTRCLENBQVMsR0FBUTtRQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWpELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUVyQixJQUFJO1lBQ0EsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUN4QixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBRXhCLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLEVBQUU7Z0JBQ3BCLE9BQU8sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSwrQkFBK0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQTthQUNuSjtZQUVELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtnQkFDeEQsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLCtCQUErQixFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQTthQUMxSjtZQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUd0QyxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDOUgsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLCtCQUErQixFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQTthQUMxSjtZQVFELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQixRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ2hCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRS9GLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzRCxPQUFPLE1BQU0sQ0FBQztTQUNqQjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0RCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDcEUsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLCtCQUErQixFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQTtTQUN4SDtnQkFBTztZQUNKLElBQUcsUUFBUSxFQUFDO2dCQUNSLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNuQjtTQUNKO0lBQ0wsQ0FBQztJQU9ELEtBQUssQ0FBQyxtQkFBbUIsQ0FBUyxHQUFRO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFeEMsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRXJCLElBQUk7WUFDQSxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQ3hCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFJeEIsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBRztnQkFDbkIsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLHNCQUFzQixFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQTthQUNqSjtZQUVELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDbEMsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztZQUM1QyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ1osT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLHNCQUFzQixFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQTthQUNuSjtZQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUMxRyxPQUFPLE1BQU0sQ0FBQztTQUNqQjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0RCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDcEUsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLHNCQUFzQixFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQTtTQUMvRztnQkFBTztZQUNKLElBQUcsUUFBUSxFQUFDO2dCQUNSLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNuQjtTQUNKO0lBQ0wsQ0FBQztDQUdKLENBQUE7QUFuSkc7SUFEQyxJQUFBLGFBQUksRUFBQyxlQUFlLENBQUM7SUFDRCxXQUFBLElBQUEsYUFBSSxHQUFFLENBQUE7Ozs7b0RBaUQxQjtBQVNEO0lBREMsSUFBQSxhQUFJLEVBQUMsOEJBQThCLENBQUM7SUFDRCxXQUFBLElBQUEsYUFBSSxHQUFFLENBQUE7Ozs7bUVBK0N6QztBQU9EO0lBREMsSUFBQSxhQUFJLEVBQUMscUJBQXFCLENBQUM7SUFDRCxXQUFBLElBQUEsYUFBSSxHQUFFLENBQUE7Ozs7MERBZ0NoQztBQXRLUSxlQUFlO0lBRDNCLElBQUEsbUJBQVUsRUFBQyxPQUFPLENBQUM7cUNBUW1CLDRCQUFZO0dBUHRDLGVBQWUsQ0F5SzNCO0FBektZLDBDQUFlIn0=