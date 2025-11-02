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
exports.SumTenantOperationalData = void 0;
const typeorm_1 = require("typeorm");
let SumTenantOperationalData = class SumTenantOperationalData {
    init() {
        this.createDateTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 8,
        comment: "player_agent 表 uid"
    }),
    __metadata("design:type", String)
], SumTenantOperationalData.prototype, "fk_uid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 50,
        comment: "租客的备注信息"
    }),
    __metadata("design:type", String)
], SumTenantOperationalData.prototype, "groupRemark", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "注单量"
    }),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "recordCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "有效投注额"
    }),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "validBetTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "赢单额"
    }),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "winCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "赢单量"
    }),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "winTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "输单量"
    }),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "loseTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "游戏输赢"
    }),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "profitTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "下注"
    }),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "bet_commissionTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "赢取"
    }),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "win_commissionTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "结算"
    }),
    __metadata("design:type", Number)
], SumTenantOperationalData.prototype, "settle_commissionTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "汇总日期"
    }),
    __metadata("design:type", Date)
], SumTenantOperationalData.prototype, "sumDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "上级uid "
    }),
    __metadata("design:type", String)
], SumTenantOperationalData.prototype, "parentUid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "nid"
    }),
    __metadata("design:type", String)
], SumTenantOperationalData.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "游戏名称"
    }),
    __metadata("design:type", String)
], SumTenantOperationalData.prototype, "gameName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], SumTenantOperationalData.prototype, "createDateTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SumTenantOperationalData.prototype, "init", null);
SumTenantOperationalData = __decorate([
    (0, typeorm_1.Entity)("Sum_TenantOperationalData")
], SumTenantOperationalData);
exports.SumTenantOperationalData = SumTenantOperationalData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3VtVGVuYW50T3BlcmF0aW9uYWxEYXRhLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9TdW1UZW5hbnRPcGVyYXRpb25hbERhdGEuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUEwSDtBQU0xSCxJQUFjLHdCQUF3QixHQUF0QyxNQUFjLHdCQUF3QjtJQWdHMUIsSUFBSTtRQUNSLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0NBQ0osQ0FBQTtBQWpHRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O29EQUNkO0FBTVg7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLENBQUM7UUFDVCxPQUFPLEVBQUUsb0JBQW9CO0tBQ2hDLENBQUM7O3dEQUNhO0FBTWY7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLEVBQUU7UUFDVixPQUFPLEVBQUUsU0FBUztLQUNyQixDQUFDOzs2REFDa0I7QUFNcEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7OzZEQUNrQjtBQU1wQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLE9BQU87S0FDbkIsQ0FBQzs7K0RBQ29CO0FBTXRCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOzswREFDZTtBQU1qQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7MERBQ2U7QUFNakI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7OzJEQUNnQjtBQU1sQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7NkRBQ2tCO0FBTXBCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUUsSUFBSTtLQUNoQixDQUFDOztxRUFDMEI7QUFNNUI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRSxJQUFJO0tBQ2hCLENBQUM7O3FFQUMwQjtBQU01QjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLElBQUk7S0FDaEIsQ0FBQzs7d0VBQzZCO0FBSy9CO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs4QkFDTyxJQUFJO3lEQUFDO0FBS2Q7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzsyREFDZ0I7QUFLbEI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOztxREFDVTtBQUtaO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7MERBQ2U7QUFLakI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNjLElBQUk7Z0VBQUM7QUFHckI7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7b0RBR2Q7QUFsR1Msd0JBQXdCO0lBRHJDLElBQUEsZ0JBQU0sRUFBQywyQkFBMkIsQ0FBQztHQUN0Qix3QkFBd0IsQ0FtR3JDO0FBbkdhLDREQUF3QiJ9