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
exports.Scene = void 0;
const typeorm_1 = require("typeorm");
let Scene = class Scene {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Scene.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "game_id",
        length: 5,
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], Scene.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "scene_id",
        comment: "场编号"
    }),
    __metadata("design:type", Number)
], Scene.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "scene_name",
        length: 50,
        comment: "场名称"
    }),
    __metadata("design:type", String)
], Scene.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "entry_cond_gold",
        default: -1,
        comment: "准入金额"
    }),
    __metadata("design:type", Number)
], Scene.prototype, "entryCond", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "lower_bet",
        default: 0,
        comment: "最低下注额"
    }),
    __metadata("design:type", Number)
], Scene.prototype, "lowBet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "upper_bet",
        nullable: true,
        comment: "最高下注额"
    }),
    __metadata("design:type", Number)
], Scene.prototype, "capBet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "all_in_max_num",
        nullable: true,
        comment: "全下上限"
    }),
    __metadata("design:type", Number)
], Scene.prototype, "allinMaxNum", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "room_count",
        default: 0,
        comment: "房间数量"
    }),
    __metadata("design:type", Number)
], Scene.prototype, "room_count", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "前注"
    }),
    __metadata("design:type", Number)
], Scene.prototype, "ante", void 0);
__decorate([
    (0, typeorm_1.Column)("json", {
        comment: "可以携带的金币",
        nullable: true
    }),
    __metadata("design:type", Object)
], Scene.prototype, "canCarryGold", void 0);
__decorate([
    (0, typeorm_1.Column)("json", {
        comment: "大、小盲",
        nullable: true
    }),
    __metadata("design:type", Object)
], Scene.prototype, "blindBet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "bullet_value",
        default: 0,
        comment: "子弹价值"
    }),
    __metadata("design:type", Number)
], Scene.prototype, "bullet_value", void 0);
Scene = __decorate([
    (0, typeorm_1.Entity)("Sys_Scene")
], Scene);
exports.Scene = Scene;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUuZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvZW50aXR5L1NjZW5lLmVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxQ0FBMEY7QUFHMUYsSUFBYSxLQUFLLEdBQWxCLE1BQWEsS0FBSztDQTJGakIsQ0FBQTtBQXhGRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O2lDQUNkO0FBVVg7SUFMQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixNQUFNLEVBQUUsQ0FBQztRQUNULE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O2tDQUNVO0FBTVo7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOztzQ0FDYztBQVVoQjtJQUxDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsWUFBWTtRQUNsQixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7O21DQUNXO0FBT2I7SUFMQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDWCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzt3Q0FDZ0I7QUFPbEI7SUFMQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsV0FBVztRQUNqQixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxPQUFPO0tBQ25CLENBQUM7O3FDQUNhO0FBT2Y7SUFMQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsV0FBVztRQUNqQixRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxPQUFPO0tBQ25CLENBQUM7O3FDQUNhO0FBT2Y7SUFMQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7MENBQ2tCO0FBT3BCO0lBTEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLFlBQVk7UUFDbEIsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzt5Q0FDaUI7QUFNbkI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxJQUFJO0tBQ2hCLENBQUM7O21DQUNXO0FBTWI7SUFKQyxJQUFBLGdCQUFNLEVBQUMsTUFBTSxFQUFFO1FBQ1osT0FBTyxFQUFFLFNBQVM7UUFDbEIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs7MkNBQ2dCO0FBTWxCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLE1BQU0sRUFBRTtRQUNaLE9BQU8sRUFBRSxNQUFNO1FBQ2YsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs7dUNBQ1k7QUFPZDtJQUxDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxjQUFjO1FBQ3BCLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7MkNBQ21CO0FBekZaLEtBQUs7SUFEakIsSUFBQSxnQkFBTSxFQUFDLFdBQVcsQ0FBQztHQUNQLEtBQUssQ0EyRmpCO0FBM0ZZLHNCQUFLIn0=