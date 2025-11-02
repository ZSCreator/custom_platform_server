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
exports.GameCommission = void 0;
const typeorm_1 = require("typeorm");
const GameCommissionTargetObjectEnum_1 = require("../../../constant/hall/GameCommissionTargetObjectEnum");
const GameCommissionWayEnum_1 = require("../../../constant/hall/GameCommissionWayEnum");
let GameCommission = class GameCommission {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GameCommission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], GameCommission.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: GameCommissionWayEnum_1.GameCommissionWayEnum.None,
        comment: "佣金方式"
    }),
    __metadata("design:type", Number)
], GameCommission.prototype, "way", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: GameCommissionTargetObjectEnum_1.GameCommissionTargetObjectEnum.Player,
        comment: "佣金对象"
    }),
    __metadata("design:type", Number)
], GameCommission.prototype, "targetCharacter", void 0);
__decorate([
    (0, typeorm_1.Column)("double", {
        default: 0,
        comment: "下注佣金比例比例 0-1"
    }),
    __metadata("design:type", Number)
], GameCommission.prototype, "bet", void 0);
__decorate([
    (0, typeorm_1.Column)("double", {
        default: 0,
        comment: "赢取比例 0-1"
    }),
    __metadata("design:type", Number)
], GameCommission.prototype, "win", void 0);
__decorate([
    (0, typeorm_1.Column)("double", {
        default: 0,
        comment: "结算比例 0-1"
    }),
    __metadata("design:type", Number)
], GameCommission.prototype, "settle", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "是否开启: 0 关; 1 开; 默认关"
    }),
    __metadata("design:type", Boolean)
], GameCommission.prototype, "open", void 0);
GameCommission = __decorate([
    (0, typeorm_1.Entity)("Sp_GameCommission")
], GameCommission);
exports.GameCommission = GameCommission;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZUNvbW1pc3Npb24uZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L0dhbWVDb21taXNzaW9uLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBaUU7QUFDakUsMEdBQXVHO0FBQ3ZHLHdGQUFxRjtBQUtyRixJQUFhLGNBQWMsR0FBM0IsTUFBYSxjQUFjO0NBOEMxQixDQUFBO0FBM0NHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7MENBQ2Q7QUFLWDtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OzJDQUNVO0FBTVo7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsNkNBQXFCLENBQUMsSUFBSTtRQUNuQyxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzsyQ0FDVTtBQU1aO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLCtEQUE4QixDQUFDLE1BQU07UUFDOUMsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7dURBQ3NCO0FBTXhCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFFBQVEsRUFBRTtRQUNkLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLGNBQWM7S0FDMUIsQ0FBQzs7MkNBQ1U7QUFNWjtJQUpDLElBQUEsZ0JBQU0sRUFBQyxRQUFRLEVBQUU7UUFDZCxPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxVQUFVO0tBQ3RCLENBQUM7OzJDQUNVO0FBTVo7SUFKQyxJQUFBLGdCQUFNLEVBQUMsUUFBUSxFQUFFO1FBQ2QsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsVUFBVTtLQUN0QixDQUFDOzs4Q0FDYTtBQU1mO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUMscUJBQXFCO0tBQ2hDLENBQUM7OzRDQUNZO0FBNUNMLGNBQWM7SUFEMUIsSUFBQSxnQkFBTSxFQUFDLG1CQUFtQixDQUFDO0dBQ2YsY0FBYyxDQThDMUI7QUE5Q1ksd0NBQWMifQ==