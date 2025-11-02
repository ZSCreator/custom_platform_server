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
exports.TenantControlTotalBetKill = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let TenantControlTotalBetKill = class TenantControlTotalBetKill {
    initCreateDate() {
        this.createDate = new Date();
        this.updatedDate = new Date();
    }
    updateDate() {
        this.updatedDate = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TenantControlTotalBetKill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TenantControlTotalBetKill.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TenantControlTotalBetKill.prototype, "totalBet", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], TenantControlTotalBetKill.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], TenantControlTotalBetKill.prototype, "updatedDate", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantControlTotalBetKill.prototype, "initCreateDate", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantControlTotalBetKill.prototype, "updateDate", null);
TenantControlTotalBetKill = __decorate([
    (0, typeorm_1.Entity)("Sp_TenantControlTotalBetKill")
], TenantControlTotalBetKill);
exports.TenantControlTotalBetKill = TenantControlTotalBetKill;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbFRvdGFsQmV0S2lsbC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvVGVuYW50Q29udHJvbFRvdGFsQmV0S2lsbC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQTZGO0FBQzdGLHFEQUF5QztBQU16QyxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUF5QjtJQTBCMUIsY0FBYztRQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFHTyxVQUFVO1FBQ2QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2xDLENBQUM7Q0FDSixDQUFBO0FBaENHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7cURBQ2Q7QUFNWDtJQURDLElBQUEsZ0JBQU0sR0FBRTs7eURBQ007QUFNZjtJQURDLElBQUEsZ0JBQU0sR0FBRTs7MkRBQ1E7QUFJakI7SUFGQyxJQUFBLGdCQUFNLEdBQUU7SUFDUixJQUFBLHdCQUFNLEdBQUU7OEJBQ0csSUFBSTs2REFBQztBQUlqQjtJQUZDLElBQUEsZ0JBQU0sR0FBRTtJQUNSLElBQUEsd0JBQU0sR0FBRTs4QkFDSSxJQUFJOzhEQUFRO0FBR3pCO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7OytEQUlkO0FBR0Q7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7MkRBR2Q7QUFsQ1EseUJBQXlCO0lBRHJDLElBQUEsZ0JBQU0sRUFBQyw4QkFBOEIsQ0FBQztHQUMxQix5QkFBeUIsQ0FtQ3JDO0FBbkNZLDhEQUF5QiJ9