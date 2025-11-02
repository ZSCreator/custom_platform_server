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
exports.PayServerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ApiResult_1 = require("../../../../../common/pojo/ApiResult");
const payBackService_1 = require("../../../../../services/payService/payBackService");
let PayServerController = class PayServerController {
    async payCallBack({ serverIp, field1, orderNumber, orderPrice, orderTime, platform }) {
        try {
            console.warn(field1, orderNumber, orderPrice, orderTime, platform);
            await (0, payBackService_1.mallCallbackFromHttp)({ field1, orderNumber, orderPrice, orderTime });
            return ApiResult_1.ApiResult.SUCCESS(null, "充值成功");
        }
        catch (e) {
            return ApiResult_1.ApiResult.ERROR(null, "充值出错");
        }
    }
};
__decorate([
    (0, common_1.Post)('callbackurl1'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayServerController.prototype, "payCallBack", null);
PayServerController = __decorate([
    (0, swagger_1.ApiTags)("支付服务"),
    (0, common_1.Controller)('payServer')
], PayServerController);
exports.PayServerController = PayServerController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5Q2FsbEJhY2suY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9wYXlTZXJ2ZXJBcGkvcGF5Q2FsbEJhY2suY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBK0U7QUFDL0UsNkNBQXFFO0FBQ3JFLG9FQUFpRTtBQUNqRSxzRkFBeUY7QUFNekYsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFHNUIsS0FBSyxDQUFDLFdBQVcsQ0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO1FBQ3hGLElBQUk7WUFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRSxNQUFNLElBQUEscUNBQW9CLEVBQUMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO1lBQzFFLE9BQU8scUJBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzFDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFFUixPQUFPLHFCQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7Q0FFSixDQUFBO0FBWEc7SUFEQyxJQUFBLGFBQUksRUFBQyxjQUFjLENBQUM7SUFDRixXQUFBLElBQUEsYUFBSSxHQUFFLENBQUE7Ozs7c0RBU3hCO0FBWlEsbUJBQW1CO0lBRi9CLElBQUEsaUJBQU8sRUFBQyxNQUFNLENBQUM7SUFDZixJQUFBLG1CQUFVLEVBQUMsV0FBVyxDQUFDO0dBQ1gsbUJBQW1CLENBYy9CO0FBZFksa0RBQW1CIn0=