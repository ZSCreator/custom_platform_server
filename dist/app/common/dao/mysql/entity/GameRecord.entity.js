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
exports.GameRecord = void 0;
const typeorm_1 = require("typeorm");
const GameRecordStatus_enum_1 = require("../enum/GameRecordStatus.enum");
let GameRecord = class GameRecord {
    init() {
        this.createTimeDate = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GameRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)("varchar", {
        length: 10,
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], GameRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)("varchar", {
        length: 50,
        nullable: true,
        comment: "第三方账号"
    }),
    __metadata("design:type", String)
], GameRecord.prototype, "thirdUid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 50,
        comment: "游戏名字"
    }),
    __metadata("design:type", String)
], GameRecord.prototype, "gameName", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)("varchar", {
        length: 50,
        nullable: true,
        comment: "租客的备注信息"
    }),
    __metadata("design:type", String)
], GameRecord.prototype, "groupRemark", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "game_id",
        length: 5,
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], GameRecord.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "场编号"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 10,
        comment: "房间编号"
    }),
    __metadata("design:type", String)
], GameRecord.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "游戏类型:1电玩类,2:百人类,3:对战类"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "gameType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "round_id",
        nullable: true,
        comment: "游戏该局编号"
    }),
    __metadata("design:type", String)
], GameRecord.prototype, "roundId", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", {
        default: 0,
        comment: "是否庄家: 0 关；1 开； 默认关"
    }),
    __metadata("design:type", Boolean)
], GameRecord.prototype, "isDealer", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "game_results",
        length: 255,
        nullable: true,
        default: "",
        comment: "对局结果"
    }),
    __metadata("design:type", String)
], GameRecord.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0,
        comment: "玩家此时金币携带量"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0,
        comment: "下注额"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "input", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0,
        comment: "有效下注额"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "validBet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0,
        comment: "纯利"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "profit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0,
        comment: "下注佣金"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "bet_commission", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0,
        comment: "赢取佣金"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "win_commission", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0,
        comment: "结算佣金"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "settle_commission", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0,
        comment: "盈利倍数"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "multiple", void 0);
__decorate([
    (0, typeorm_1.Column)("int", {
        default: GameRecordStatus_enum_1.GameRecordStatusEnum.None,
        comment: "记录状态: 0 为生效；1 生效"
    }),
    __metadata("design:type", Number)
], GameRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)("varchar", {
        nullable: true,
        name: "game_order_id",
        comment: "订单编号"
    }),
    __metadata("design:type", String)
], GameRecord.prototype, "gameOrder", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], GameRecord.prototype, "createTimeDate", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        nullable: true,
        comment: "最近修改时间"
    }),
    __metadata("design:type", Date)
], GameRecord.prototype, "updateTime", void 0);
__decorate([
    (0, typeorm_1.Column)("json", { nullable: true }),
    __metadata("design:type", Object)
], GameRecord.prototype, "game_Records_live_result", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GameRecord.prototype, "init", null);
GameRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_GameRecord")
], GameRecord);
exports.GameRecord = GameRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJlY29yZC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvR2FtZVJlY29yZC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQTBIO0FBRzFILHlFQUFxRTtBQUtyRSxJQUFhLFVBQVUsR0FBdkIsTUFBYSxVQUFVO0lBd0tYLElBQUk7UUFDUixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckMsQ0FBQztDQUVKLENBQUE7QUF6S0c7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztzQ0FDZDtBQU1YO0lBTEMsSUFBQSxlQUFLLEdBQUU7SUFDUCxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLEVBQUU7UUFDVixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzt1Q0FDVTtBQVFaO0lBTkMsSUFBQSxlQUFLLEdBQUU7SUFDUCxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLEVBQUU7UUFDVixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxPQUFPO0tBQ25CLENBQUM7OzRDQUNlO0FBTWpCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7NENBQ2U7QUFPakI7SUFOQyxJQUFBLGVBQUssR0FBRTtJQUNQLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLFNBQVM7S0FDckIsQ0FBQzs7K0NBQ2tCO0FBT3BCO0lBTEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsTUFBTSxFQUFFLENBQUM7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