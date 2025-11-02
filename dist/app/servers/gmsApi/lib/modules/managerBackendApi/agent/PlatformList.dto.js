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
exports.PlatformList = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PlatformList {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "当前页" }),
    (0, class_validator_1.IsPositive)({ message: "页数应大于 0" }),
    __metadata("design:type", Number)
], PlatformList.prototype, "currentPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "每页展示数量" }),
    (0, class_validator_1.IsPositive)({ message: "每页展示数量应大于 0" }),
    __metadata("design:type", Number)
], PlatformList.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "平台得uid" }),
    __metadata("design:type", String)
], PlatformList.prototype, "platformUid", void 0);
exports.PlatformList = PlatformList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1MaXN0LmR0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9hZ2VudC9QbGF0Zm9ybUxpc3QuZHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFEQUE2QztBQUM3Qyw2Q0FBOEM7QUFFOUMsTUFBYSxZQUFZO0NBYXhCO0FBVEc7SUFGQyxJQUFBLHFCQUFXLEVBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDbkMsSUFBQSw0QkFBVSxFQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDOztpREFDZjtBQUlwQjtJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQztJQUN0QyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLENBQUM7OzhDQUN0QjtBQUdqQjtJQURDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQzs7aURBQ25CO0FBWHhCLG9DQWFDIn0=