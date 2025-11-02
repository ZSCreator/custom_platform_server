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
exports.TenantControlBetKill = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let TenantControlBetKill = class TenantControlBetKill {
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
], TenantControlBetKill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TenantControlBetKill.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TenantControlBetKill.prototype, "bet", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], TenantControlBetKill.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], TenantControlBetKill.prototype, "updatedDate", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantControlBetKill.prototype, "initCreateDate", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantControlBetKill.prototype, "updateDate", null);
TenantControlBetKill = __decorate([
    (0, typeorm_1.Entity)("Sp_TenantControlBetKill")
], TenantControlBetKill);
exports.TenantControlBetKill = TenantControlBetKill;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbEJldEtpbGwuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1RlbmFudENvbnRyb2xCZXRLaWxsLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBNkY7QUFDN0YscURBQXlDO0FBTXpDLElBQWEsb0JBQW9CLEdBQWpDLE1BQWEsb0JBQW9CO0lBb0JyQixjQUFjO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUdPLFVBQVU7UUFDZCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUNKLENBQUE7QUExQkc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztnREFDZDtBQUdYO0lBREMsSUFBQSxnQkFBTSxHQUFFOztvREFDTTtBQUdmO0lBREMsSUFBQSxnQkFBTSxHQUFFOztpREFDRztBQUlaO0lBRkMsSUFBQSxnQkFBTSxHQUFFO0lBQ1IsSUFBQSx3QkFBTSxHQUFFOzhCQUNHLElBQUk7d0RBQUM7QUFJakI7SUFGQyxJQUFBLGdCQUFNLEdBQUU7SUFDUixJQUFBLHdCQUFNLEdBQUU7OEJBQ0ksSUFBSTt5REFBUTtBQUd6QjtJQURDLElBQUEsc0JBQVksR0FBRTs7OzswREFJZDtBQUdEO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7O3NEQUdkO0FBNUJRLG9CQUFvQjtJQURoQyxJQUFBLGdCQUFNLEVBQUMseUJBQXlCLENBQUM7R0FDckIsb0JBQW9CLENBNkJoQztBQTdCWSxvREFBb0IifQ==