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
exports.PlayerRebateRecord = void 0;
const typeorm_1 = require("typeorm");
let PlayerRebateRecord = class PlayerRebateRecord {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlayerRebateRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlayerRebateRecord.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerRebateRecord.prototype, "rebate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlayerRebateRecord.prototype, "rebateUid", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerRebateRecord.prototype, "commission", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PlayerRebateRecord.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "double",
        default: 0
    }),
    __metadata("design:type", Number)
], PlayerRebateRecord.prototype, "rebateProportion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        comment: "创建时间"
    }),
    __metadata("design:type", Date)
], PlayerRebateRecord.prototype, "createDate", void 0);
PlayerRebateRecord = __decorate([
    (0, typeorm_1.Entity)("Sp_PlayerRebateRecord")
], PlayerRebateRecord);
exports.PlayerRebateRecord = PlayerRebateRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyUmViYXRlUmVjb3JkLmVudGl0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL2VudGl0eS9QbGF5ZXJSZWJhdGVSZWNvcmQuZW50aXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUtpQjtBQUtqQixJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFrQjtDQW9DOUIsQ0FBQTtBQWpDRztJQURDLElBQUEsZ0NBQXNCLEdBQUU7OzhDQUNkO0FBSVg7SUFEQyxJQUFBLGdCQUFNLEdBQUU7OytDQUNHO0FBSVo7SUFEQyxJQUFBLGdCQUFNLEVBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7O2tEQUNSO0FBSWY7SUFEQyxJQUFBLGdCQUFNLEdBQUU7O3FEQUNTO0FBSWxCO0lBREMsSUFBQSxnQkFBTSxFQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDOztzREFDSDtBQUluQjtJQURDLElBQUEsZ0JBQU0sRUFBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQzs7aURBQ1I7QUFNZDtJQUhDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLENBQUM7S0FBRSxDQUFDOzs0REFDUTtBQUt6QjtJQUhDLElBQUEsMEJBQWdCLEVBQUM7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzhCQUNVLElBQUk7c0RBQUM7QUFsQ1Isa0JBQWtCO0lBRDlCLElBQUEsZ0JBQU0sRUFBQyx1QkFBdUIsQ0FBQztHQUNuQixrQkFBa0IsQ0FvQzlCO0FBcENZLGdEQUFrQiJ9