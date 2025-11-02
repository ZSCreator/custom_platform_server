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
exports.WalletRecord = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let WalletRecord = class WalletRecord {
    initCreateDate() {
        this.createDate = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WalletRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], WalletRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    __metadata("design:type", Number)
], WalletRecord.prototype, "op_type", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    __metadata("design:type", Number)
], WalletRecord.prototype, "changed_gold", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    __metadata("design:type", Number)
], WalletRecord.prototype, "curr_gold", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    __metadata("design:type", Number)
], WalletRecord.prototype, "curr_wallet_gold", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], WalletRecord.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WalletRecord.prototype, "initCreateDate", null);
WalletRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_WalletRecord")
], WalletRecord);
exports.WalletRecord = WalletRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FsbGV0UmVjb3JkLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9XYWxsZXRSZWNvcmQuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUE2RjtBQUM3RixxREFBeUM7QUFLekMsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtJQWdDYixjQUFjO1FBRWxCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0NBSUosQ0FBQTtBQXBDRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O3dDQUNkO0FBS1g7SUFEQyxJQUFBLGdCQUFNLEdBQUU7O3lDQUNHO0FBSVo7SUFEQyxJQUFBLGdCQUFNLEVBQUMsS0FBSyxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOzs2Q0FDYjtBQUloQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxLQUFLLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O2tEQUNSO0FBSXJCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEtBQUssRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7K0NBQ1g7QUFJbEI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsS0FBSyxFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOztzREFDSjtBQUt6QjtJQUZDLElBQUEsZ0JBQU0sR0FBRTtJQUNSLElBQUEsd0JBQU0sR0FBRTs4QkFDRyxJQUFJO2dEQUFDO0FBR2pCO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7O2tEQUlkO0FBbkNRLFlBQVk7SUFEeEIsSUFBQSxnQkFBTSxFQUFDLGlCQUFpQixDQUFDO0dBQ2IsWUFBWSxDQXVDeEI7QUF2Q1ksb0NBQVkifQ==