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
exports.BonusPoolHistory = void 0;
const typeorm_1 = require("typeorm");
let BonusPoolHistory = class BonusPoolHistory {
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
], BonusPoolHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "game_id",
        length: 5,
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], BonusPoolHistory.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'game_name',
        length: 50,
        comment: '游戏名字'
    }),
    __metadata("design:type", String)
], BonusPoolHistory.prototype, "gameName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "scene_id",
        comment: "场编号"
    }),
    __metadata("design:type", Number)
], BonusPoolHistory.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "scene_name",
        length: 50,
        comment: "场名称"
    }),
    __metadata("design:type", String)
], BonusPoolHistory.prototype, "sceneName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池 当前金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPoolHistory.prototype, "bonus_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "调控池 当前金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPoolHistory.prototype, "control_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "盈利池 当前金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPoolHistory.prototype, "profit_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], BonusPoolHistory.prototype, "createDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "最近更新时间"
    }),
    __metadata("design:type", Date)
], BonusPoolHistory.prototype, "updateDateTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BonusPoolHistory.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BonusPoolHistory.prototype, "everyUpdate", null);
BonusPoolHistory = __decorate([
    (0, typeorm_1.Entity)("Sp_BonusPoolHistory")
], BonusPoolHistory);
exports.BonusPoolHistory = BonusPoolHistory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9udXNQb29sSGlzdG9yeS5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvQm9udXNQb29sSGlzdG9yeS5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQTRGO0FBRzVGLElBQWEsZ0JBQWdCLEdBQTdCLE1BQWEsZ0JBQWdCO0lBOERqQixXQUFXO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFHTyxXQUFXO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3JDLENBQUM7Q0FDSixDQUFBO0FBbkVHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7NENBQ2Q7QUFPWDtJQUxDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7NkNBQ1U7QUFPWjtJQUxDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsV0FBVztRQUNqQixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O2tEQUNlO0FBTWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7aURBQ2M7QUFPaEI7SUFMQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsSUFBSSxFQUFFLFlBQVk7UUFDbEIsTUFBTSxFQUFFLEVBQUU7UUFDVixPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOzttREFDZ0I7QUFNbEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsV0FBVztRQUNwQixPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7O3NEQUNtQjtBQU1yQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxVQUFVO1FBQ25CLE9BQU8sRUFBRSxDQUFDO0tBQ2IsQ0FBQzs7d0RBQ3FCO0FBTXZCO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLFVBQVU7UUFDbkIsT0FBTyxFQUFFLENBQUM7S0FDYixDQUFDOzt1REFDb0I7QUFLdEI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNjLElBQUk7d0RBQUM7QUFNckI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxRQUFRO0tBQ3BCLENBQUM7OEJBQ2MsSUFBSTt3REFBQztBQUdyQjtJQURDLElBQUEsc0JBQVksR0FBRTs7OzttREFHZDtBQUdEO0lBREMsSUFBQSxxQkFBVyxHQUFFOzs7O21EQUdiO0FBckVRLGdCQUFnQjtJQUQ1QixJQUFBLGdCQUFNLEVBQUMscUJBQXFCLENBQUM7R0FDakIsZ0JBQWdCLENBc0U1QjtBQXRFWSw0Q0FBZ0IifQ==