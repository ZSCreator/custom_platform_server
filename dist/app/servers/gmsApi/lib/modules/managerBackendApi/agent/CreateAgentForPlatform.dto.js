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
exports.CreateAgentForPlatform = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAgentForPlatform {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "代理编号" }),
    (0, class_validator_1.IsNotEmpty)({ message: "代理名不能为空" }),
    __metadata("design:type", String)
], CreateAgentForPlatform.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "代理或平台编号" }),
    (0, class_validator_1.IsNotEmpty)({ message: "平台或代理编号不能为空" }),
    __metadata("design:type", String)
], CreateAgentForPlatform.prototype, "agentUid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "语言" }),
    (0, class_validator_1.IsNotEmpty)({ message: "语言不能为空" }),
    __metadata("design:type", String)
], CreateAgentForPlatform.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "金币" }),
    (0, class_validator_1.Min)(0, { message: "平台金币应大于或等于 0" }),
    __metadata("design:type", Number)
], CreateAgentForPlatform.prototype, "gold", void 0);
exports.CreateAgentForPlatform = CreateAgentForPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlQWdlbnRGb3JQbGF0Zm9ybS5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvYWdlbnQvQ3JlYXRlQWdlbnRGb3JQbGF0Zm9ybS5kdG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscURBQWtEO0FBQ2xELDZDQUE4QztBQUU5QyxNQUFhLHNCQUFzQjtDQWlCbEM7QUFiRztJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNwQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7O3dEQUNsQjtBQUlqQjtJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUN2QyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLENBQUM7O3dEQUN0QjtBQUlqQjtJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNsQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7O3dEQUNqQjtBQUlqQjtJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNsQyxJQUFBLHFCQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxDQUFDOztvREFDdkI7QUFoQmpCLHdEQWlCQyJ9