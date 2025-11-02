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
exports.UpdateAgentGoldFromPlatform = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateAgentGoldFromPlatform {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "平台编号" }),
    (0, class_validator_1.IsNotEmpty)({ message: "平台名不能为空" }),
    __metadata("design:type", String)
], UpdateAgentGoldFromPlatform.prototype, "plateform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "代理编号" }),
    (0, class_validator_1.IsNotEmpty)({ message: "不能为空" }),
    __metadata("design:type", String)
], UpdateAgentGoldFromPlatform.prototype, "uid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "变动金币" }),
    __metadata("design:type", Number)
], UpdateAgentGoldFromPlatform.prototype, "gold", void 0);
exports.UpdateAgentGoldFromPlatform = UpdateAgentGoldFromPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlQWdlbnRHb2xkRnJvbVBsYXRmb3JtLmR0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9hZ2VudC9VcGRhdGVBZ2VudEdvbGRGcm9tUGxhdGZvcm0uZHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFEQUFrRDtBQUNsRCw2Q0FBOEM7QUFFOUMsTUFBYSwyQkFBMkI7Q0FjdkM7QUFYRztJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNwQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7OzhEQUNqQjtBQUlsQjtJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNwQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7O3dEQUNwQjtBQUdaO0lBREMsSUFBQSxxQkFBVyxFQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDOzt5REFDeEI7QUFWakIsa0VBY0MifQ==