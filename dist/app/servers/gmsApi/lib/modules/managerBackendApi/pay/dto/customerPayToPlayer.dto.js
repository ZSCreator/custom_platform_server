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
exports.CustomerPayToPlayerDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CustomerPayToPlayerDTO {
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
], CustomerPayToPlayerDTO.prototype, "uid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "订单金额",
        example: 50
    }),
    (0, class_validator_1.IsPositive)({
        message: "订单金额必须为正整数"
    }),
    __metadata("design:type", Number)
], CustomerPayToPlayerDTO.prototype, "orderPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "新增彩金",
        example: 20
    }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CustomerPayToPlayerDTO.prototype, "bonus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "码量",
        example: 70
    }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CustomerPayToPlayerDTO.prototype, "chips", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "是否发送邮件",
        example: false
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CustomerPayToPlayerDTO.prototype, "beSendEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "邮件内容",
        example: ""
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerPayToPlayerDTO.prototype, "emailContent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "备注说明",
        example: "skr"
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerPayToPlayerDTO.prototype, "remark", void 0);
exports.CustomerPayToPlayerDTO = CustomerPayToPlayerDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tZXJQYXlUb1BsYXllci5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L2R0by9jdXN0b21lclBheVRvUGxheWVyLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEM7QUFDOUMscURBQW1GO0FBRW5GLE1BQWEsc0JBQXNCO0NBdUVsQztBQTVERztJQVBDLElBQUEscUJBQVcsRUFBQztRQUNULFFBQVEsRUFBRSxJQUFJO1FBQ2QsV0FBVyxFQUFFLE1BQU07UUFDbkIsT0FBTyxFQUFFLFdBQVc7S0FDdkIsQ0FBQztJQUNELElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUNsQyxJQUFBLDBCQUFRLEVBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7O21EQUNwQjtBQVVaO0lBUkMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsTUFBTTtRQUNuQixPQUFPLEVBQUUsRUFBRTtLQUNkLENBQUM7SUFDRCxJQUFBLDRCQUFVLEVBQUM7UUFDUixPQUFPLEVBQUUsWUFBWTtLQUN4QixDQUFDOzswREFDaUI7QUFRbkI7SUFOQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxNQUFNO1FBQ25CLE9BQU8sRUFBRSxFQUFFO0tBQ2QsQ0FBQztJQUNELElBQUEscUJBQUcsRUFBQyxDQUFDLENBQUM7O3FEQUNPO0FBUWQ7SUFOQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLE9BQU8sRUFBRSxFQUFFO0tBQ2QsQ0FBQztJQUNELElBQUEscUJBQUcsRUFBQyxDQUFDLENBQUM7O3FEQUNPO0FBU2Q7SUFQQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxRQUFRO1FBQ3JCLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7SUFDRCxJQUFBLDRCQUFVLEdBQUU7SUFDWixJQUFBLDJCQUFTLEdBQUU7OzJEQUNTO0FBT3JCO0lBTEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsV0FBVyxFQUFFLE1BQU07UUFDbkIsT0FBTyxFQUFFLEVBQUU7S0FDZCxDQUFDO0lBQ0QsSUFBQSwwQkFBUSxHQUFFOzs0REFDVTtBQWNyQjtJQUxDLElBQUEscUJBQVcsRUFBQztRQUNULFdBQVcsRUFBRSxNQUFNO1FBQ25CLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7SUFDRCxJQUFBLDBCQUFRLEdBQUU7O3NEQUNJO0FBbkVuQix3REF1RUMifQ==