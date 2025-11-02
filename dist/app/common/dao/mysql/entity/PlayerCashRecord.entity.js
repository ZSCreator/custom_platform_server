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
exports.PlayerCashRecord = void 0;
const typeorm_1 = require("typeorm");
let PlayerCashRecord = class PlayerCashRecord {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "bankCardNo", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        nullable: true, length: 20
    }),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "groupRemark", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "ifscCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "bankUserName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "allCash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "allAddRmb", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "money", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "checkName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "orderNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "orderStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "cashStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "remittance", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "startGold", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "lastGold", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "payAccountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], PlayerCashRecord.prototype, "payFlag", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlayerCashRecord.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "flowCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerCashRecord.prototype, "rebateGold", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], PlayerCashRecord.prototype, "createDate", void 0);
PlayerCashRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_PlayerCashRecord")
], PlayerCashRecord);
exports.PlayerCashRecord = PlayerCashRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyQ2FzaFJlY29yZC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvUGxheWVyQ2FzaFJlY29yZC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQWlGO0FBS2pGLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWdCO0NBaUg1QixDQUFBO0FBOUdHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7NENBQ2Q7QUFLWDtJQURDLElBQUEsZ0JBQU0sR0FBRTs7NkNBQ0c7QUFLWjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7b0RBQ1U7QUFRbkI7SUFIQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRTtLQUM3QixDQUFDOztxREFDa0I7QUFLcEI7SUFEQyxJQUFBLGdCQUFNLEdBQUU7O2tEQUNRO0FBSWpCO0lBREMsSUFBQSxnQkFBTSxHQUFFOztrREFDUTtBQUlqQjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7K0NBQ0s7QUFJZDtJQURDLElBQUEsZ0JBQU0sR0FBRTs7c0RBQ1k7QUFJckI7SUFEQyxJQUFBLGdCQUFNLEdBQUU7OzhDQUNJO0FBS2I7SUFEQyxJQUFBLGdCQUFNLEdBQUU7O2lEQUNPO0FBS2hCO0lBREMsSUFBQSxnQkFBTSxHQUFFOzttREFDUztBQUlsQjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7K0NBQ0s7QUFJZDtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUcsQ0FBQzs7bURBQ1Y7QUFJbEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O2lEQUNQO0FBSWhCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOztxREFDSDtBQUlwQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7b0RBQ0o7QUFJbkI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFHLENBQUM7O29EQUNUO0FBS25CO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzttREFDTDtBQUlsQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7a0RBQ047QUFJakI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7O3dEQUNKO0FBSXZCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOztpREFDTjtBQUlqQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQzs7aURBQ1Y7QUFJaEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O21EQUNMO0FBSWxCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOztvREFDSjtBQUtuQjtJQUhDLElBQUEsMEJBQWdCLEVBQUM7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNVLElBQUk7b0RBQUM7QUE5R1IsZ0JBQWdCO0lBRDVCLElBQUEsZ0JBQU0sRUFBQyxxQkFBcUIsQ0FBQztHQUNqQixnQkFBZ0IsQ0FpSDVCO0FBakhZLDRDQUFnQiJ9