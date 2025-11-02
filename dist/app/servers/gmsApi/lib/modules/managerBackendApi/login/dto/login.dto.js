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
exports.LoginDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class LoginDTO {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "后台管理员名称"
    }),
    (0, class_validator_1.IsString)({ message: "必须是字符串" }),
    (0, class_validator_1.IsNotEmpty)({ message: "不能为空" }),
    __metadata("design:type", String)
], LoginDTO.prototype, "userName", void 0);
exports.LoginDTO = LoginDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uZHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL21hbmFnZXJCYWNrZW5kQXBpL2xvZ2luL2R0by9sb2dpbi5kdG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQThDO0FBQzlDLHFEQUF3RztBQUV4RyxNQUFhLFFBQVE7Q0FRcEI7QUFGRztJQUxDLElBQUEscUJBQVcsRUFBQztRQUNULFdBQVcsRUFBRSxTQUFTO0tBQ3pCLENBQUM7SUFDRCxJQUFBLDBCQUFRLEVBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDL0IsSUFBQSw0QkFBVSxFQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDOzswQ0FDZjtBQU5yQiw0QkFRQyJ9