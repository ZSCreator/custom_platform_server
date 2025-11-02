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
exports.Player = void 0;
const typeorm_1 = require("typeorm");
const RoleEnum_1 = require("../../../constant/player/RoleEnum");
const class_validator_1 = require("class-validator");
const PositionEnum_1 = require("../../../constant/player/PositionEnum");
const hallConst_1 = require("../../../../consts/hallConst");
let Player = class Player {
    afterLoad() {
        this.oneWin = 0;
        this.onLine = false;
        this.isOnLine = false;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Player.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)("varchar", {
        name: "pk_uid",
        length: 8,
        unique: true
    }),
    __metadata("design:type", String)
], Player.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 50, nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "thirdUid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 50, nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 50, nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "lineCode", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "myGames", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 15 }),
    __metadata("design:type", String)
], Player.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { length: 10 }),
    __metadata("design:type", String)
], Player.prototype, "headurl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], Player.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0
    }),
    __metadata("design:type", Number)
], Player.prototype, "addDayRmb", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0
    }),
    __metadata("design:type", Number)
], Player.prototype, "addRmb", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0
    }),
    __metadata("design:type", Number)
], Player.prototype, "addTixian", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0
    }),
    __metadata("design:type", Number)
], Player.prototype, "addDayTixian", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], Player.prototype, "oneAddRmb", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0
    }),
    __metadata("design:type", Number)
], Player.prototype, "oneWin", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        default: hallConst_1.LANGUAGE.DEFAULT,
        length: 15
    }),
    __metadata("design:type", String)
], Player.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        nullable: true,
        length: 10
    }),
    __metadata("design:type", String)
], Player.prototype, "superior", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        nullable: true, length: 10
    }),
    __metadata("design:type", String)
], Player.prototype, "group_id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        nullable: true, length: 20
    }),
    __metadata("design:type", String)
], Player.prototype, "groupRemark", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Player.prototype, "loginTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Player.prototype, "lastLogoutTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], Player.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        comment: "最近修改时间"
    }),
    __metadata("design:type", Date)
], Player.prototype, "updateTime", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        default: RoleEnum_1.RoleEnum.REAL_PLAYER
    }),
    __metadata("design:type", Number)
], Player.prototype, "isRobot", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "sid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "loginCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], Player.prototype, "kickedOutRoom", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], Player.prototype, "abnormalOffline", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: PositionEnum_1.PositionEnum.HALL }),
    __metadata("design:type", Number)
], Player.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Player.prototype, "closeTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "closeReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "dayMaxWin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, type: "double" }),
    __metadata("design:type", Number)
], Player.prototype, "dailyFlow", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, type: "double" }),
    __metadata("design:type", Number)
], Player.prototype, "flowCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        type: "double",
        comment: "提现码量:0表示未充值; 大于0表示需要打到的码量; 小于0 表示可提现"
    }),
    __metadata("design:type", Number)
], Player.prototype, "withdrawalChips", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        default: 0
    }),
    __metadata("design:type", Number)
], Player.prototype, "instantNetProfit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "walletGold", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "rom_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "shareUid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "" }),
    __metadata("design:type", String)
], Player.prototype, "guestid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "" }),
    __metadata("design:type", String)
], Player.prototype, "cellPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Player.prototype, "passWord", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "maxBetGold", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "earlyWarningGold", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], Player.prototype, "earlyWarningFlag", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Player.prototype, "entryGold", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Boolean)
], Player.prototype, "kickself", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "vip等级"
    }),
    __metadata("design:type", Number)
], Player.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.AfterLoad)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Player.prototype, "afterLoad", null);
Player = __decorate([
    (0, typeorm_1.Entity)("Sp_Player")
], Player);
exports.Player = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9QbGF5ZXIuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUErSDtBQUMvSCxnRUFBNkQ7QUFDN0QscURBQTZDO0FBQzdDLHdFQUFxRTtBQUNyRSw0REFBd0Q7QUFHeEQsSUFBYSxNQUFNLEdBQW5CLE1BQWEsTUFBTTtJQXNXUCxTQUFTO1FBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQztDQU1KLENBQUE7QUE3V0c7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztrQ0FDZDtBQVVYO0lBTEMsSUFBQSx1QkFBYSxFQUFDLFNBQVMsRUFBRTtRQUN0QixJQUFJLEVBQUUsUUFBUTtRQUNkLE1BQU0sRUFBRSxDQUFDO1FBQ1QsTUFBTSxFQUFFLElBQUk7S0FDZixDQUFDOzttQ0FDVTtBQU1aO0lBREMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDOzt3Q0FDakM7QUFNakI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7O3NDQUNuQztBQU1mO0lBREMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDOzt3Q0FDakM7QUFNakI7SUFEQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFD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