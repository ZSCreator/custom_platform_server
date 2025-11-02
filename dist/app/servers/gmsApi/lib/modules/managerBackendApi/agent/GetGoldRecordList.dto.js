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
exports.GetGoldRecordList = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GetGoldRecordList {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "平台or代理编号" }),
    __metadata("design:type", String)
], GetGoldRecordList.prototype, "uid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "上级编号" }),
    __metadata("design:type", String)
], GetGoldRecordList.prototype, "parentUid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "平台名称" }),
    __metadata("design:type", String)
], GetGoldRecordList.prototype, "platfromUid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "当前页" }),
    (0, class_validator_1.IsPositive)({ message: "页数应大于 0" }),
    __metadata("design:type", Number)
], GetGoldRecordList.prototype, "currentPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "每页展示数量" }),
    (0, class_validator_1.IsPositive)({ message: "每页展示数量应大于 0" }),
    __metadata("design:type", Number)
], GetGoldRecordList.prototype, "pageSize", void 0);
exports.GetGoldRecordList = GetGoldRecordList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0R29sZFJlY29yZExpc3QuZHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL21hbmFnZXJCYWNrZW5kQXBpL2FnZW50L0dldEdvbGRSZWNvcmRMaXN0LmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxREFBNkM7QUFDN0MsNkNBQThDO0FBRTlDLE1BQWEsaUJBQWlCO0NBa0I3QjtBQWZHO0lBREMsSUFBQSxxQkFBVyxFQUFDLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxDQUFDOzs4Q0FDN0I7QUFHWjtJQURDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7b0RBQ25CO0FBR2xCO0lBREMsSUFBQSxxQkFBVyxFQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDOztzREFDakI7QUFJcEI7SUFGQyxJQUFBLHFCQUFXLEVBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDbkMsSUFBQSw0QkFBVSxFQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDOztzREFDZjtBQUlwQjtJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQztJQUN0QyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLENBQUM7O21EQUN0QjtBQWpCckIsOENBa0JDIn0=