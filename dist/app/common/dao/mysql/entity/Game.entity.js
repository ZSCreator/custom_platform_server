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
exports.Game = void 0;
const typeorm_1 = require("typeorm");
let Game = class Game {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Game.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "game_id",
        length: 5,
        unique: true,
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], Game.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "name_en",
        length: 50,
        comment: "游戏英文名"
    }),
    __metadata("design:type", String)
], Game.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "name_zh",
        length: 12,
        comment: "游戏中文名"
    }),
    __metadata("design:type", String)
], Game.prototype, "zname", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", {
        default: 1,
        comment: "游戏是否处于开放状态: 0 关; 1 开;默认 开"
    }),
    __metadata("design:type", Boolean)
], Game.prototype, "opened", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", {
        default: 0,
        comment: "是否展示盘路列表: 0 关; 1 开;默认 关"
    }),
    __metadata("design:type", Boolean)
], Game.prototype, "whetherToShowGamingInfo", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", {
        default: 0,
        comment: "是否展示场列表: 0 关; 1 开;默认 关"
    }),
    __metadata("design:type", Boolean)
], Game.prototype, "whetherToShowScene", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", {
        default: 0,
        comment: "是否展示房间列表: 0 关; 1 开;默认 关"
    }),
    __metadata("design:type", Boolean)
], Game.prototype, "whetherToShowRoom", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "min_roomCount",
        type: "int",
        default: 1,
        comment: "房间数量: 默认1个"
    }),
    __metadata("design:type", Number)
], Game.prototype, "roomCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "max_playerCount_in_room",
        type: "int",
        default: 100,
        comment: "房间至多玩家数量: 默认100间"
    }),
    __metadata("design:type", Number)
], Game.prototype, "roomUserLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        default: 0,
        comment: "人工介入排序: 默认0"
    }),
    __metadata("design:type", Number)
], Game.prototype, "sort", void 0);
Game = __decorate([
    (0, typeorm_1.Entity)("Sys_Game")
], Game);
exports.Game = Game;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZS5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvR2FtZS5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQWlFO0FBS2pFLElBQWEsSUFBSSxHQUFqQixNQUFhLElBQUk7Q0F5RWhCLENBQUE7QUF0RUc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOztnQ0FDZDtBQVFYO0lBTkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsTUFBTSxFQUFFLENBQUM7UUFDVCxNQUFNLEVBQUUsSUFBSTtRQUNaLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O2lDQUNVO0FBT1o7SUFMQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxPQUFPO0tBQ25CLENBQUM7O2tDQUNXO0FBT2I7SUFMQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxPQUFPO0tBQ25CLENBQUM7O21DQUNZO0FBTWQ7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsMkJBQTJCO0tBQ3ZDLENBQUM7O29DQUNjO0FBTWhCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLHlCQUF5QjtLQUNyQyxDQUFDOztxREFDK0I7QUFNakM7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsd0JBQXdCO0tBQ3BDLENBQUM7O2dEQUMwQjtBQU01QjtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSx5QkFBeUI7S0FDckMsQ0FBQzs7K0NBQ3lCO0FBUTNCO0lBTkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLGVBQWU7UUFDckIsSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxZQUFZO0tBQ3hCLENBQUM7O3VDQUNnQjtBQVFsQjtJQU5DLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSx5QkFBeUI7UUFDL0IsSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUUsR0FBRztRQUNaLE9BQU8sRUFBRSxrQkFBa0I7S0FDOUIsQ0FBQzs7MkNBQ29CO0FBT3RCO0lBTEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxhQUFhO0tBQ3pCLENBQUM7O2tDQUNXO0FBeEVKLElBQUk7SUFEaEIsSUFBQSxnQkFBTSxFQUFDLFVBQVUsQ0FBQztHQUNOLElBQUksQ0F5RWhCO0FBekVZLG9CQUFJIn0=