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
exports.TenantOperationalData = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TenantOperationalData {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "当前页" }),
    (0, class_validator_1.IsPositive)({ message: "页数应大于 0" }),
    __metadata("design:type", Number)
], TenantOperationalData.prototype, "currentPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "每页展示数量" }),
    (0, class_validator_1.IsPositive)({ message: "每页展示数量应大于 0" }),
    __metadata("design:type", Number)
], TenantOperationalData.prototype, "pageSize", void 0);
exports.TenantOperationalData = TenantOperationalData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50T3BlcmF0aW9uYWxEYXRhLmR0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9hZ2VudC9UZW5hbnRPcGVyYXRpb25hbERhdGEuZHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFEQUE0QztBQUM1Qyw2Q0FBOEM7QUFFOUMsTUFBYSxxQkFBcUI7Q0FTakM7QUFMRztJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNuQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7OzBEQUNmO0FBSXBCO0lBRkMsSUFBQSxxQkFBVyxFQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQ3RDLElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsQ0FBQzs7dURBQ3RCO0FBUnJCLHNEQVNDIn0=