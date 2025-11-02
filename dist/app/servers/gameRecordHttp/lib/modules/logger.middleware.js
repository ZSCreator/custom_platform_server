"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const Encryption = require("../../../../common/encryption");
const MiddlewareEnum = require("../const/middlewareEnum");
let LoggerMiddleware = class LoggerMiddleware {
    use(req, res, next) {
        const { agent, timestamp, key, param } = req.body;
        if (!agent) {
            return res.send({ s: 100, m: "/xxxxxx", d: { code: MiddlewareEnum.VALIDATION_LOSE.status } });
        }
        if (!timestamp) {
            return res.send({ s: 100, m: "/xxxxxx", d: { code: MiddlewareEnum.VALIDATION_LOSE.status } });
        }
        const md5 = Encryption.MD5KEY(agent, timestamp);
        if (!key) {
            return res.send({ s: 100, m: "/xxxxxx", d: { code: MiddlewareEnum.VALIDATION_LOSE.status } });
        }
        if (md5 != key) {
            return res.send({ s: 100, m: "/xxxxxx", d: { code: MiddlewareEnum.VALIDATION_ERROR.status } });
        }
        if (!param) {
            return res.send({ s: 100, m: "/xxxxxx", d: { code: MiddlewareEnum.DATA_NOT_EXIST.status } });
        }
        try {
            req.body.param = Encryption.httpUrlEnCryPtionObjectParam(param);
            next();
        }
        catch (e) {
            return res.send({ s: 100, m: "/xxxxxx", d: { code: MiddlewareEnum.AES_ERROR } });
        }
    }
};
LoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggerMiddleware);
exports.LoggerMiddleware = LoggerMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLm1pZGRsZXdhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYW1lUmVjb3JkSHR0cC9saWIvbW9kdWxlcy9sb2dnZXIubWlkZGxld2FyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBNEQ7QUFFNUQsNERBQStEO0FBQy9ELDBEQUE0RDtBQUk1RCxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQUN6QixHQUFHLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFjO1FBQzNDLE1BQU0sRUFDRixLQUFLLEVBQ0wsU0FBUyxFQUNULEdBQUcsRUFDSCxLQUFLLEVBQ1IsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBS2IsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNULE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUMsRUFBQyxDQUFDLENBQUM7U0FDN0Y7UUFJRCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ1osT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFFLEVBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFDLElBQUksRUFBRyxjQUFjLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBQyxFQUFDLENBQUMsQ0FBQztTQUMvRjtRQUNELE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBS2hELElBQUcsQ0FBQyxHQUFHLEVBQUM7WUFDSixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUMsSUFBSSxFQUFHLGNBQWMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFDLEVBQUMsQ0FBQyxDQUFDO1NBQzlGO1FBRUQsSUFBSyxHQUFHLElBQUksR0FBRyxFQUFFO1lBQ2IsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFDLElBQUksRUFBRyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFDLEVBQUMsQ0FBQyxDQUFDO1NBQy9GO1FBSUQsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNSLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUcsY0FBYyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUMsRUFBQyxDQUFDLENBQUM7U0FDN0Y7UUFFRCxJQUFHO1lBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLElBQUksRUFBRSxDQUFDO1NBQ1Y7UUFBQSxPQUFPLENBQUMsRUFBRTtZQUNQLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUcsRUFBQyxJQUFJLEVBQUcsY0FBYyxDQUFDLFNBQVMsRUFBRSxFQUFDLENBQUMsQ0FBQztTQUNuRjtJQUVMLENBQUM7Q0FDSixDQUFBO0FBaERZLGdCQUFnQjtJQUQ1QixJQUFBLG1CQUFVLEdBQUU7R0FDQSxnQkFBZ0IsQ0FnRDVCO0FBaERZLDRDQUFnQiJ9