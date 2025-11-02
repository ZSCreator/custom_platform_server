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
exports.BonusPool = void 0;
const typeorm_1 = require("typeorm");
let BonusPool = class BonusPool {
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
], BonusPool.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "game_id",
        length: 5,
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], BonusPool.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        name: 'game_name',
        length: 50,
        comment: '游戏名字'
    }),
    __metadata("design:type", String)
], BonusPool.prototype, "gameName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "scene_id",
        comment: "场编号"
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "scene_name",
        length: 50,
        comment: "场名称"
    }),
    __metadata("design:type", String)
], BonusPool.prototype, "sceneName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池 当前金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池 初始金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_initAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池 下限金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_minAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池 金额减少时计算使用的系数",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_minParameter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池 上限金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_maxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池 金额增加时计算使用的系数",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_maxParameter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池 修正系数",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_poolCorrectedValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "最高储存金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_maxAmountInStore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "金额达到指定上限( bonus_maxAmountInStore )时,自动/手动 将多的部分转入\"调控池\"",
    }),
    __metadata("design:type", Boolean)
], BonusPool.prototype, "bonus_maxAmountInStoreSwitch", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池修正值 下限",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_minBonusPoolCorrectedValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "公共奖池修正值 上限",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_maxBonusPoolCorrectedValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "房间个人基准值",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "bonus_personalReferenceValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "调控池 当前金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "control_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "盈利池 当前金额",
        default: 0,
    }),
    __metadata("design:type", Number)
], BonusPool.prototype, "profit_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "是否定时自动更新",
    }),
    __metadata("design:type", Boolean)
], BonusPool.prototype, "autoUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "奖池是否被锁定 被锁定则奖池修正值则不再变化",
    }),
    __metadata("design:type", Boolean)
], BonusPool.prototype, "lockJackpot", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "最近更新 id",
    }),
    __metadata("design:type", String)
], BonusPool.prototype, "lastUpdateUUID", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], BonusPool.prototype, "createDateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "最近更新时间"
    }),
    __metadata("design:type", Date)
], BonusPool.prototype, "updateDateTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BonusPool.prototype, "firstInsert", null);
__decorate([
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BonusPool.prototype, "everyUpdate", null);
BonusPool = __decorate([
    (0, typeorm_1.Entity)("Sp_BonusPool")
], BonusPool);
exports.BonusPool = BonusPool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9udXNQb29sLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9Cb251c1Bvb2wuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLHFDQUE0RjtBQUc1RixJQUFhLFNBQVMsR0FBdEIsTUFBYSxTQUFTO0lBOElWLFdBQVc7UUFDZixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUdPLFdBQVc7UUFDZixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckMsQ0FBQztDQUNKLENBQUE7QUFuSkc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztxQ0FDZDtBQU9YO0lBTEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsTUFBTSxFQUFFLENBQUM7UUFDVCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOztzQ0FDVTtBQU9aO0lBTEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxXQUFXO1FBQ2pCLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7MkNBQ2U7QUFNakI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOzswQ0FDYztBQU9oQjtJQUxDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsWUFBWTtRQUNsQixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7OzRDQUNnQjtBQU1sQjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLE9BQU8sRUFBRSxDQUFDO0tBQ2Is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