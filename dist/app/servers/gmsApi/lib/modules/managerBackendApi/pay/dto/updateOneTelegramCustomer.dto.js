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
exports.UpdateOneTelegramCustomerDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateOneTelegramCustomerDTO {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "客服编号",
        example: 1
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], UpdateOneTelegramCustomerDTO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "链接地址",
        example: "https://t.me/andy127"
    }),
    __metadata("design:type", String)
], UpdateOneTelegramCustomerDTO.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "昵称",
        example: "andy"
    }),
    __metadata("design:type", String)
], UpdateOneTelegramCustomerDTO.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "下发比例,总和不能超过100",
        example: 20
    }),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateOneTelegramCustomerDTO.prototype, "per", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "状态: 0停用,1启用",
        example: 1
    }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateOneTelegramCustomerDTO.prototype, "status", void 0);
exports.UpdateOneTelegramCustomerDTO = UpdateOneTelegramCustomerDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlT25lVGVsZWdyYW1DdXN0b21lci5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L2R0by91cGRhdGVPbmVUZWxlZ3JhbUN1c3RvbWVyLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEM7QUFDOUMscURBQXdEO0FBRXhELE1BQWEsNEJBQTRCO0NBb0N4QztBQTdCRztJQU5DLElBQUEscUJBQVcsRUFBQztRQUNULFFBQVEsRUFBRSxJQUFJO1FBQ2QsV0FBVyxFQUFFLE1BQU07UUFDbkIsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDO0lBQ0QsSUFBQSw0QkFBVSxHQUFFOzt3REFDRjtBQU9YO0lBTEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsV0FBVyxFQUFFLE1BQU07UUFDbkIsT0FBTyxFQUFFLHNCQUFzQjtLQUNsQyxDQUFDOzt5REFFVTtBQU9aO0lBTEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsV0FBVyxFQUFFLElBQUk7UUFDakIsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7OERBRWU7QUFPakI7SUFMQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsZ0JBQWdCO1FBQzdCLE9BQU8sRUFBRSxFQUFFO0tBQ2QsQ0FBQztJQUNELElBQUEscUJBQUcsRUFBQyxHQUFHLENBQUM7O3lEQUNHO0FBT1o7SUFMQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxXQUFXLEVBQUUsYUFBYTtRQUMxQixPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7SUFDRCxJQUFBLHVCQUFLLEdBQUU7OzREQUNPO0FBbkNuQixvRUFvQ0MifQ==