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
exports.ChangePayTypeDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ChangePayTypeDTO {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "主键"
    }),
    (0, class_validator_1.IsNotEmpty)({
        message: "不能为空"
    }),
    (0, class_validator_1.IsString)({
        message: "必须是字符串"
    }),
    __metadata("design:type", String)
], ChangePayTypeDTO.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "充值类型名称",
        example: "xx支付"
    }),
    (0, class_validator_1.IsNotEmpty)({
        message: "不能为空"
    }),
    (0, class_validator_1.IsString)({
        message: "必须是字符串"
    }),
    __metadata("design:type", String)
], ChangePayTypeDTO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "是否开启",
        example: false
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChangePayTypeDTO.prototype, "isOpen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "商户名称",
        example: "xx支付"
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "不能为空" }),
    (0, class_validator_1.IsString)({ message: "必须是字符串" }),
    __metadata("design:type", String)
], ChangePayTypeDTO.prototype, "shanghu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "费率",
        example: "0"
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ChangePayTypeDTO.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "图标地址",
        example: "0"
    }),
    __metadata("design:type", String)
], ChangePayTypeDTO.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "回调延迟"
    }),
    __metadata("design:type", Number)
], ChangePayTypeDTO.prototype, "callBackDelay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "备注信息"
    }),
    __metadata("design:type", String)
], ChangePayTypeDTO.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "图标"
    }),
    __metadata("design:type", String)
], ChangePayTypeDTO.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "排序"
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ChangePayTypeDTO.prototype, "sort", void 0);
exports.ChangePayTypeDTO = ChangePayTypeDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlUGF5VHlwZS5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L2R0by9jaGFuZ2VQYXlUeXBlLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEM7QUFDOUMscURBQThFO0FBRTlFLE1BQWEsZ0JBQWdCO0NBNkU1QjtBQWxFRztJQVZDLElBQUEscUJBQVcsRUFBQztRQUNULFFBQVEsRUFBRSxJQUFJO1FBQ2QsV0FBVyxFQUFFLElBQUk7S0FDcEIsQ0FBQztJQUNELElBQUEsNEJBQVUsRUFBQztRQUNSLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7SUFDRCxJQUFBLDBCQUFRLEVBQUM7UUFDTixPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzs2Q0FDVTtBQWFaO0lBWEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsUUFBUTtRQUNyQixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDO0lBQ0QsSUFBQSw0QkFBVSxFQUFDO1FBQ1IsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQztJQUNELElBQUEsMEJBQVEsRUFBQztRQUNOLE9BQU8sRUFBRSxRQUFRO0tBQ3BCLENBQUM7OzhDQUNXO0FBUWI7SUFOQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxNQUFNO1FBQ25CLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7SUFDRCxJQUFBLDJCQUFTLEdBQUU7OEJBQ0osT0FBTztnREFBQztBQVNoQjtJQVBDLElBQUEscUJBQVcsRUFBQztRQUNULFFBQVEsRUFBRSxJQUFJO1FBQ2QsV0FBVyxFQUFFLE1BQU07UUFDbkIsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQztJQUNELElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUMvQixJQUFBLDBCQUFRLEVBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7O2lEQUNoQjtBQVFoQjtJQU5DLElBQUEscUJBQVcsRUFBQztRQUNULFdBQVcsRUFBRSxJQUFJO1FBQ2pCLE9BQU8sRUFBRSxHQUFHO0tBQ2YsQ0FBQztJQUNELElBQUEsdUJBQUssR0FBRTtJQUNQLElBQUEscUJBQUcsRUFBQyxDQUFDLENBQUM7OzhDQUNNO0FBTWI7SUFKQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsTUFBTTtRQUNuQixPQUFPLEVBQUUsR0FBRztLQUNmLENBQUM7OzZDQUNVO0FBS1o7SUFIQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsTUFBTTtLQUN0QixDQUFDOzt1REFDb0I7QUFLdEI7SUFIQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsTUFBTTtLQUN0QixDQUFDOztnREFDYTtBQUtmO0lBSEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsV0FBVyxFQUFFLElBQUk7S0FDcEIsQ0FBQzs7OENBQ1c7QUFNYjtJQUpDLElBQUEscUJBQVcsRUFBQztRQUNULFdBQVcsRUFBRSxJQUFJO0tBQ3BCLENBQUM7SUFDRCxJQUFBLHVCQUFLLEdBQUU7OzhDQUNLO0FBNUVqQiw0Q0E2RUMifQ==