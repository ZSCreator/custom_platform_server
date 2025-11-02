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
exports.UidMatchNickNameDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UidMatchNickNameDTO {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "用户编号",
        example: "000000000"
    }),
    (0, class_validator_1.IsNotEmpty)({ message: "uid不能为空" }),
    (0, class_validator_1.IsString)({ message: "必须是字符串" }),
    __metadata("design:type", String)
], UidMatchNickNameDTO.prototype, "uid", void 0);
exports.UidMatchNickNameDTO = UidMatchNickNameDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlkTWF0Y2hOaWNrTmFtZS5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L2R0by91aWRNYXRjaE5pY2tOYW1lLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEM7QUFDOUMscURBQXVEO0FBRXZELE1BQWEsbUJBQW1CO0NBUy9CO0FBREc7SUFQQyxJQUFBLHFCQUFXLEVBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLFdBQVcsRUFBRSxNQUFNO1FBQ25CLE9BQU8sRUFBRSxXQUFXO0tBQ3ZCLENBQUM7SUFDRCxJQUFBLDRCQUFVLEVBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7SUFDbEMsSUFBQSwwQkFBUSxFQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDOztnREFDcEI7QUFSaEIsa0RBU0MifQ==