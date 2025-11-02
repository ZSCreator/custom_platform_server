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
exports.MailRecord = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let MailRecord = class MailRecord {
    initCreateDate() {
        this.createDate = new Date();
    }
    updateDate() {
        this.updatedDate = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MailRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MailRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MailRecord.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MailRecord.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MailRecord.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MailRecord.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MailRecord.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MailRecord.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MailRecord.prototype, "isDelete", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], MailRecord.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], MailRecord.prototype, "updatedDate", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MailRecord.prototype, "initCreateDate", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MailRecord.prototype, "updateDate", null);
MailRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_MailRecord")
], MailRecord);
exports.MailRecord = MailRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbFJlY29yZC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvTWFpbFJlY29yZC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQTZGO0FBQzdGLHFEQUF5QztBQUt6QyxJQUFhLFVBQVUsR0FBdkIsTUFBYSxVQUFVO0lBZ0RYLGNBQWM7UUFFbEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFHTyxVQUFVO1FBQ2QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2xDLENBQUM7Q0FFSixDQUFBO0FBdkRHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7c0NBQ2Q7QUFJWDtJQURDLElBQUEsZ0JBQU0sR0FBRTs7dUNBQ0c7QUFJWjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7MENBQ007QUFJZjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7d0NBQ1Y7QUFJYjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7d0NBQ0k7QUFJYjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7MkNBQ087QUFJaEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O3dDQUNWO0FBSWI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7OzBDQUNYO0FBSWhCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDOzs0Q0FDVDtBQUtsQjtJQUZDLElBQUEsZ0JBQU0sR0FBRTtJQUNSLElBQUEsd0JBQU0sR0FBRTs4QkFDRyxJQUFJOzhDQUFDO0FBS2pCO0lBRkMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO0lBQzFCLElBQUEsd0JBQU0sR0FBRTs4QkFDSSxJQUFJOytDQUFRO0FBR3pCO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7O2dEQUlkO0FBR0Q7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7NENBR2Q7QUF4RFEsVUFBVTtJQUR0QixJQUFBLGdCQUFNLEVBQUMsZUFBZSxDQUFDO0dBQ1gsVUFBVSxDQTBEdEI7QUExRFksZ0NBQVUifQ==