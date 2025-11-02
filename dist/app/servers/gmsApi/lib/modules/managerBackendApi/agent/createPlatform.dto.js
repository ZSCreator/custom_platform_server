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
exports.CreatePlatform = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePlatform {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "平台编号" }),
    (0, class_validator_1.IsNotEmpty)({ message: "平台名不能为空" }),
    __metadata("design:type", String)
], CreatePlatform.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "平台金币" }),
    (0, class_validator_1.IsNotEmpty)({ message: "平台金币不能为空" }),
    (0, class_validator_1.Min)(0, { message: "平台金币应大于或等于 0" }),
    __metadata("design:type", Number)
], CreatePlatform.prototype, "gold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "平台语言" }),
    (0, class_validator_1.IsNotEmpty)({ message: "平台语言不能为空" }),
    __metadata("design:type", String)
], CreatePlatform.prototype, "language", void 0);
exports.CreatePlatform = CreatePlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlUGxhdGZvcm0uZHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL21hbmFnZXJCYWNrZW5kQXBpL2FnZW50L2NyZWF0ZVBsYXRmb3JtLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxREFBa0Q7QUFDbEQsNkNBQThDO0FBRTlDLE1BQWEsY0FBYztDQWdCMUI7QUFaRztJQUZDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNwQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7O2dEQUNsQjtBQUtqQjtJQUhDLElBQUEscUJBQVcsRUFBQyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNwQyxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUM7SUFDbkMsSUFBQSxxQkFBRyxFQUFDLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsQ0FBQzs7NENBQ3ZCO0FBS2I7SUFGQyxJQUFBLHFCQUFXLEVBQUMsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFDcEMsSUFBQSw0QkFBVSxFQUFDLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDOztnREFDbkI7QUFkckIsd0NBZ0JDIn0=