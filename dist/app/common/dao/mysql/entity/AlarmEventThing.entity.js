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
exports.AlarmEventThing = void 0;
const typeorm_1 = require("typeorm");
let AlarmEventThing = class AlarmEventThing {
    initCreateDate() {
        this.createDate = new Date();
    }
    updateDate() {
        this.updatedDate = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "fk_uid",
        comment: "玩家编号"
    }),
    __metadata("design:type", String)
], AlarmEventThing.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "第三方uid",
        length: 50,
        nullable: true
    }),
    __metadata("design:type", String)
], AlarmEventThing.prototype, "thirdUid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "游戏名称"
    }),
    __metadata("design:type", String)
], AlarmEventThing.prototype, "gameName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], AlarmEventThing.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 1,
        comment: "报警事件: 1 为玩家事件 2 为游戏启动事件"
    }),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "thingType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "玩家事件类型: 1为单次下注大于; 2 为赢取大于; 3 为赢取/带入大于"
    }),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "报警事件是否已经处理: 0 为未处理; 1 为已处理;"
    }),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "下注金额,单位为分"
    }),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "input", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "赢取金额,单位为分"
    }),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "win", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "带入一次的累计赢取金额,单位为分"
    }),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "oneWin", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "最近一次带入金额,单位为分"
    }),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "oneAddRmb", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        comment: "当日累计赢取金额"
    }),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "dayWin", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "场编号"
    }),
    __metadata("design:type", Number)
], AlarmEventThing.prototype, "sceneId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "处理人"
    }),
    __metadata("design:type", String)
], AlarmEventThing.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], AlarmEventThing.prototype, "createDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], AlarmEventThing.prototype, "updatedDate", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AlarmEventThing.prototype, "initCreateDate", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AlarmEventThing.prototype, "updateDate", null);
AlarmEventThing = __decorate([
    (0, typeorm_1.Entity)("Sp_AlarmEventThing")
], AlarmEventThing);
exports.AlarmEventThing = AlarmEventThing;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxhcm1FdmVudFRoaW5nLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9BbGFybUV2ZW50VGhpbmcuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUE2RjtBQUs3RixJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBOEZoQixjQUFjO1FBRWxCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBR08sVUFBVTtRQUNkLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0NBRUosQ0FBQTtBQXJHRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7OzJDQUNkO0FBTVg7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzs0Q0FDVTtBQU9aO0lBTEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLFFBQVE7UUFDakIsTUFBTSxFQUFFLEVBQUU7UUFDVixRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFDOztpREFDZTtBQUtqQjtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O2lEQUNlO0FBS2pCO0lBSEMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLE1BQU07S0FDbEIsQ0FBQzs7NENBQ1U7QUFNWjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLHlCQUF5QjtLQUNyQyxDQUFDOztrREFDZ0I7QUFLbEI7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsdUNBQXVDO0tBQ25ELENBQUM7OzZDQUNXO0FBTWI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSw2QkFBNkI7S0FDekMsQ0FBQzs7K0NBQ2E7QUFNZjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLFdBQVc7S0FDdkIsQ0FBQzs7OENBQ1k7QUFNZDtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLFdBQVc7S0FDdkIsQ0FBQzs7NENBQ1U7QUFNWjtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLGtCQUFrQjtLQUM5QixDQUFDOzsrQ0FDYTtBQU1mO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsZUFBZTtLQUMzQixDQUFDOztrREFDZ0I7QUFNbEI7SUFKQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxVQUFVO0tBQ3RCLENBQUM7OytDQUNhO0FBS2Y7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOztnREFDYztBQUtoQjtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7O2tEQUNnQjtBQUlsQjtJQURDLElBQUEsZ0JBQU0sR0FBRTs4QkFDRyxJQUFJO21EQUFDO0FBSWpCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDOzhCQUNkLElBQUk7b0RBQVE7QUFHekI7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7cURBSWQ7QUFHRDtJQURDLElBQUEsc0JBQVksR0FBRTs7OztpREFHZDtBQXRHUSxlQUFlO0lBRDNCLElBQUEsZ0JBQU0sRUFBQyxvQkFBb0IsQ0FBQztHQUNoQixlQUFlLENBd0czQjtBQXhHWSwwQ0FBZSJ9