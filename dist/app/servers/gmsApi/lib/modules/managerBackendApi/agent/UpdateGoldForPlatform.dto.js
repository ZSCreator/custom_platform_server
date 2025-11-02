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
exports.UpdateGoldForPlatform = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateGoldForPlatform {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "平台编号" }),
    (0, class_validator_1.IsNotEmpty)({ message: "平台平台不能为空" }),
    __metadata("design:type", String)
], UpdateGoldForPlatform.prototype, "platfromUid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "变动金币" }),
    __metadata("design:type", Number)
], UpdateGoldForPlatform.prototype, "gold", void 0);
exports.UpdateGoldForPlatform = UpdateGoldForPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlR29sZEZvclBsYXRmb3JtLmR0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9hZ2VudC9VcGRhdGVHb2xkRm9yUGxhdGZvcm0uZHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFEQUFrRDtBQUNsRCw2Q0FBOEM7QUFFOUMsTUFBYSxxQkFBcUI7Q0FXakM7QUFQRztJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNwQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUM7OzBEQUNoQjtBQUdwQjtJQURDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7bURBQ3hCO0FBUGpCLHNEQVdDIn0=