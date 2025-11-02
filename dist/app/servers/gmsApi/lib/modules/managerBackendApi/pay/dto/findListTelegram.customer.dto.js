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
exports.findListTelegramCustomerDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class findListTelegramCustomerDTO {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "页数",
        example: 1
    }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], findListTelegramCustomerDTO.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: true,
        description: "每页展示条数",
        example: 20
    }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], findListTelegramCustomerDTO.prototype, "pageSize", void 0);
exports.findListTelegramCustomerDTO = findListTelegramCustomerDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZExpc3RUZWxlZ3JhbS5jdXN0b21lci5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGF5L2R0by9maW5kTGlzdFRlbGVncmFtLmN1c3RvbWVyLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBOEM7QUFDOUMscURBQXNDO0FBRXRDLE1BQWEsMkJBQTJCO0NBa0J2QztBQVZHO0lBTkMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsSUFBSTtRQUNqQixPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7SUFDRCxJQUFBLHFCQUFHLEVBQUMsQ0FBQyxDQUFDOzt5REFDTTtBQVFiO0lBTkMsSUFBQSxxQkFBVyxFQUFDO1FBQ1QsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsUUFBUTtRQUNyQixPQUFPLEVBQUUsRUFBRTtLQUNkLENBQUM7SUFDRCxJQUFBLHFCQUFHLEVBQUMsQ0FBQyxDQUFDOzs2REFDVTtBQWhCckIsa0VBa0JDIn0=