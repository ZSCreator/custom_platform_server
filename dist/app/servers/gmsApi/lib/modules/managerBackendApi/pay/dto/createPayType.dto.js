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
exports.CreatePayType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePayType {
}
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
], CreatePayType.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "是否开启",
        example: false
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePayType.prototype, "isOpen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "商户名称",
        example: "xx支付"
    }),
    (0, class_validator_1.IsNotEmpty)({
        message: "不能为空"
    }),
    (0, class_validator_1.IsString)({
        message: "必须是字符串"
    }),
    __metadata("design:type", String)
], CreatePayType.prototype, "shanghu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "费率",
        example: "0"
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePayType.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "图标地址",
        example: "0"
    }),
    __metadata("design:type", String)
], CreatePayType.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "回调延迟"
    }),
    __metadata("design:type", Number)
], CreatePayType.prototype, "callBackDelay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "备注信息"
    }),
    __metadata("design:type", String)
], CreatePayType.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "图标"
    }),
    __metadata("design:type", String)
], CreatePayType.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "排序"
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePayType.prototype, "sort", void 0);
exports.CreatePayType = CreatePayType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlUGF5VHlwZS5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L2R0by9jcmVhdGVQYXlUeXBlLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEM7QUFDOUMscURBQThFO0FBRTlFLE1BQWEsYUFBYTtDQXNFekI7QUF6REc7SUFYQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxRQUFRO1FBQ3JCLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7SUFDRCxJQUFBLDRCQUFVLEVBQUM7UUFDUixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDO0lBQ0QsSUFBQSwwQkFBUSxFQUFDO1FBQ04sT0FBTyxFQUFFLFFBQVE7S0FDcEIsQ0FBQzs7MkNBQ1c7QUFRYjtJQU5DLElBQUEscUJBQVcsRUFBQztRQUNULFFBQVEsRUFBRSxJQUFJO1FBQ2QsV0FBVyxFQUFFLE1BQU07UUFDbkIsT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQztJQUNELElBQUEsMkJBQVMsR0FBRTs7NkNBQ0k7QUFhaEI7SUFYQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxNQUFNO1FBQ25CLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7SUFDRCxJQUFBLDRCQUFVLEVBQUM7UUFDUixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDO0lBQ0QsSUFBQSwwQkFBUSxFQUFDO1FBQ04sT0FBTyxFQUFFLFFBQVE7S0FDcEIsQ0FBQzs7OENBQ2M7QUFRaEI7SUFOQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsSUFBSTtRQUNqQixPQUFPLEVBQUUsR0FBRztLQUNmLENBQUM7SUFDRCxJQUFBLHVCQUFLLEdBQUU7SUFDUCxJQUFBLHFCQUFHLEVBQUMsQ0FBQyxDQUFDOzsyQ0FDTTtBQU1iO0lBSkMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsV0FBVyxFQUFFLE1BQU07UUFDbkIsT0FBTyxFQUFFLEdBQUc7S0FDZixDQUFDOzswQ0FDVTtBQUtaO0lBSEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsV0FBVyxFQUFFLE1BQU07S0FDdEIsQ0FBQzs7b0RBQ29CO0FBS3RCO0lBSEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsV0FBVyxFQUFFLE1BQU07S0FDdEIsQ0FBQzs7NkNBQ2E7QUFLZjtJQUhDLElBQUEscUJBQVcsRUFBQztRQUNULFdBQVcsRUFBRSxJQUFJO0tBQ3BCLENBQUM7OzJDQUNXO0FBTWI7SUFKQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsSUFBSTtLQUNwQixDQUFDO0lBQ0QsSUFBQSx1QkFBSyxHQUFFOzsyQ0FDSztBQXJFakIsc0NBc0VDIn0=