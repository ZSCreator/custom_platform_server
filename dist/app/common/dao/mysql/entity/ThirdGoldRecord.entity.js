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
exports.ThirdGoldRecord = void 0;
const typeorm_1 = require("typeorm");
const ThirdGoldRecordType_enum_1 = require("./enum/ThirdGoldRecordType.enum");
const ThirdGoldRecordStatus_enum_1 = require("./enum/ThirdGoldRecordStatus.enum");
let ThirdGoldRecord = class ThirdGoldRecord {
    initCreateDate() {
        this.createDateTime = new Date();
    }
    updateDate() {
        this.updateDateTime = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ThirdGoldRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "order_id",
        comment: "流水号"
    }),
    __metadata("design:type", String)
], ThirdGoldRecord.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", {
        name: "fk_uid",
        comment: "用户编号外键"
    }),
    __metadata("design:type", String)
], ThirdGoldRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ThirdGoldRecordType_enum_1.ThirdGoldRecordType,
        default: ThirdGoldRecordType_enum_1.ThirdGoldRecordType.Player,
        comment: "上下分对象"
    }),
    __metadata("design:type", Number)
], ThirdGoldRecord.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "平台名"
    }),
    __metadata("design:type", String)
], ThirdGoldRecord.prototype, "agentRemark", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "gold_change_before",
        type: "double",
        default: 0,
        comment: "金币变化前数值"
    }),
    __metadata("design:type", Number)
], ThirdGoldRecord.prototype, "goldChangeBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0,
        comment: "金币变化数值"
    }),
    __metadata("design:type", Number)
], ThirdGoldRecord.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0,
        comment: "金币变化后数值"
    }),
    __metadata("design:type", Number)
], ThirdGoldRecord.prototype, "goldChangeAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ThirdGoldRecordStatus_enum_1.ThirdGoldRecordStatus,
        default: ThirdGoldRecordStatus_enum_1.ThirdGoldRecordStatus.WaitingForReview,
        comment: "记录状态"
    }),
    __metadata("design:type", Number)
], ThirdGoldRecord.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        comment: "备注"
    }),
    __metadata("design:type", String)
], ThirdGoldRecord.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], ThirdGoldRecord.prototype, "createDateTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        nullable: true,
        comment: "最近修改时间"
    }),
    __metadata("design:type", Date)
], ThirdGoldRecord.prototype, "updateDateTime", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThirdGoldRecord.prototype, "initCreateDate", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThirdGoldRecord.prototype, "updateDate", null);
ThirdGoldRecord = __decorate([
    (0, typeorm_1.Entity)("Log_ThirdGoldRecord")
], ThirdGoldRecord);
exports.ThirdGoldRecord = ThirdGoldRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRHb2xkUmVjb3JkLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9UaGlyZEdvbGRSZWNvcmQuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQVFpQjtBQUNqQiw4RUFBc0U7QUFDdEUsa0ZBQTBFO0FBSzFFLElBQWEsZUFBZSxHQUE1QixNQUFhLGVBQWU7SUE4RWhCLGNBQWM7UUFDbEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFHTyxVQUFVO1FBQ2QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3JDLENBQUM7Q0FDSixDQUFBO0FBcEZHO0lBREMsSUFBQSxnQ0FBc0IsR0FBRTs7MkNBQ2Q7QUFNWDtJQUpDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxVQUFVO1FBQ2hCLE9BQU8sRUFBRSxLQUFLO0tBQ2pCLENBQUM7O2dEQUNjO0FBTWhCO0lBSkMsSUFBQSxnQkFBTSxFQUFDLFNBQVMsRUFBRTtRQUNmLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLFFBQVE7S0FDcEIsQ0FBQzs7NENBQ1U7QUFRWjtJQU5DLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLDhDQUFtQjtRQUN6QixPQUFPLEVBQUUsOENBQW1CLENBQUMsTUFBTTtRQUNuQyxPQUFPLEVBQUUsT0FBTztLQUNuQixDQUFDOzs2Q0FDVztBQU1iO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsS0FBSztLQUNqQixDQUFDOztvREFDa0I7QUFRcEI7SUFOQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsb0JBQW9CO1FBQzFCLElBQUksRUFBQyxRQUFRO1FBQ2IsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsU0FBUztLQUNyQixDQUFDOzt5REFDdUI7QUFPekI7SUFMQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLFFBQVE7S0FDcEIsQ0FBQzs7NkNBQ1c7QUFPYjtJQUxDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsU0FBUztLQUNyQixDQUFDOzt3REFDc0I7QUFReEI7SUFOQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxrREFBcUI7UUFDM0IsT0FBTyxFQUFFLGtEQUFxQixDQUFDLGdCQUFnQjtRQUMvQyxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzsrQ0FDYTtBQU1mO0lBSkMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsSUFBSTtLQUNoQixDQUFDOzsrQ0FDYTtBQUtmO0lBSEMsSUFBQSwwQkFBZ0IsRUFBQztRQUNkLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OEJBQ2MsSUFBSTt1REFBQztBQU1yQjtJQUpDLElBQUEsMEJBQWdCLEVBQUM7UUFDZCxRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxRQUFRO0tBQ3BCLENBQUM7OEJBQ2MsSUFBSTt1REFBQztBQUdyQjtJQURDLElBQUEsc0JBQVksR0FBRTs7OztxREFHZDtBQUdEO0lBREMsSUFBQSxzQkFBWSxHQUFFOzs7O2lEQUdkO0FBckZRLGVBQWU7SUFEM0IsSUFBQSxnQkFBTSxFQUFDLHFCQUFxQixDQUFDO0dBQ2pCLGVBQWUsQ0FzRjNCO0FBdEZZLDBDQUFlIn0=