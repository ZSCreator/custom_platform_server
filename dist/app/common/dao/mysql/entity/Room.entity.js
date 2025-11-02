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
exports.Room = void 0;
const typeorm_1 = require("typeorm");
let Room = class Room {
    beforeInsert() {
        this.createTime = new Date();
    }
    beforeUpdate() {
        this.updateTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Room.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "backend_server_id",
        comment: "后端服务器编号"
    }),
    __metadata("design:type", String)
], Room.prototype, "serverId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "game_id",
        length: 5,
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], Room.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "scene_id",
        comment: "场编号"
    }),
    __metadata("design:type", Number)
], Room.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "room_id",
        comment: "房间编号"
    }),
    __metadata("design:type", String)
], Room.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "基础奖池"
    }),
    __metadata("design:type", Number)
], Room.prototype, "jackpot", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "running_pool",
        default: 0,
        comment: "流水池"
    }),
    __metadata("design:type", Number)
], Room.prototype, "runningPool", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "profit_pool",
        default: 0,
        comment: "盈利池"
    }),
    __metadata("design:type", Number)
], Room.prototype, "profitPool", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: true,
        comment: "是否开放"
    }),
    __metadata("design:type", Boolean)
], Room.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)("json", {
        name: "jackpot_show",
        comment: "奖池显示配置",
        nullable: true
    }),
    __metadata("design:type", Object)
], Room.prototype, "jackpotShow", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "create_datetime",
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], Room.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "update_datetime",
        nullable: true,
        comment: "最近修改时间"
    }),
    __metadata("design:type", Date)
], Room.prototype, "updateTime", void 0);
__decorate([
    (0, typeorm_1.Column)('json', {
        name: "room_history",
        nullable: true,
        comment: "房间记录"
    }),
    __metadata("design:type", Object)
], Room.prototype, "history", void 0);
__decorate([
    (0, typeorm_1.Column)('json', {
        nullable: true,
        comment: "扩展字段"
    }),
    __metadata("design:type", Object)
], Room.prototype, "extension", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Room.prototype, "beforeInsert", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Room.prototype, "beforeUpdate", null);
__decorate([
    (0, typeorm_1.Column)("int", {
        name: "kind",
        comment: "租户隔离分组",
        default: 0,
    }),
    __metadata("design:type", Number)
], Room.prototype, "kind", void 0);
Room = __decorate([
    (0, typeorm_1.Entity)("Sys_Room")
], Room);
exports.Room = Room;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbS5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvUm9vbS5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQXdHO0FBR3hHLElBQWEsSUFBSSxHQUFqQixNQUFhLElBQUk7SUEwRkwsWUFBWTtRQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUdPLFlBQVk7UUFDaEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FRSixDQUFBO0FBdEdHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7Z0NBQ2Q7QUFNWDtJQUpDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixJQUFJLEVBQUUsbUJBQW1CO1FBQ3pCLE9BQU8sRUFBRSxTQUFTO0tBQ3JCLENBQUM7O3NDQUNlO0FBT2pCO0lBTEMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsTUFBTSxFQUFFLENBQUM7UUFDVCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOztpQ0FDVTtBQU1aO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7cUNBQ2M7QUFNaEI7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOztvQ0FDYTtBQU1mO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOztxQ0FDYztBQU9oQjtJQUxDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxjQUFjO1FBQ3BCLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7eUNBQ2tCO0FBT3BCO0lBTEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLGFBQWE7UUFDbkIsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOzt3Q0FDaUI7QUFNbkI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O2tDQUNZO0FBT2Q7SUFMQyxJQUFBLGdCQUFNLEVBQUMsTUFBTSxFQUFFO1FBQ1osSUFBSSxFQUFFLGNBQWM7UUFDcEIsT0FBTyxFQUFFLFFBQVE7UUFDakIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs7eUNBQ2U7QUFNakI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OEJBQ1UsSUFBSTt3Q0FBQztBQU9qQjtJQUxDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsUUFBUTtLQUNwQixDQUFDOzhCQUNVLElBQUk7d0NBQUM7QUFPakI7SUFMQyxJQUFBLGdCQUFNLEVBQUMsTUFBTSxFQUFDO1FBQ1gsSUFBSSxFQUFFLGNBQWM7UUFDcEIsUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOztxQ0FDVztBQU1iO0lBSkMsSUFBQSxnQkFBTSxFQUFDLE1BQU0sRUFBQztRQUNYLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7dUNBQ2E7QUFHZjtJQURDLElBQUEsc0JBQVksR0FBRTs7Ozt3Q0FHZDtBQUdEO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7O3dDQUdkO0FBT0Q7SUFMQyxJQUFBLGdCQUFNLEVBQUMsS0FBSyxFQUFDO1FBQ1YsSUFBSSxFQUFFLE1BQU07UUFDWixPQUFPLEVBQUUsUUFBUTtRQUNqQixPQUFPLEVBQUUsQ0FBQztLQUNiLENBQUM7O2tDQUNXO0FBeEdKLElBQUk7SUFEaEIsSUFBQSxnQkFBTSxFQUFDLFVBQVUsQ0FBQztHQUNOLElBQUksQ0F5R2hCO0FBekdZLG9CQUFJIn0=