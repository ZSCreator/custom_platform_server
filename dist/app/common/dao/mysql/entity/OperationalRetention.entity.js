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
exports.OperationalRetention = void 0;
const typeorm_1 = require("typeorm");
let OperationalRetention = class OperationalRetention {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OperationalRetention.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OperationalRetention.prototype, "agentName", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], OperationalRetention.prototype, "betPlayer", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], OperationalRetention.prototype, "addPlayer", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], OperationalRetention.prototype, "AddRmbPlayer", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], OperationalRetention.prototype, "allAddRmb", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], OperationalRetention.prototype, "secondNum", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], OperationalRetention.prototype, "threeNum", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], OperationalRetention.prototype, "sevenNum", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], OperationalRetention.prototype, "fifteenNum", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], OperationalRetention.prototype, "createDate", void 0);
OperationalRetention = __decorate([
    (0, typeorm_1.Entity)("Sp_OperationalRetention")
], OperationalRetention);
exports.OperationalRetention = OperationalRetention;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aW9uYWxSZXRlbnRpb24uZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L09wZXJhdGlvbmFsUmV0ZW50aW9uLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FJaUI7QUFLakIsSUFBYSxvQkFBb0IsR0FBakMsTUFBYSxvQkFBb0I7Q0EwQ2hDLENBQUE7QUF2Q0c7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztnREFDZDtBQUlYO0lBREMsSUFBQSxnQkFBTSxHQUFFOzt1REFDUztBQUlsQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7O3VEQUNwQjtBQUlmO0lBREMsSUFBQSxnQkFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7dURBQ3BCO0FBSWY7SUFEQyxJQUFBLGdCQUFNLEVBQUMsTUFBTSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDOzswREFDakI7QUFJbEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O3VEQUNKO0FBR2xCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzt1REFDSjtBQUdsQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7c0RBQ0w7QUFHakI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O3NEQUNMO0FBR2pCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzt3REFDSDtBQUtuQjtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OEJBQ1UsSUFBSTt3REFBQztBQXhDUixvQkFBb0I7SUFEaEMsSUFBQSxnQkFBTSxFQUFDLHlCQUF5QixDQUFDO0dBQ3JCLG9CQUFvQixDQTBDaEM7QUExQ1ksb0RBQW9CIn0=