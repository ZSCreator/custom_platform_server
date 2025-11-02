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
exports.VipConfig = void 0;
const typeorm_1 = require("typeorm");
let VipConfig = class VipConfig {
    firstInsert() {
        this.createDateTime = new Date();
    }
    everyUpdate() {
        this.updateDateTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VipConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "vip等级"
    }),
    __metadata("design:type", Number)
], VipConfig.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 50,
        comment: '中文说明'
    }),
    __metadata("design:type", String)
], VipConfig.prototype, "des", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "达到当前vip等级的充值要求"
    }),
    __metadata("design:type", Number)
], VipConfig.prototype, "levelScore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "vip等级奖励"
    }),
    __metadata("design:type", Number)
], VipConfig.prototype, "bonus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "当前vip等级每周签到奖励",
    }),
    __metadata("design:type", Number)
], VipConfig.prototype, "bonusForWeeks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "当前vip等级每月签到奖励",
    }),
    __metadata("design:type", Number)
], VipConfig.prototype, "bonusForMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], VipConfig.prototype, "createDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "最近更新时间"
    }),
    __metadata("design:type", Date)
], VipConfig.prototype, "updateDateTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VipConfig.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VipConfig.prototype, "everyUpdate", null);
VipConfig = __decorate([
    (0, typeorm_1.Entity)("Sp_VipConfig")
], VipConfig);
exports.VipConfig = VipConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlwQ29uZmlnLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9WaXBDb25maWcuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUE0RjtBQUc1RixJQUFhLFNBQVMsR0FBdEIsTUFBYSxTQUFTO0lBZ0RWLFdBQVc7UUFDZixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUdPLFdBQVc7UUFDZixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckMsQ0FBQztDQUNKLENBQUE7QUFyREc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztxQ0FDZDtBQUtYO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLE9BQU87S0FDbkIsQ0FBQzs7d0NBQ1k7QUFNZDtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O3NDQUNVO0FBS1o7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsZ0JBQWdCO0tBQzVCLENBQUM7OzZDQUNpQjtBQUtuQjtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxTQUFTO0tBQ3JCLENBQUM7O3dDQUNZO0FBS2Q7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsZUFBZTtLQUMzQixDQUFDOztnREFDb0I7QUFLdEI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsZUFBZTtLQUMzQixDQUFDOztnREFDb0I7QUFLdEI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNjLElBQUk7aURBQUM7QUFNckI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxRQUFRO0tBQ3BCLENBQUM7OEJBQ2MsSUFBSTtpREFBQztBQUdyQjtJQURDLElBQUEsc0JBQVksR0FBRTs7Ozs0Q0FHZDtBQUdEO0lBREMsSUFBQSxxQkFBVyxHQUFFOzs7OzRDQUdiO0FBdkRRLFNBQVM7SUFEckIsSUFBQSxnQkFBTSxFQUFDLGNBQWMsQ0FBQztHQUNWLFNBQVMsQ0F3RHJCO0FBeERZLDhCQUFTIn0=