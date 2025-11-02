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
exports.TenantGameOperationalData = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TenantGameOperationalData {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "租户名称" }),
    (0, class_validator_1.IsNotEmpty)({ message: "租户编号不能为空" }),
    __metadata("design:type", String)
], TenantGameOperationalData.prototype, "groupRemark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "开始时间" }),
    __metadata("design:type", Number)
], TenantGameOperationalData.prototype, "startTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "结束时间" }),
    __metadata("design:type", Number)
], TenantGameOperationalData.prototype, "endTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "当前页" }),
    (0, class_validator_1.IsPositive)({ message: "页数应大于 0" }),
    __metadata("design:type", Number)
], TenantGameOperationalData.prototype, "currentPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "每页展示数量" }),
    (0, class_validator_1.IsPositive)({ message: "每页展示数量应大于 0" }),
    __metadata("design:type", Number)
], TenantGameOperationalData.prototype, "pageSize", void 0);
exports.TenantGameOperationalData = TenantGameOperationalData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50R2FtZU9wZXJhdGlvbmFsRGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9hZ2VudC9UZW5hbnRHYW1lT3BlcmF0aW9uYWxEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFEQUF5RDtBQUN6RCw2Q0FBOEM7QUFFOUMsTUFBYSx5QkFBeUI7Q0FzQnJDO0FBbEJHO0lBRkMsSUFBQSxxQkFBVyxFQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDO0lBQ3BDLElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQzs7OERBQ2hCO0FBR3BCO0lBREMsSUFBQSxxQkFBVyxFQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDOztpRUFDZDtBQUd2QjtJQURDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7K0RBQ2hCO0FBSXJCO0lBRkMsSUFBQSxxQkFBVyxFQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDO0lBQ25DLElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQzs7OERBQ2Y7QUFJcEI7SUFGQyxJQUFBLHFCQUFXLEVBQUMsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDdEMsSUFBQSw0QkFBVSxFQUFDLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxDQUFDOzsyREFDdEI7QUFsQnJCLDhEQXNCQyJ9