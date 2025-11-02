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
exports.GetPayInfoDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GetPayInfoDTO {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: "用户编号",
        example: "000000000"
    }),
    __metadata("design:type", String)
], GetPayInfoDTO.prototype, "uid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "页数",
        example: 1
    }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GetPayInfoDTO.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "每页数量",
        example: 20
    }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GetPayInfoDTO.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: "开始时间",
        example: 12312312
    }),
    __metadata("design:type", String)
], GetPayInfoDTO.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: "结束时间",
        example: 12312312
    }),
    __metadata("design:type", String)
], GetPayInfoDTO.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "充值途径"
    }),
    __metadata("design:type", String)
], GetPayInfoDTO.prototype, "remark", void 0);
exports.GetPayInfoDTO = GetPayInfoDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGF5SW5mby5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L2R0by9nZXRQYXlJbmZvLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEM7QUFDOUMscURBQW1GO0FBRW5GLE1BQWEsYUFBYTtDQThDekI7QUFyQ0c7SUFQQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLFdBQVcsRUFBRSxNQUFNO1FBQ25CLE9BQU8sRUFBRSxXQUFXO0tBQ3ZCLENBQUM7OzBDQUdVO0FBUVo7SUFOQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQztJQUNELElBQUEscUJBQUcsRUFBQyxDQUFDLENBQUM7OzJDQUNNO0FBUWI7SUFOQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxNQUFNO1FBQ25CLE9BQU8sRUFBRSxFQUFFO0tBQ2QsQ0FBQztJQUNELElBQUEscUJBQUcsRUFBQyxDQUFDLENBQUM7OytDQUNVO0FBT2pCO0lBTEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsUUFBUSxFQUFFLEtBQUs7UUFDZixXQUFXLEVBQUUsTUFBTTtRQUNuQixPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOztnREFDZ0I7QUFPbEI7SUFMQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsS0FBSztRQUNmLFdBQVcsRUFBRSxNQUFNO1FBQ25CLE9BQU8sRUFBRSxRQUFRO0tBQ3BCLENBQUM7OzhDQUNjO0FBS2hCO0lBSEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsV0FBVyxFQUFFLE1BQU07S0FDdEIsQ0FBQzs7NkNBQ2E7QUE1Q25CLHNDQThDQyJ9