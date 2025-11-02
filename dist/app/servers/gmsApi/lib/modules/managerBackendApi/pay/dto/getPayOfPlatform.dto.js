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
exports.GetPayOfPlatformDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GetPayOfPlatformDTO {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "开始时间戳"
    }),
    (0, class_validator_1.IsInt)({ message: "必须是number" }),
    (0, class_validator_1.IsPositive)({ message: "必须大于0" }),
    __metadata("design:type", Number)
], GetPayOfPlatformDTO.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "结束时间戳"
    }),
    (0, class_validator_1.IsInt)({ message: "必须是number" }),
    (0, class_validator_1.IsPositive)({ message: "必须大于0" }),
    __metadata("design:type", Number)
], GetPayOfPlatformDTO.prototype, "endTime", void 0);
exports.GetPayOfPlatformDTO = GetPayOfPlatformDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGF5T2ZQbGF0Zm9ybS5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L2R0by9nZXRQYXlPZlBsYXRmb3JtLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEM7QUFDOUMscURBQW9EO0FBRXBELE1BQWEsbUJBQW1CO0NBYy9CO0FBUkc7SUFMQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsT0FBTztLQUN2QixDQUFDO0lBQ0QsSUFBQSx1QkFBSyxFQUFDLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDO0lBQy9CLElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQzs7c0RBQ2Y7QUFPbEI7SUFMQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsT0FBTztLQUN2QixDQUFDO0lBQ0QsSUFBQSx1QkFBSyxFQUFDLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDO0lBQy9CLElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQzs7b0RBQ2pCO0FBYnBCLGtEQWNDIn0=