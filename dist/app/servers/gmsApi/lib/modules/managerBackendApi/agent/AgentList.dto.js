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
exports.AgentList = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AgentList {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "平台编号" }),
    (0, class_validator_1.IsNotEmpty)({ message: "平台平台不能为空" }),
    __metadata("design:type", String)
], AgentList.prototype, "platfromUid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "当前页" }),
    (0, class_validator_1.IsPositive)({ message: "页数应大于 0" }),
    __metadata("design:type", Number)
], AgentList.prototype, "currentPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "每页展示数量" }),
    (0, class_validator_1.IsPositive)({ message: "每页展示数量应大于 0" }),
    __metadata("design:type", Number)
], AgentList.prototype, "pageSize", void 0);
exports.AgentList = AgentList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWdlbnRMaXN0LmR0by5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9hZ2VudC9BZ2VudExpc3QuZHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFEQUF5RDtBQUN6RCw2Q0FBOEM7QUFFOUMsTUFBYSxTQUFTO0NBb0JyQjtBQWhCRztJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNwQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUM7OzhDQUNoQjtBQUlwQjtJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNuQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7OzhDQUNmO0FBSXBCO0lBRkMsSUFBQSxxQkFBVyxFQUFDLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQ3RDLElBQUEsNEJBQVUsRUFBQyxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsQ0FBQzs7MkNBQ3RCO0FBWnJCLDhCQW9CQyJ9