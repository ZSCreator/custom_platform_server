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
exports.VipBonusDetails = void 0;
const typeorm_1 = require("typeorm");
let VipBonusDetails = class VipBonusDetails {
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
], VipBonusDetails.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        comment: "玩家编号"
    }),
    __metadata("design:type", String)
], VipBonusDetails.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "vip等级",
        default: 0
    }),
    __metadata("design:type", Number)
], VipBonusDetails.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "vip等级奖励",
        default: 0
    }),
    __metadata("design:type", Number)
], VipBonusDetails.prototype, "bonus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "是否领取vip等级奖励 0 否 1 是",
        default: 0
    }),
    __metadata("design:type", Number)
], VipBonusDetails.prototype, "whetherToReceiveLeverBonus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "周签到奖励",
        default: 0
    }),
    __metadata("design:type", Number)
], VipBonusDetails.prototype, "bonusForWeeks", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "最近一次周签到奖励时间",
        nullable: true
    }),
    __metadata("design:type", Date)
], VipBonusDetails.prototype, "bonusForWeeksLastDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "月签到奖励",
        default: 0
    }),
    __metadata("design:type", Number)
], VipBonusDetails.prototype, "bonusForMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "最近一次月签到奖励时间",
        nullable: true
    }),
    __metadata("design:type", Date)
], VipBonusDetails.prototype, "bonusForMonthLastDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], VipBonusDetails.prototype, "createDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "最近更新时间"
    }),
    __metadata("design:type", Date)
], VipBonusDetails.prototype, "updateDateTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VipBonusDetails.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VipBonusDetails.prototype, "everyUpdate", null);
VipBonusDetails = __decorate([
    (0, typeorm_1.Entity)("Sp_VipBonusDetails")
], VipBonusDetails);
exports.VipBonusDetails = VipBonusDetails;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlwQm9udXNEZXRhaWxzLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9WaXBCb251c0RldGFpbHMuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUE0RjtBQUc1RixJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBbUVoQixXQUFXO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFHTyxXQUFXO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3JDLENBQUM7Q0FDSixDQUFBO0FBeEVHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7MkNBQ2Q7QUFRWDtJQUhDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzs0Q0FDVTtBQU1aO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLE9BQU87UUFDaEIsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzs4Q0FDWTtBQU1kO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLFNBQVM7UUFDbEIsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzs4Q0FDWTtBQU1kO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLHFCQUFxQjtRQUM5QixPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7O21FQUNpQztBQU1uQztJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQzs7c0RBQ29CO0FBTXRCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLGFBQWE7UUFDdEIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs4QkFDcUIsSUFBSTs4REFBQztBQU01QjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQzs7c0RBQ29CO0FBTXRCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLGFBQWE7UUFDdEIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs4QkFDcUIsSUFBSTs4REFBQztBQUs1QjtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OEJBQ2MsSUFBSTt1REFBQztBQU1yQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLFFBQVE7S0FDcEIsQ0FBQzs4QkFDYyxJQUFJO3VEQUFDO0FBR3JCO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7O2tEQUdkO0FBR0Q7SUFEQyxJQUFBLHFCQUFXLEdBQUU7Ozs7a0RBR2I7QUExRVEsZUFBZTtJQUQzQixJQUFBLGdCQUFNLEVBQUMsb0JBQW9CLENBQUM7R0FDaEIsZUFBZSxDQTJFM0I7QUEzRVksMENBQWUifQ==