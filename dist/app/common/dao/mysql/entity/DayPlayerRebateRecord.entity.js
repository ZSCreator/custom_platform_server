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
exports.DayPlayerRebateRecord = void 0;
const typeorm_1 = require("typeorm");
let DayPlayerRebateRecord = class DayPlayerRebateRecord {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DayPlayerRebateRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DayPlayerRebateRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DayPlayerRebateRecord.prototype, "dayRebate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DayPlayerRebateRecord.prototype, "rebateUid", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], DayPlayerRebateRecord.prototype, "createDate", void 0);
DayPlayerRebateRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_DayPlayerRebateRecord")
], DayPlayerRebateRecord);
exports.DayPlayerRebateRecord = DayPlayerRebateRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF5UGxheWVyUmViYXRlUmVjb3JkLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9EYXlQbGF5ZXJSZWJhdGVSZWNvcmQuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUtpQjtBQUtqQixJQUFhLHFCQUFxQixHQUFsQyxNQUFhLHFCQUFxQjtDQXNCakMsQ0FBQTtBQW5CRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7O2lEQUNkO0FBSVg7SUFEQyxJQUFBLGdCQUFNLEdBQUU7O2tEQUNHO0FBSVo7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O3dEQUNMO0FBSWxCO0lBREMsSUFBQSxnQkFBTSxHQUFFOzt3REFDUztBQUtsQjtJQUhDLElBQUEsMEJBQWdCLEVBQUM7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNVLElBQUk7eURBQUM7QUFwQlIscUJBQXFCO0lBRGpDLElBQUEsZ0JBQU0sRUFBQywwQkFBMEIsQ0FBQztHQUN0QixxQkFBcUIsQ0FzQmpDO0FBdEJZLHNEQUFxQiJ9