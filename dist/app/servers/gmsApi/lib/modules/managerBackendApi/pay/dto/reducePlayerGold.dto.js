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
exports.ReducePlayerGoldDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ReducePlayerGoldDTO {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "用户编号",
        example: "000000000"
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "uid不能为空" }),
    (0, class_validator_1.IsString)({ message: "必须是字符串" }),
    __metadata("design:type", String)
], ReducePlayerGoldDTO.prototype, "uid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "用户名",
        example: "大帅比"
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "不能为空" }),
    (0, class_validator_1.IsString)({ message: "必须是字符串" }),
    __metadata("design:type", String)
], ReducePlayerGoldDTO.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "钱包",
    }),
    __metadata("design:type", Number)
], ReducePlayerGoldDTO.prototype, "walletGold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "持有金币",
        example: -10
    }),
    (0, class_validator_1.IsNegative)({ message: "必须为负整数" }),
    __metadata("design:type", Number)
], ReducePlayerGoldDTO.prototype, "orderPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "邮件内容",
        example: ""
    }),
    __metadata("design:type", String)
], ReducePlayerGoldDTO.prototype, "emailContent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "是否邮件通知",
        example: false
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReducePlayerGoldDTO.prototype, "beSendEmail", void 0);
exports.ReducePlayerGoldDTO = ReducePlayerGoldDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkdWNlUGxheWVyR29sZC5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L2R0by9yZWR1Y2VQbGF5ZXJHb2xkLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEM7QUFDOUMscURBQThFO0FBRTlFLE1BQWEsbUJBQW1CO0NBMkMvQjtBQW5DRztJQVBDLElBQUEscUJBQVcsRUFBQztRQUNULFFBQVEsRUFBRSxJQUFJO1FBQ2QsV0FBVyxFQUFFLE1BQU07UUFDbkIsT0FBTyxFQUFFLFdBQVc7S0FDdkIsQ0FBQztJQUNELElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUNsQyxJQUFBLDBCQUFRLEVBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7O2dEQUNwQjtBQVNaO0lBUEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsS0FBSztRQUNsQixPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDO0lBQ0QsSUFBQSw0QkFBVSxFQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO0lBQy9CLElBQUEsMEJBQVEsRUFBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQzs7cURBQ2Y7QUFLakI7SUFIQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsSUFBSTtLQUNwQixDQUFDOzt1REFDaUI7QUFPbkI7SUFMQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsTUFBTTtRQUNuQixPQUFPLEVBQUUsQ0FBQyxFQUFFO0tBQ2YsQ0FBQztJQUNELElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQzs7dURBQ2Y7QUFNbkI7SUFKQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsTUFBTTtRQUNuQixPQUFPLEVBQUUsRUFBRTtLQUNkLENBQUM7O3lEQUNtQjtBQU9yQjtJQUxDLElBQUEscUJBQVcsRUFBQztRQUNULFdBQVcsRUFBRSxRQUFRO1FBQ3JCLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7SUFDRCxJQUFBLDJCQUFTLEdBQUU7O3dEQUNTO0FBMUN6QixrREEyQ0MifQ==