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
exports.ControlRecord = void 0;
const typeorm_1 = require("typeorm");
const controlRecordDAO_1 = require("../../../../services/newControl/DAO/controlRecordDAO");
let ControlRecord = class ControlRecord {
    init() {
        this.createTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ControlRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "game_id",
        length: 5,
        nullable: true,
        comment: "游戏编号"
    }),
    __metadata("design:type", String)
], ControlRecord.prototype, "nid", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 50,
        comment: "操作人名字"
    }),
    __metadata("design:type", String)
], ControlRecord.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 2,
        comment: "操作类型 1 类型为场控个人调控 | 2 个人调控总控 | 3 场控",
    }),
    __metadata("design:type", String)
], ControlRecord.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('json', {
        comment: "调控数据详情",
        nullable: true,
    }),
    __metadata("design:type", Object)
], ControlRecord.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        length: 50,
        comment: "备注",
        nullable: true
    }),
    __metadata("design:type", String)
], ControlRecord.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', {
        length: 20,
        comment: "被调控玩家的uid",
        nullable: true
    }),
    __metadata("design:type", String)
], ControlRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], ControlRecord.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ControlRecord.prototype, "init", null);
ControlRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_ControlRecord")
], ControlRecord);
exports.ControlRecord = ControlRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbFJlY29yZC5lbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9lbnRpdHkvQ29udHJvbFJlY29yZC5lbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEscUNBQStFO0FBQy9FLDJGQUF5RjtBQUd6RixJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBb0RkLElBQUk7UUFDUixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztDQUVKLENBQUE7QUFyREc7SUFEQyxJQUFBLGdDQUFzQixHQUFFOzt5Q0FDZDtBQVFYO0lBTkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsTUFBTSxFQUFFLENBQUM7UUFDVCxRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OzBDQUNVO0FBTVo7SUFKQyxJQUFBLGdCQUFNLEVBQUMsU0FBUyxFQUFFO1FBQ2YsTUFBTSxFQUFFLEVBQUU7UUFDVixPQUFPLEVBQUUsT0FBTztLQUNuQixDQUFDOzsyQ0FDVztBQU1iO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTyxFQUFFLG9DQUFvQztLQUNoRCxDQUFDOzsyQ0FDc0I7QUFNeEI7SUFKQyxJQUFBLGdCQUFNLEVBQUMsTUFBTSxFQUFFO1FBQ1osT0FBTyxFQUFFLFFBQVE7UUFDakIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs7MkNBQ1c7QUFRYjtJQUxDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxJQUFJO1FBQ2IsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs7NkNBQ2E7QUFPZjtJQUxDLElBQUEsZ0JBQU0sRUFBQyxTQUFTLEVBQUU7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxXQUFXO1FBQ3BCLFFBQVEsRUFBRSxJQUFJO0tBQ2pCLENBQUM7OzBDQUNVO0FBS1o7SUFIQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNVLElBQUk7aURBQUM7QUFHakI7SUFEQyxJQUFBLHNCQUFZLEdBQUU7Ozs7eUNBR2Q7QUF0RFEsYUFBYTtJQUR6QixJQUFBLGdCQUFNLEVBQUMsa0JBQWtCLENBQUM7R0FDZCxhQUFhLENBd0R6QjtBQXhEWSxzQ0FBYSJ9