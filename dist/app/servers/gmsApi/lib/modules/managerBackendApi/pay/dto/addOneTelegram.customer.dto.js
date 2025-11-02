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
exports.addOneTelegramCustomerDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class addOneTelegramCustomerDTO {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "链接地址",
        example: "https://t.me/andy127"
    }),
    __metadata("design:type", String)
], addOneTelegramCustomerDTO.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "昵称",
        example: "andy"
    }),
    __metadata("design:type", String)
], addOneTelegramCustomerDTO.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "下发比例,总和不能超过100",
        example: 20
    }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], addOneTelegramCustomerDTO.prototype, "per", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: " 状态: 0停用,1启用",
        example: 1
    }),
    __metadata("design:type", Number)
], addOneTelegramCustomerDTO.prototype, "status", void 0);
exports.addOneTelegramCustomerDTO = addOneTelegramCustomerDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkT25lVGVsZWdyYW0uY3VzdG9tZXIuZHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL21hbmFnZXJCYWNrZW5kQXBpL3BheS9kdG8vYWRkT25lVGVsZWdyYW0uY3VzdG9tZXIuZHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDZDQUE4QztBQUM5QyxxREFBMkM7QUFFM0MsTUFBYSx5QkFBeUI7Q0FrQ3JDO0FBMUJHO0lBTkMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsTUFBTTtRQUNuQixPQUFPLEVBQUUsc0JBQXNCO0tBQ2xDLENBQUM7O3NEQUVVO0FBUVo7SUFOQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OzJEQUVlO0FBU2pCO0lBUEMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsZ0JBQWdCO1FBQzdCLE9BQU8sRUFBRSxFQUFFO0tBQ2QsQ0FBQztJQUNELElBQUEscUJBQUcsRUFBQyxDQUFDLENBQUM7SUFDTixJQUFBLHFCQUFHLEVBQUMsR0FBRyxDQUFDOztzREFDRztBQU1aO0lBSkMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsV0FBVyxFQUFFLGNBQWM7UUFDM0IsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzt5REFDYTtBQS9CbkIsOERBa0NDIn0=